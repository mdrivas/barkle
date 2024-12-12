import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { users, scores } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const userRouter = createTRPCRouter({
  setUsername: protectedProcedure
    .input(
      z.object({
        username: z
          .string()
          .min(3)
          .max(30)
          .regex(/^[a-zA-Z0-9_-]+$/),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db
          .update(users)
          .set({ username: input.username })
          .where(eq(users.id, ctx.session.user.id));

        return { success: true };
      } catch (error) {
        // Check if error is a unique constraint violation
        if (
          error instanceof Error &&
          error.message.includes("unique constraint")
        ) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Username already taken",
          });
        }
        // Re-throw other errors
        throw error;
      }
    }),
  getProfile: protectedProcedure.query(async ({ ctx }) => {
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
    .input(
      z.object({
        imageUrl: z.string().url(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Update validation to use correct bucket name
      if (!input.imageUrl.includes("profile_pics_barkle")) {
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
  isAdmin: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.query.users.findFirst({
      where: eq(users.id, ctx.session.user.id),
      columns: {
        isAdmin: true,
      },
    });
    return user?.isAdmin ?? false;
  }),

  needsUsername: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.query.users.findFirst({
      where: eq(users.id, ctx.session.user.id),
      columns: {
        username: true,
        lastPlayedAt: true,
      },
    });

    return {
      needsUsername: !user?.username,
      isNewUser: !user?.lastPlayedAt,
    };
  }),
});
