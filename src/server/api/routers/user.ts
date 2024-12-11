import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { users, scores } from "~/server/db/schema";
import { eq, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { env } from "~/env";

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
      // Get user data
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, ctx.session.user.id),
        columns: {
          username: true,
          image: true,
          currentDailyStreak: true,
          highestDailyStreak: true,
          currentGuessStreak: true,
          highestGuessStreak: true,
          lastPlayedAt: true,
          highestPawsistenceStreak: true,
          pawsistencePlaysToday: true,
          lastPawsistenceAt: true,
        },
      });

      // Count total games
      const gamesCount = await ctx.db
        .select()
        .from(scores)
        .where(eq(scores.userId, ctx.session.user.id));

      // Get latest score to verify streaks
      const latestScore = await ctx.db.query.scores.findFirst({
        where: eq(scores.userId, ctx.session.user.id),
        orderBy: (scores, { desc }) => [desc(scores.playedAt)],
      });

      return {
        ...user,
        gamesPlayed: gamesCount.length,
        currentGuessStreak: user?.currentGuessStreak ?? 0,
        highestGuessStreak: user?.highestGuessStreak ?? 0,
        currentDailyStreak: user?.currentDailyStreak ?? 0,
        highestDailyStreak: user?.highestDailyStreak ?? 0,
        highestPawsistenceStreak: user?.highestPawsistenceStreak ?? 0,
        pawsistencePlaysToday: user?.pawsistencePlaysToday ?? 0,
      };
    }),
  updateProfileImage: protectedProcedure
    .input(z.object({
      imageUrl: z.string().url(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Update validation to use correct bucket name
      if (!input.imageUrl.includes('profile_pics_barkle')) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid image URL",
        });
      }

      await ctx.db
        .update(users)
        .set({ image: input.imageUrl })
        .where(eq(users.id, ctx.session.user.id));

      return { success: true, imageUrl: input.imageUrl };
    }),
  isAdmin: protectedProcedure
    .query(({ ctx }) => {
      const adminEmails = env.ADMIN_EMAILS.split(",");
      return adminEmails.includes(ctx.session.user.email ?? "");
    }),
}); 