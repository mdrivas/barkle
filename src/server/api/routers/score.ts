import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";
import { scores } from "~/server/db/schema";
import { eq, and, gte, sql, isNotNull, desc, asc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { users } from "~/server/db/schema";

export const scoreRouter = createTRPCRouter({
  canPlayToday: publicProcedure
    .input(z.object({ 
      tempId: z.string().uuid().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

      const recentScores = await ctx.db
        .select()
        .from(scores)
        .where(
          and(
            ctx.session?.user?.id
              ? eq(scores.userId, ctx.session.user.id)
              : eq(scores.tempId, input.tempId ?? ''),
            eq(scores.playDate, today!)
          )
        )
        .limit(1);

      return {
        canPlay: recentScores.length === 0,
        lastPlayedDate: recentScores[0]?.playDate ?? null
      };
    }),

    saveScore: publicProcedure
    .input(z.object({
      score: z.number(),
      tempId: z.string().uuid().optional(),
      results: z.string(),
      currentGuessStreak: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const today = new Date().toISOString().split('T')[0];

      // Save the score with today's date
      await ctx.db.insert(scores).values({
        score: input.score,
        userId: ctx.session?.user?.id ?? null,
        tempId: !ctx.session?.user?.id ? (input.tempId ?? null) : null,
        results: input.results,
        playDate: today!
      });

      // Update user stats if authenticated
      if (ctx.session?.user?.id) {
        const user = await ctx.db.query.users.findFirst({
          where: eq(users.id, ctx.session.user.id),
        });

        if (user) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayString = yesterday.toISOString().split('T')[0];

          // Calculate new daily streak
          let newDailyStreak = 1;
          if (user.lastPlayedDate === yesterdayString) {
            newDailyStreak = (user.currentDailyStreak ?? 0) + 1;
          }

          await ctx.db
            .update(users)
            .set({
              currentDailyStreak: newDailyStreak,
              highestDailyStreak: Math.max(newDailyStreak, user.highestDailyStreak ?? 0),
              currentGuessStreak: input.currentGuessStreak,
              highestGuessStreak: Math.max(input.currentGuessStreak, user.highestGuessStreak ?? 0),
              lastPlayedDate: today,
            })
            .where(eq(users.id, ctx.session.user.id));
        }
      }
    }),

  getTodayScore: publicProcedure
    .input(z.object({
      tempId: z.string().uuid().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const today = new Date().toISOString().split('T')[0];

      const score = await ctx.db
        .select({
          score: scores.score,
          results: scores.results,
        })
        .from(scores)
        .where(
          and(
            ctx.session?.user?.id
              ? eq(scores.userId, ctx.session.user.id)
              : eq(scores.tempId, input.tempId ?? ''),
            eq(scores.playDate, today!)
          )
        )
        .limit(1);

      // If no score found, return null instead of default values
      if (!score.length) return null;

      // Return the actual score data
      return {
        score: score[0]?.score ?? 0,
        results: score[0]?.results ?? ''
      };
    }),

  getTodayGames: publicProcedure
    .input(z.object({ timezone: z.number() }))
    .query(async ({ ctx }) => {
      const today = new Date().toISOString().split('T')[0];

      const gamesCount = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(scores)
        .where(eq(scores.playDate, today!));

      return gamesCount[0]?.count ?? 0;
    }),

  getDailyLeaderboard: publicProcedure
    .input(z.object({ timezone: z.number() }))
    .query(async ({ ctx }) => {
      const today = new Date().toISOString().split('T')[0];

      return ctx.db
        .select({
          username: users.username,
          score: scores.score,
          currentStreak: users.currentGuessStreak,
          dailyStreak: users.currentDailyStreak,
          userId: scores.userId,
        })
        .from(scores)
        .leftJoin(users, eq(scores.userId, users.id))
        .where(
          and(
            eq(scores.playDate, today!),
            isNotNull(scores.userId)
          )
        )
        .orderBy(
          desc(scores.score),
          desc(users.currentGuessStreak),
          desc(users.currentDailyStreak)
        )
        .limit(100);
    }),

  getPawsistenceLeaderboard: publicProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select({
        username: users.username,
        highestStreak: users.highestPawsistenceStreak,
        pawsistencePlaysToday: users.pawsistencePlaysToday,
      })
      .from(users)
      .where(
        and(
          isNotNull(users.username),
          isNotNull(users.highestPawsistenceStreak),
          sql`${users.highestPawsistenceStreak} > 0`
        )
      )
      .orderBy(desc(users.highestPawsistenceStreak))
      .limit(100);
  }),
}); 