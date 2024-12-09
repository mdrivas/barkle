import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { users, scores } from "~/server/db/schema";
import { eq, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const userRouter = createTRPCRouter({
  setUsername: protectedProcedure
    .input(z.object({
      username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_-]+$/),
    }))
    .mutation(async ({ ctx, input }) => {
      // Check if username is taken
      const existing = await ctx.db.query.users.findFirst({
        where: eq(users.username, input.username),
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Username already taken",
        });
      }

      // Update user's username
      await ctx.db
        .update(users)
        .set({ username: input.username })
        .where(eq(users.id, ctx.session.user.id));

      return { success: true };
    }),
  getProfile: protectedProcedure
    .query(async ({ ctx }) => {
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, ctx.session.user.id),
        columns: {
          username: true,
          image: true,
          currentDailyStreak: true,
          highestDailyStreak: true,
        },
      });

      // Count games played with explicit count
      const gamesCount = await ctx.db
        .select()
        .from(scores)
        .where(eq(scores.userId, ctx.session.user.id));

      return {
        ...user,
        gamesPlayed: gamesCount.length,
      };
    }),
  updateProfileImage: protectedProcedure
    .input(z.object({
      imageUrl: z.string().url(),
    }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(users)
        .set({ image: input.imageUrl })
        .where(eq(users.id, ctx.session.user.id));

      return { success: true };
    }),
}); 