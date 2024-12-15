import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { scores } from "~/server/db/schema";
import { eq, and, sql, isNotNull, desc, or } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { profiles } from "~/server/db/schema";

export const scoreRouter = createTRPCRouter({
  canPlayToday: publicProcedure
    .input(
      z.object({
        tempId: z.string().uuid().nullable(),
      }),
    )
    .query(async ({ ctx, input }) => {
      // First find the profile to get both userId and tempId
      const profile = await ctx.db.query.profiles.findFirst({
        where: or(
          ctx.session?.user?.id
            ? eq(profiles.userId, ctx.session.user.id)
            : undefined,
          input.tempId ? eq(profiles.tempId, input.tempId) : undefined,
        ),
      });

      if (!profile) return { canPlay: true };

      // Check scores with either userId or tempId
      const score = await ctx.db
        .select({
          playedAt: scores.playedAt,
        })
        .from(scores)
        .where(
          and(
            or(
              profile.userId ? eq(scores.userId, profile.userId) : undefined,
              profile.tempId ? eq(scores.tempId, profile.tempId) : undefined,
            ),
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
  // TODO: Allow temp id users to save stats like current guess streak, daily streak, etc.
  saveScore: publicProcedure
    .input(
      z.object({
        score: z.number(),
        tempId: z.string().uuid().nullable(),
        results: z.string(),
        currentGuessStreak: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.transaction(async (tx) => {
        // Find the profile first
        const profile = await tx.query.profiles.findFirst({
          where: or(
            ctx.session?.user?.id
              ? eq(profiles.userId, ctx.session.user.id)
              : undefined,
            input.tempId ? eq(profiles.tempId, input.tempId) : undefined,
          ),
        });

        if (!profile) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Profile not found",
          });
        }

        // If user is logged in and tempId exists, try to update existing score
        if (ctx.session?.user?.id && input.tempId) {
          // First try to find and update existing score with tempId
          const existingScore = await tx
            .update(scores)
            .set({
              userId: ctx.session.user.id,
              tempId: null, // Clear the tempId since we now have a userId
            })
            .where(
              and(
                eq(scores.tempId, input.tempId),
                sql`date_trunc('day', ${scores.playedAt} AT TIME ZONE 'America/Los_Angeles') = 
                    date_trunc('day', now() AT TIME ZONE 'America/Los_Angeles')`,
              ),
            )
            .returning();

          // If we found and updated a score, update profile stats
          if (existingScore.length > 0) {
            const now = new Date();
            const lastPlayed = profile.lastPlayedAt;

            const isConsecutiveDay = lastPlayed
              ? new Date(lastPlayed).toLocaleDateString("en-US", {
                  timeZone: "America/Los_Angeles",
                }) ===
                new Date(now.getTime() - 86400000).toLocaleDateString("en-US", {
                  timeZone: "America/Los_Angeles",
                })
              : false;

            const newDailyStreak = isConsecutiveDay
              ? (profile.currentDailyStreak ?? 0) + 1
              : 1;
            const newHighestDailyStreak = Math.max(
              newDailyStreak,
              profile.highestDailyStreak ?? 0,
            );
            const newHighestGuessStreak = Math.max(
              input.currentGuessStreak,
              profile.highestGuessStreak ?? 0,
            );

            await tx
              .update(profiles)
              .set({
                lastPlayedAt: now,
                currentDailyStreak: newDailyStreak,
                highestDailyStreak: newHighestDailyStreak,
                currentGuessStreak: input.currentGuessStreak,
                highestGuessStreak: newHighestGuessStreak,
              })
              .where(eq(profiles.id, profile.id));

            return; // Exit early since we've handled everything
          }
        }

        // If no existing score was updated, insert new score
        await tx.insert(scores).values({
          score: input.score,
          userId: ctx.session?.user?.id ?? null,
          tempId: !ctx.session?.user?.id ? (input.tempId ?? null) : null,
          results: input.results,
          playedAt: new Date(),
        });

        // Update profile stats for all users (including temp users)
        const now = new Date();
        const lastPlayed = profile.lastPlayedAt;

        const isConsecutiveDay = lastPlayed
          ? new Date(lastPlayed).toLocaleDateString("en-US", {
              timeZone: "America/Los_Angeles",
            }) ===
            new Date(now.getTime() - 86400000).toLocaleDateString("en-US", {
              timeZone: "America/Los_Angeles",
            })
          : false;

        const newDailyStreak = isConsecutiveDay
          ? (profile.currentDailyStreak ?? 0) + 1
          : 1;
        const newHighestDailyStreak = Math.max(
          newDailyStreak,
          profile.highestDailyStreak ?? 0,
        );
        const newHighestGuessStreak = Math.max(
          input.currentGuessStreak,
          profile.highestGuessStreak ?? 0,
        );

        await tx
          .update(profiles)
          .set({
            lastPlayedAt: now,
            currentDailyStreak: newDailyStreak,
            highestDailyStreak: newHighestDailyStreak,
            currentGuessStreak: input.currentGuessStreak,
            highestGuessStreak: newHighestGuessStreak,
          })
          .where(eq(profiles.id, profile.id));
      });
    }),

  getTodayScore: publicProcedure
    .input(
      z.object({
        tempId: z.string().uuid().nullable(),
      }),
    )
    .query(async ({ ctx, input }) => {
      // First find the profile to get both userId and tempId
      const profile = await ctx.db.query.profiles.findFirst({
        where: or(
          ctx.session?.user?.id
            ? eq(profiles.userId, ctx.session.user.id)
            : undefined,
          input.tempId ? eq(profiles.tempId, input.tempId) : undefined,
        ),
      });

      if (!profile) return null;

      // Check scores with either userId or tempId
      const score = await ctx.db
        .select({
          score: scores.score,
          results: scores.results,
        })
        .from(scores)
        .where(
          and(
            or(
              profile.userId ? eq(scores.userId, profile.userId) : undefined,
              profile.tempId ? eq(scores.tempId, profile.tempId) : undefined,
            ),
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
            FROM ${profiles}
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
        username: profiles.username,
        score: scores.score,
        currentStreak: profiles.currentGuessStreak,
        dailyStreak: profiles.currentDailyStreak,
        userId: scores.userId,
        tempId: scores.tempId,
        isVerified: profiles.isVerified,
      })
      .from(scores)
      .leftJoin(
        profiles,
        or(
          and(isNotNull(scores.userId), eq(scores.userId, profiles.userId)),
          and(isNotNull(scores.tempId), eq(scores.tempId, profiles.tempId)),
        ),
      )
      .where(
        and(
          sql`date_trunc('day', ${scores.playedAt} AT TIME ZONE 'America/Los_Angeles') = 
                date_trunc('day', now() AT TIME ZONE 'America/Los_Angeles')`,
          isNotNull(profiles.username),
        ),
      )
      .orderBy(
        desc(scores.score),
        desc(profiles.currentGuessStreak),
        desc(profiles.currentDailyStreak),
      )
      .limit(100);
  }),

  getPawsistenceLeaderboard: publicProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select({
        username: profiles.username,
        highestStreak: profiles.highestPawsistenceStreak,
        userId: profiles.userId,
        tempId: profiles.tempId,
        isVerified: profiles.isVerified,
      })
      .from(profiles)
      .where(
        and(
          isNotNull(profiles.username),
          isNotNull(profiles.highestPawsistenceStreak),
          sql`${profiles.highestPawsistenceStreak} > 0`,
          // Include either users with userId OR tempId
          or(isNotNull(profiles.userId), isNotNull(profiles.tempId)),
        ),
      )
      .orderBy(desc(profiles.highestPawsistenceStreak))
      .limit(100);
  }),
  // TODO: Take out userId from input, change to protected procedure
  getBarkleStats: protectedProcedure.query(async ({ ctx }) => {
    // Get all stats from profile
    const profile = await ctx.db.query.profiles.findFirst({
      where: eq(profiles.userId, ctx.session.user.id),
      columns: {
        currentDailyStreak: true,
        highestDailyStreak: true,
        currentGuessStreak: true,
        highestGuessStreak: true,
      },
    });

    // Count all Barkle games played by this user
    const barkleGames = await ctx.db
      .select({
        count: sql<number>`count(*)::int`,
      })
      .from(scores)
      .where(eq(scores.userId, ctx.session.user.id));

    return {
      gamesPlayed: Number(barkleGames[0]?.count ?? 0),
      dailyStreak: profile?.currentDailyStreak ?? 0,
      currentGuessStreak: profile?.currentGuessStreak ?? 0,
      highestGuessStreak: profile?.highestGuessStreak ?? 0,
    };
  }),
  // TODO: Take out userId from input, change to protected procedure
  getPawsistenceStats: protectedProcedure.query(async ({ ctx }) => {
    const profile = await ctx.db.query.profiles.findFirst({
      where: eq(profiles.userId, ctx.session.user.id),
      columns: {
        currentGuessStreak: true,
        highestPawsistenceStreak: true,
        pawsistencePlaysToday: true,
      },
    });

    return {
      currentStreak: profile?.currentGuessStreak ?? 0,
      bestStreak: profile?.highestPawsistenceStreak ?? 0,
      playsToday: profile?.pawsistencePlaysToday ?? 0,
    };
  }),
  // Need temp id optional if user is temp id , check first session, if doesnt exist user
  getCurrentStreak: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.session?.user?.id) return 0;

    const user = await ctx.db.query.profiles.findFirst({
      where: eq(profiles.userId, ctx.session.user.id),
      columns: {
        currentGuessStreak: true,
      },
    });

    return user?.currentGuessStreak ?? 0;
  }),
});
