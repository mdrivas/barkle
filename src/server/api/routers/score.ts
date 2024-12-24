import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { scores } from "~/server/db/schema";
import { eq, and, sql, isNotNull, desc, or, gt } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { profiles } from "~/server/db/schema";
import { toPST, isConsecutiveDay } from "~/lib/streaks";
import { achievements, userAchievements } from "~/server/db/schema";
import { dogSubmissions } from "~/server/db/schema";

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

      // Use PST for date comparison
      const now = toPST(new Date());
      
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

      const nextGameTime = now.startOf('day').plus({ days: 1 }).toJSDate();

      return {
        canPlay: !score.length,
        nextGameTime: !score.length ? null : nextGameTime,
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
        highestGuessStreak: z.number(),
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

        const now = new Date();
        const lastPlayed = profile.lastPlayedAt;

        // Check if this is a consecutive day using our utility function
        const isConsecutive = isConsecutiveDay(lastPlayed, now);
        const newDailyStreak = isConsecutive 
          ? (profile.currentDailyStreak ?? 0) + 1 
          : 1;

        const newHighestDailyStreak = Math.max(
          newDailyStreak,
          profile.highestDailyStreak ?? 0,
        );

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
            await tx
              .update(profiles)
              .set({
                lastPlayedAt: now,
                currentDailyStreak: newDailyStreak,
                highestDailyStreak: newHighestDailyStreak,
                currentGuessStreak: input.currentGuessStreak,
                highestGuessStreak: Math.max(
                  input.highestGuessStreak,
                  profile.highestGuessStreak ?? 0,
                ),
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
        await tx
          .update(profiles)
          .set({
            lastPlayedAt: now,
            currentDailyStreak: newDailyStreak,
            highestDailyStreak: newHighestDailyStreak,
            currentGuessStreak: input.currentGuessStreak,
            highestGuessStreak: Math.max(
              input.highestGuessStreak,
              profile.highestGuessStreak ?? 0,
            ),
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
          ) +
          (
            SELECT COALESCE(SUM(pawpulation_plays_today)::int, 0)
            FROM ${profiles}
            WHERE date_trunc('day', last_pawpulation_at AT TIME ZONE 'America/Los_Angeles') = 
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
        achievements: sql<string[]>`
          array_remove(array_agg(distinct ${achievements.type}), null)::text[]
        `,
      })
      .from(scores)
      .leftJoin(
        profiles,
        or(
          and(isNotNull(scores.userId), eq(scores.userId, profiles.userId)),
          and(isNotNull(scores.tempId), eq(scores.tempId, profiles.tempId)),
        ),
      )
      .leftJoin(
        userAchievements,
        eq(userAchievements.userId, profiles.userId)
      )
      .leftJoin(
        achievements,
        eq(achievements.id, userAchievements.achievementId)
      )
      .where(
        sql`date_trunc('day', ${scores.playedAt} AT TIME ZONE 'America/Los_Angeles') = 
            date_trunc('day', now() AT TIME ZONE 'America/Los_Angeles')`
      )
      .groupBy(
        profiles.username,
        scores.score,
        profiles.currentGuessStreak,
        profiles.currentDailyStreak,
        scores.userId,
        scores.tempId,
        profiles.isVerified,
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
        achievements: sql<string[]>`
          array_remove(array_agg(distinct ${achievements.type}), null)::text[]
        `,
      })
      .from(profiles)
      .leftJoin(
        userAchievements,
        eq(userAchievements.userId, profiles.userId)
      )
      .leftJoin(
        achievements,
        eq(achievements.id, userAchievements.achievementId)
      )
      .where(
        gt(profiles.highestPawsistenceStreak, 0)
      )
      .groupBy(
        profiles.username,
        profiles.highestPawsistenceStreak,
        profiles.userId,
        profiles.tempId,
        profiles.isVerified,
      )
      .orderBy(desc(profiles.highestPawsistenceStreak))
      .limit(100);
  }),

  getPawpulationLeaderboard: publicProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select({
        username: profiles.username,
        score: profiles.pawpulationHighScore,
        totalPlays: profiles.pawpulationGamesPlayed,
        userId: profiles.userId,
        tempId: profiles.tempId,
        isVerified: profiles.isVerified,
        achievements: sql<string[]>`
          array_remove(array_agg(distinct ${achievements.type}), null)::text[]
        `,
      })
      .from(profiles)
      .leftJoin(
        userAchievements,
        eq(userAchievements.userId, profiles.userId)
      )
      .leftJoin(
        achievements,
        eq(achievements.id, userAchievements.achievementId)
      )
      .where(
        gt(profiles.pawpulationHighScore, 0)
      )
      .groupBy(
        profiles.username,
        profiles.pawpulationHighScore,
        profiles.pawpulationGamesPlayed,
        profiles.userId,
        profiles.tempId,
        profiles.isVerified,
      )
      .orderBy(desc(profiles.pawpulationHighScore))
      .limit(100);
  }),
  // TODO: Take out userId from input, change to protected procedure
  getBarkleStats: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.transaction(async (tx) => {
      // Get user profile stats
      const profile = await tx.query.profiles.findFirst({
        where: eq(profiles.userId, ctx.session.user.id),
        columns: {
          currentDailyStreak: true,
          highestDailyStreak: true,
          currentGuessStreak: true,
          highestGuessStreak: true,
          highestPawsistenceStreak: true,
        },
      });

      // Check for verified dog submissions
      const dogSubmission = await tx.query.dogSubmissions.findFirst({
        where: and(
          eq(dogSubmissions.userId, ctx.session.user.id),
          eq(dogSubmissions.status, "verified"),
        ),
      });

      // Define all achievements to check
      const achievementsToCheck = [
        {
          type: "STREAK_RARE",
          requirement: 10,
          value: profile?.highestGuessStreak ?? 0,
        },
        {
          type: "DAILY_COMMON",
          requirement: 4,
          value: profile?.currentDailyStreak ?? 0,
        },
        
        {
          type: "SOCIAL_COMMON",
          requirement: 1,
          value: 1,
        },
        {
          type: "COMMUNITY_COMMON",
          requirement: 1,
          value: dogSubmission ? 1 : 0,
        },
        {
          type: "PAWSISTENCE_RARE",
          requirement: 15,
          value: profile?.highestPawsistenceStreak ?? 0,
        },
        {
          type: "DAILY_LEGENDARY",
          requirement: 10,
          value: profile?.currentDailyStreak ?? 0,
        },
        {
          type: "STREAK_LEGENDARY",
          requirement: 20,
          value: profile?.highestGuessStreak ?? 0,
        },
      ] as const;

      // Check and award all achievements
      for (const check of achievementsToCheck) {
        if (check.value >= check.requirement) {
          const achievement = await tx.query.achievements.findFirst({
            where: eq(achievements.type, check.type),
          });

          if (achievement) {
            await tx.insert(userAchievements)
              .values({
                userId: ctx.session.user.id,
                achievementId: achievement.id,
              })
              .onConflictDoNothing();
          }
        }
      }

      // Count all games played
      const barkleGames = await tx.query.scores.findMany({
        where: eq(scores.userId, ctx.session.user.id),
        columns: {
          id: true,
        },
      });

      // Get all achievements with unlock status, ordered by rarity
      const allAchievements = await tx.query.achievements.findMany({
        orderBy: [
          // Custom rarity order: legendary > rare > common
          sql`CASE 
            WHEN ${achievements.rarity} = 'legendary' THEN 1
            WHEN ${achievements.rarity} = 'rare' THEN 2
            ELSE 3
          END`,
          // Then by name within each rarity level
          achievements.name,
        ],
      });

      const userAchievementsList = await tx.query.userAchievements.findMany({
        where: eq(userAchievements.userId, ctx.session.user.id),
      });


      return {
        gamesPlayed: barkleGames.length,
        dailyStreak: profile?.currentDailyStreak ?? 0,
        currentGuessStreak: profile?.currentGuessStreak ?? 0,
        highestGuessStreak: profile?.highestGuessStreak ?? 0,
        achievements: allAchievements.map(achievement => ({
          ...achievement,
          isUnlocked: userAchievementsList.some(ua => ua.achievementId === achievement.id),
          unlockedAt: userAchievementsList.find(ua => ua.achievementId === achievement.id)?.unlockedAt,
        })),
      };
    });
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
  getCurrentStreak: publicProcedure
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
        columns: {
          currentGuessStreak: true,
          highestGuessStreak: true,
        },
      });

      return {
        currentStreak: profile?.currentGuessStreak ?? 0,
        highestStreak: profile?.highestGuessStreak ?? 0,
      };
    }),
  getMonthlyLeaderboard: publicProcedure
    .input(
      z.object({
        month: z.string().regex(/^\d{4}-\d{2}$/), // Format: "2024-01"
      })
    )
    .query(async ({ ctx, input }) => {
      const [year, month] = input.month.split('-').map(Number);
      
      return await ctx.db
        .select({
          username: profiles.username,
          isVerified: profiles.isVerified,
          totalScore: sql<number>`SUM(${scores.score})`,
          gamesPlayed: sql<number>`COUNT(${scores.id})`,
          averageScore: sql<number>`ROUND(AVG(${scores.score})::numeric, 2)`,
          userId: profiles.userId,
          tempId: profiles.tempId,
          achievements: sql<string[]>`
            array_remove(array_agg(distinct ${achievements.type}), null)::text[]
          `,
        })
        .from(scores)
        .innerJoin(
          profiles,
          eq(scores.userId, profiles.userId)
        )
        .leftJoin(
          userAchievements,
          eq(userAchievements.userId, profiles.userId)
        )
        .leftJoin(
          achievements,
          eq(achievements.id, userAchievements.achievementId)
        )
        .where(
          and(
            sql`EXTRACT(YEAR FROM ${scores.playedAt}) = ${year}`,
            sql`EXTRACT(MONTH FROM ${scores.playedAt}) = ${month}`,
            isNotNull(scores.userId)
          )
        )
        .groupBy(
          profiles.username,
          profiles.isVerified,
          profiles.userId,
          profiles.tempId
        )
        .orderBy(
          desc(sql<number>`SUM(${scores.score})`),
          desc(sql<number>`COUNT(${scores.id})`)
        )
        .limit(10);
    }),
});
