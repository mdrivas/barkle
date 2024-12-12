import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { scores } from "~/server/db/schema";
import { eq, and, sql, isNotNull, desc } from "drizzle-orm";
import { users } from "~/server/db/schema";

export const scoreRouter = createTRPCRouter({
  canPlayToday: publicProcedure
    .input(
      z.object({
        tempId: z.string().uuid().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const score = await ctx.db
        .select({
          playedAt: scores.playedAt,
        })
        .from(scores)
        .where(
          and(
            ctx.session?.user?.id
              ? eq(scores.userId, ctx.session.user.id)
              : eq(scores.tempId, input.tempId ?? ""),
            sql`date_trunc('day', ${scores.playedAt} AT TIME ZONE 'America/Los_Angeles') = 
                date_trunc('day', now() AT TIME ZONE 'America/Los_Angeles')`,
          ),
        )
        .limit(1);

      return {
        canPlay: !score.length,
        nextGameTime: !score.length
          ? null
          : new Date(new Date().setHours(24, 0, 0, 0)),
      };
    }),

  saveScore: publicProcedure
    .input(
      z.object({
        score: z.number(),
        tempId: z.string().uuid().optional(),
        results: z.string(),
        currentGuessStreak: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.transaction(async (tx) => {
        // Insert the score
        await tx.insert(scores).values({
          score: input.score,
          userId: ctx.session?.user?.id ?? null,
          tempId: !ctx.session?.user?.id ? (input.tempId ?? null) : null,
          results: input.results,
          playedAt: new Date(),
        });

        // Update user's streaks if they're logged in
        if (ctx.session?.user?.id) {
          const user = await tx.query.users.findFirst({
            where: eq(users.id, ctx.session.user.id),
            columns: {
              lastPlayedAt: true,
              currentDailyStreak: true,
              highestDailyStreak: true,
              currentGuessStreak: true,
              highestGuessStreak: true,
            },
          });

          const now = new Date();
          const lastPlayed = user?.lastPlayedAt;

          // Check if last played was yesterday in PST
          const isConsecutiveDay = lastPlayed
            ? new Date(lastPlayed).toLocaleDateString("en-US", {
                timeZone: "America/Los_Angeles",
              }) ===
              new Date(now.getTime() - 86400000).toLocaleDateString("en-US", {
                timeZone: "America/Los_Angeles",
              })
            : false;

          // Calculate new daily streak
          const newDailyStreak = isConsecutiveDay
            ? (user?.currentDailyStreak ?? 0) + 1
            : 1;
          const newHighestDailyStreak = Math.max(
            newDailyStreak,
            user?.highestDailyStreak ?? 0,
          );

          // Update guess streak
          const newHighestGuessStreak = Math.max(
            input.currentGuessStreak,
            user?.highestGuessStreak ?? 0,
          );

          // Update user
          await tx
            .update(users)
            .set({
              lastPlayedAt: now,
              currentDailyStreak: newDailyStreak,
              highestDailyStreak: newHighestDailyStreak,
              currentGuessStreak: input.currentGuessStreak,
              highestGuessStreak: newHighestGuessStreak,
            })
            .where(eq(users.id, ctx.session.user.id));
        }
      });
    }),

  getTodayScore: publicProcedure
    .input(
      z.object({
        tempId: z.string().uuid().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
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
              : eq(scores.tempId, input.tempId ?? ""),
            sql`date_trunc('day', ${scores.playedAt} AT TIME ZONE 'America/Los_Angeles') = 
                date_trunc('day', now() AT TIME ZONE 'America/Los_Angeles')`,
          ),
        )
        .limit(1);

      if (!score.length) return null;

      return {
        score: score[0]?.score ?? 0,
        results: score[0]?.results ?? "",
      };
    }),

  getTodayGames: publicProcedure.query(async ({ ctx }) => {
    // Count all games played today in PST
    const result = await ctx.db
      .select({
        count: sql<number>`
          (
            SELECT COUNT(*)::int 
            FROM ${scores} 
            WHERE date_trunc('day', played_at AT TIME ZONE 'America/Los_Angeles') = 
                  date_trunc('day', now() AT TIME ZONE 'America/Los_Angeles')
          ) +
          (
            SELECT COALESCE(SUM(pawsistence_plays_today)::int, 0)
            FROM ${users}
            WHERE date_trunc('day', last_pawsistence_at AT TIME ZONE 'America/Los_Angeles') = 
                  date_trunc('day', now() AT TIME ZONE 'America/Los_Angeles')
          )
        `,
      })
      .from(scores);

    return result[0]?.count ?? 0;
  }),

  getDailyLeaderboard: publicProcedure.query(async ({ ctx }) => {
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
          sql`date_trunc('day', ${scores.playedAt} AT TIME ZONE 'America/Los_Angeles') = 
              date_trunc('day', now() AT TIME ZONE 'America/Los_Angeles')`,
          isNotNull(scores.userId),
        ),
      )
      .orderBy(
        desc(scores.score),
        desc(users.currentGuessStreak),
        desc(users.currentDailyStreak),
      )
      .limit(100);
  }),

  getPawsistenceLeaderboard: publicProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select({
        username: users.username,
        highestStreak: users.highestPawsistenceStreak,
      })
      .from(users)
      .where(
        and(
          isNotNull(users.username),
          isNotNull(users.highestPawsistenceStreak),
          sql`${users.highestPawsistenceStreak} > 0`,
        ),
      )
      .orderBy(desc(users.highestPawsistenceStreak))
      .limit(100);
  }),

  getBarkleStats: publicProcedure
    .input(
      z.object({
        userId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      // Count all Barkle games played by this user
      const barkleGames = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(scores)
        .where(eq(scores.userId, input.userId));

      // Get user's daily streak
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, input.userId),
        columns: {
          currentDailyStreak: true,
        },
      });

      return {
        gamesPlayed: Number(barkleGames[0]?.count ?? 0),
        dailyStreak: user?.currentDailyStreak ?? 0,
      };
    }),

  getPawsistenceStats: publicProcedure
    .input(
      z.object({
        userId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      // Get user's Pawsistence stats
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, input.userId),
        columns: {
          currentGuessStreak: true,
          highestGuessStreak: true,
          pawsistencePlaysToday: true,
        },
      });

      return {
        currentStreak: user?.currentGuessStreak ?? 0,
        bestStreak: user?.highestGuessStreak ?? 0,
        playsToday: user?.pawsistencePlaysToday ?? 0,
      };
    }),

  getCurrentStreak: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.session?.user?.id) return 0;

    const user = await ctx.db.query.users.findFirst({
      where: eq(users.id, ctx.session.user.id),
      columns: {
        currentGuessStreak: true,
      },
    });

    return user?.currentGuessStreak ?? 0;
  }),
});
