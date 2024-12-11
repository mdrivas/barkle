import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { users } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const pawsistenceRouter = createTRPCRouter({
  getInitialState: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.query.users.findFirst({
      where: eq(users.id, ctx.session.user.id),
      columns: {
        highestPawsistenceStreak: true,
        pawsistencePlaysToday: true,
        lastPawsistenceAt: true,
      },
    });

    if (!user) throw new TRPCError({ code: "NOT_FOUND" });

    // Reset plays if it's a new day in PST
    const now = new Date();
    const lastPlayed = user.lastPawsistenceAt;
    const isNewDay = !lastPlayed || 
      now.toLocaleDateString('en-US', { timeZone: 'America/Los_Angeles' }) !== 
      lastPlayed.toLocaleDateString('en-US', { timeZone: 'America/Los_Angeles' });

    if (isNewDay) {
      await ctx.db
        .update(users)
        .set({ pawsistencePlaysToday: 0 })
        .where(eq(users.id, ctx.session.user.id));
      
      return {
        playsRemaining: 3,
        highestStreak: user.highestPawsistenceStreak ?? 0,
        canPlay: true,
      };
    }

    const playsToday = user.pawsistencePlaysToday ?? 0;
    const playsRemaining = Math.max(0, 3 - playsToday);

    return {
      playsRemaining,
      highestStreak: user.highestPawsistenceStreak ?? 0,
      canPlay: playsRemaining > 0,
    };
  }),

  incrementPlays: protectedProcedure.mutation(async ({ ctx }) => {
    return await ctx.db.transaction(async (tx) => {
      const user = await tx.query.users.findFirst({
        where: eq(users.id, ctx.session.user.id),
        columns: {
          pawsistencePlaysToday: true,
        },
      });

      if (!user) throw new TRPCError({ code: "NOT_FOUND" });

      const currentPlays = user.pawsistencePlaysToday ?? 0;
      if (currentPlays >= 3) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No plays remaining today. Come back tomorrow!"
        });
      }

      const newPlaysCount = currentPlays + 1;
      await tx
        .update(users)
        .set({
          pawsistencePlaysToday: newPlaysCount,
          lastPawsistenceAt: new Date(),
        })
        .where(eq(users.id, ctx.session.user.id));

      return { playsRemaining: Math.max(0, 3 - newPlaysCount) };
    });
  }),

  saveGame: protectedProcedure
    .input(z.object({
      streak: z.number(),
      isNewHighScore: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.transaction(async (tx) => {
        const user = await tx.query.users.findFirst({
          where: eq(users.id, ctx.session.user.id),
          columns: {
            highestPawsistenceStreak: true,
          },
        });

        if (!user) throw new TRPCError({ code: "NOT_FOUND" });

        // Update highest streak if it's a new high score
        if (input.isNewHighScore) {
          await tx
            .update(users)
            .set({
              highestPawsistenceStreak: input.streak,
            })
            .where(eq(users.id, ctx.session.user.id));
        }

        return { success: true };
      });
    }),
});