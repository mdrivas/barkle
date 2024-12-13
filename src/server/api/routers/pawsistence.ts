import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { profiles } from "~/server/db/schema";
import { eq, or } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const pawsistenceRouter = createTRPCRouter({
  getInitialState: publicProcedure
    .input(
      z.object({
        tempId: z.string().uuid().nullable(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session?.user.id;

      const profile = await ctx.db.query.profiles.findFirst({
        where: or(
          userId ? eq(profiles.userId, userId) : undefined,
          input.tempId ? eq(profiles.tempId, input.tempId) : undefined,
        ),
      });

      if (!profile) {
        return {
          playsRemaining: 3,
          highestStreak: 0,
          canPlay: true,
        };
      }

      // Reset plays if it's a new day in PST
      const now = new Date();
      const lastPlayed = profile.lastPawsistenceAt;
      const isNewDay =
        !lastPlayed ||
        now.toLocaleDateString("en-US", { timeZone: "America/Los_Angeles" }) !==
          lastPlayed.toLocaleDateString("en-US", {
            timeZone: "America/Los_Angeles",
          });

      if (isNewDay) {
        await ctx.db
          .update(profiles)
          .set({ pawsistencePlaysToday: 0 })
          .where(
            or(
              userId ? eq(profiles.userId, userId) : undefined,
              input.tempId ? eq(profiles.tempId, input.tempId) : undefined,
            ),
          );

        return {
          playsRemaining: 3,
          highestStreak: profile.highestPawsistenceStreak ?? 0,
          canPlay: true,
        };
      }

      const playsToday = profile.pawsistencePlaysToday ?? 0;
      const playsRemaining = Math.max(0, 3 - playsToday);

      return {
        playsRemaining,
        highestStreak: profile.highestPawsistenceStreak ?? 0,
        canPlay: playsRemaining > 0,
      };
    }),

  incrementPlays: publicProcedure
    .input(
      z.object({
        tempId: z.string().uuid().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user.id;

      return await ctx.db.transaction(async (tx) => {
        const profile = await tx.query.profiles.findFirst({
          where: or(
            userId ? eq(profiles.userId, userId) : undefined,
            input.tempId ? eq(profiles.tempId, input.tempId) : undefined,
          ),
        });

        if (!profile) throw new TRPCError({ code: "NOT_FOUND" });

        const currentPlays = profile.pawsistencePlaysToday ?? 0;
        if (currentPlays >= 3) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "No plays remaining today. Come back tomorrow!",
          });
        }

        const newPlaysCount = currentPlays + 1;
        await tx
          .update(profiles)
          .set({
            pawsistencePlaysToday: newPlaysCount,
            lastPawsistenceAt: new Date(),
          })
          .where(
            or(
              userId ? eq(profiles.userId, userId) : undefined,
              input.tempId ? eq(profiles.tempId, input.tempId) : undefined,
            ),
          );

        return { playsRemaining: Math.max(0, 3 - newPlaysCount) };
      });
    }),

  saveGame: publicProcedure
    .input(
      z.object({
        streak: z.number(),
        isNewHighScore: z.boolean(),
        tempId: z.string().uuid().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user.id;

      return await ctx.db.transaction(async (tx) => {
        const profile = await tx.query.profiles.findFirst({
          where: or(
            userId ? eq(profiles.userId, userId) : undefined,
            input.tempId ? eq(profiles.tempId, input.tempId) : undefined,
          ),
        });

        if (!profile) throw new TRPCError({ code: "NOT_FOUND" });

        // Update highest streak if it's a new high score
        if (input.isNewHighScore) {
          await tx
            .update(profiles)
            .set({
              highestPawsistenceStreak: input.streak,
            })
            .where(
              or(
                userId ? eq(profiles.userId, userId) : undefined,
                input.tempId ? eq(profiles.tempId, input.tempId) : undefined,
              ),
            );
        }

        return { success: true };
      });
    }),
});
