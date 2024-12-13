import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import { profiles } from "~/server/db/schema";
import { eq, or } from "drizzle-orm";
import { scores } from "~/server/db/schema";

export const profileRouter = createTRPCRouter({
  // Get profile by userId or tempId
  getProfile: publicProcedure
    .input(z.object({
      tempId: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session?.user.id;
      
      if (!userId && !input.tempId) return null;

      return await ctx.db.query.profiles.findFirst({
        where: or(
          userId ? eq(profiles.userId, userId) : undefined,
          input.tempId ? eq(profiles.tempId, input.tempId) : undefined,
        ),
      });
    }),

  // Create profile for non-authenticated users
  createTempProfile: publicProcedure
    .input(z.object({
      username: z.string().min(1).max(30),
      tempId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Check if username is taken
      const existing = await ctx.db.query.profiles.findFirst({
        where: eq(profiles.username, input.username),
      });

      if (existing) {
        throw new Error("Username already taken");
      }

      return await ctx.db.insert(profiles).values({
        username: input.username,
        tempId: input.tempId,
      });
    }),

  // Update profile with userId after auth
  attachUserId: protectedProcedure
    .input(z.object({
      tempId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db
        .update(profiles)
        .set({ 
          userId: ctx.session.user.id,
          // Optionally clear tempId if you don't need it anymore
          // tempId: null, 
        })
        .where(eq(profiles.tempId, input.tempId));
    }),

  migrateProfile: protectedProcedure
    .input(z.object({
      tempId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.transaction(async (tx) => {
        // Update profile with userId but keep tempId
        await tx
          .update(profiles)
          .set({ 
            userId: ctx.session.user.id,
          })
          .where(eq(profiles.tempId, input.tempId));

        // Update scores with userId but keep tempId
        await tx
          .update(scores)
          .set({ 
            userId: ctx.session.user.id,
          })
          .where(eq(scores.tempId, input.tempId));

        return true;
      });
    }),
}); 