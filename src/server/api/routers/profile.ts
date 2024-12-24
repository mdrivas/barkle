import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import { profiles } from "~/server/db/schema";
import { eq, or, and, not } from "drizzle-orm";
import { scores } from "~/server/db/schema";
import { TRPCError } from "@trpc/server";

export const profileRouter = createTRPCRouter({
  // Get profile by userId or tempId
  getProfile: publicProcedure
    .input(
      z.object({
        tempId: z.string().uuid().nullable(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session?.user.id;

      if (!userId && !input.tempId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Improper request",
        });
      }

      const profile = await ctx.db.query.profiles.findFirst({
        where: or(
          userId ? eq(profiles.userId, userId) : undefined,
          input.tempId ? eq(profiles.tempId, input.tempId) : undefined,
        ),
        columns: {
          username: true,
          profileImageUrl: true,
          pawpulationGamesPlayed: true,
          pawpulationHighScore: true,
          pawpulationPlaysToday: true,
          currentGuessStreak: true,
          highestGuessStreak: true,
          pawsistencePlaysToday: true,
          highestPawsistenceStreak: true,
        },
      });

      return profile ?? null;
    }),

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
      const existing = await ctx.db.query.profiles.findFirst({
        where: eq(profiles.username, input.username),
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Username already taken",
        });
      }

      // Update user's username
      await ctx.db
        .update(profiles)
        .set({ username: input.username })
        .where(eq(profiles.userId, ctx.session.user.id));

      return { success: true };
    }),

    updateUsername: protectedProcedure
  .input(
    z.object({
      username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_-]+$/),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    // Check if username is taken by another user
    const existing = await ctx.db.query.profiles.findFirst({
      where: and(
        eq(profiles.username, input.username),
        not(eq(profiles.userId, ctx.session.user.id))
      ),
    });

    if (existing) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "Username already taken",
      });
    }

    await ctx.db
      .update(profiles)
      .set({ username: input.username })
      .where(eq(profiles.userId, ctx.session.user.id));

    return { success: true };
  }),

  // Create profile for non-authenticated users
  createTempProfile: publicProcedure
    .input(
      z.object({
        username: z.string().min(1).max(30),
        tempId: z.string(),
      }),
    )
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
    .input(
      z.object({
        tempId: z.string(),
      }),
    )
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

  migrateOrCreateProfile: protectedProcedure
    .input(
      z.object({
        tempId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.transaction(async (tx) => {
        // First, check if there's an existing profile with userId
        const existingUserProfile = await tx.query.profiles.findFirst({
          where: eq(profiles.userId, ctx.session.user.id),
        });

        if (existingUserProfile) {
          // User already has a profile, just migrate any scores
          await tx
            .update(scores)
            .set({
              userId: ctx.session.user.id,
              tempId: null,
            })
            .where(eq(scores.tempId, input.tempId));
          return true;
        }

        // Try to find and migrate temporary profile
        const tempProfile = await tx.query.profiles.findFirst({
          where: eq(profiles.tempId, input.tempId),
        });

        if (tempProfile) {
          // Migrate existing temporary profile
          await tx
            .update(profiles)
            .set({
              userId: ctx.session.user.id,
              profileImageUrl: "/avatars/dogav1.png",
              tempId: null,
            })
            .where(eq(profiles.tempId, input.tempId));

          // Migrate associated scores
          await tx
            .update(scores)
            .set({
              userId: ctx.session.user.id,
              tempId: null,
            })
            .where(eq(scores.tempId, input.tempId));
        } else {
          // Create new profile if no temporary profile exists
          await tx.insert(profiles).values({
            userId: ctx.session.user.id,
            profileImageUrl: "/avatars/dogav1.png",
            tempId: null,
          });
        }

        return true;
      });
    }),

  updateProfileImage: protectedProcedure
    .input(
      z.object({
        imageUrl: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Validate that it's a local avatar path
      if (!input.imageUrl.startsWith('/avatars/dogav')) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid avatar path",
        });
      }

      await ctx.db
        .update(profiles)
        .set({ profileImageUrl: input.imageUrl })
        .where(eq(profiles.userId, ctx.session.user.id));

      return { success: true, imageUrl: input.imageUrl };
    }),
  isAdmin: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.query.profiles.findFirst({
      where: eq(profiles.userId, ctx.session.user.id),
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
