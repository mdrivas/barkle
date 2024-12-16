import { createTRPCRouter, protectedProcedure } from "../trpc";
import { achievements, userAchievements, profiles } from "~/server/db/schema";
import { eq, and } from "drizzle-orm";

export const achievementRouter = createTRPCRouter({
  getUserAchievements: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.transaction(async (tx) => {
      // Get user profile stats
      const profile = await tx.query.profiles.findFirst({
        where: eq(profiles.userId, ctx.session.user.id),
        columns: {
          currentDailyStreak: true,
          highestGuessStreak: true,
        },
      });

      // Check and award achievements
      const achievementsToCheck = [
        // Daily Streak Achievement
        {
          type: "STREAK" as const,
          requirement: 7,
          value: profile?.currentDailyStreak ?? 0,
          name: "Daily Streak Achievement"
        },
        // Guess Streak Achievement
        {
          type: "STREAK" as const,
          requirement: 5,
          value: profile?.highestGuessStreak ?? 0,
          name: "Guess Streak Achievement"
        }
      ];

      // Award any new achievements
      for (const check of achievementsToCheck) {
        if (check.value >= check.requirement) {
          const achievement = await tx.query.achievements.findFirst({
            where: and(
              eq(achievements.type, check.type),
              eq(achievements.requirement, check.requirement)
            ),
          });

          if (achievement) {
            // Award if not already awarded
            await tx.insert(userAchievements)
              .values({
                userId: ctx.session.user.id,
                achievementId: achievement.id,
              })
              .onConflictDoNothing();
          }
        }
      }

      // Get all achievements with unlock status
      const userAchievementsList = await tx.query.userAchievements.findMany({
        where: eq(userAchievements.userId, ctx.session.user.id),
        with: {
          achievement: true,
        },
      });

      const allAchievements = await tx.query.achievements.findMany();

      return allAchievements.map(achievement => ({
        ...achievement,
        isUnlocked: userAchievementsList.some(
          ua => ua.achievementId === achievement.id
        ),
        unlockedAt: userAchievementsList.find(
          ua => ua.achievementId === achievement.id
        )?.unlockedAt,
      }));
    });
  }),

  trackShare: protectedProcedure.mutation(async ({ ctx }) => {
    // Check if user has already unlocked the sharing achievement
    const shareAchievement = await ctx.db.query.achievements.findFirst({
      where: (a, { eq }) => eq(a.type, 'SOCIAL'),
    });

    if (!shareAchievement) return;

    // Award the achievement if not already awarded
    await ctx.db.insert(userAchievements).values({
      userId: ctx.session.user.id,
      achievementId: shareAchievement.id,
    }).onConflictDoNothing();
  }),
});
