import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { users, scores, profiles } from "~/server/db/schema";
import { eq, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { env } from "~/env";

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
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    // Get profile data with user image
    const profile = await ctx.db.query.profiles.findFirst({
      where: eq(profiles.userId, ctx.session.user.id),
      with: {
        user: {
          columns: {
            image: true,
          },
        },
      },
      columns: {
        username: true,
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
      ...profile,
      image: profile?.user?.image,
      gamesPlayed: gamesCount.length,
      currentGuessStreak: profile?.currentGuessStreak ?? 0,
      highestGuessStreak: profile?.highestGuessStreak ?? 0,
      currentDailyStreak: profile?.currentDailyStreak ?? 0,
      highestDailyStreak: profile?.highestDailyStreak ?? 0,
      highestPawsistenceStreak: profile?.highestPawsistenceStreak ?? 0,
      pawsistencePlaysToday: profile?.pawsistencePlaysToday ?? 0,
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
    const profile = await ctx.db.query.profiles.findFirst({
      where: eq(profiles.userId, ctx.session.user.id),
      columns: {
        username: true,
        lastPlayedAt: true,
      },
    });

    return {
      needsUsername: !profile?.username,
      isNewUser: !profile?.lastPlayedAt,
    };
  }),
});
