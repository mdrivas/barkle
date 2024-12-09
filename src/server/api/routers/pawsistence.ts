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
        lastPawsistenceDate: true,
      },
    });

    if (!user) throw new TRPCError({ code: "NOT_FOUND" });

    // Handle day reset logic
    const today = new Date().toISOString().split('T')[0];
    const isNewDay = user.lastPawsistenceDate !== today;

    if (isNewDay) {
      await ctx.db
        .update(users)
        .set({ 
          pawsistencePlaysToday: 0,
          lastPawsistenceDate: today,
        })
        .where(eq(users.id, ctx.session.user.id));
      
      return {
        playsRemaining: 3,
        highestStreak: user.highestPawsistenceStreak ?? 0,
        canPlay: true,
      };
    }

    return {
      playsRemaining: 3 - (user.pawsistencePlaysToday ?? 0),
      highestStreak: user.highestPawsistenceStreak ?? 0,
      canPlay: (user.pawsistencePlaysToday ?? 0) < 3,
    };
  }),

  saveGame: protectedProcedure
    .input(z.object({
      streak: z.number(),
      isNewHighScore: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.id, ctx.session.user.id),
        columns: {
          pawsistencePlaysToday: true,
          highestPawsistenceStreak: true,
        },
      });

      if (!user) throw new TRPCError({ code: "NOT_FOUND" });
      if ((user.pawsistencePlaysToday ?? 0) >= 3) {
        throw new TRPCError({ 
          code: "BAD_REQUEST",
          message: "No plays remaining today" 
        });
      }

      const updateData: Partial<typeof users.$inferSelect> = {
        pawsistencePlaysToday: (user.pawsistencePlaysToday ?? 0) + 1,
        lastPawsistenceDate: new Date().toISOString().split('T')[0],
      };

      if (input.isNewHighScore) {
        updateData.highestPawsistenceStreak = input.streak;
      }

      await ctx.db
        .update(users)
        .set(updateData)
        .where(eq(users.id, ctx.session.user.id));

      return { success: true };
    }),
}); 