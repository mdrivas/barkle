import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { users } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { getUserLocalDate } from "~/lib/dates";

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

    const today = getUserLocalDate();
    const isNewDay = user.lastPawsistenceDate !== today;

    if (isNewDay) {
      await ctx.db
        .update(users)
        .set({ 
          pawsistencePlaysToday: 0,
          lastPawsistenceDate: today,
        })
        .where(eq(users.id, ctx.session.user.id));
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
      const today = getUserLocalDate();

      return await ctx.db.transaction(async (tx) => {
        const user = await tx.query.users.findFirst({
          where: eq(users.id, ctx.session.user.id),
          columns: {
            pawsistencePlaysToday: true,
            highestPawsistenceStreak: true,
            lastPawsistenceDate: true,
          },
        });

        if (!user) throw new TRPCError({ code: "NOT_FOUND" });

        if (user.lastPawsistenceDate !== today) {
          await tx
            .update(users)
            .set({
              pawsistencePlaysToday: 1,
              lastPawsistenceDate: today,
              ...(input.isNewHighScore ? { highestPawsistenceStreak: input.streak } : {}),
            })
            .where(eq(users.id, ctx.session.user.id));

          return { success: true };
        }

        if ((user.pawsistencePlaysToday ?? 0) >= 3) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "No plays remaining today"
          });
        }

        await tx
          .update(users)
          .set({
            pawsistencePlaysToday: (user.pawsistencePlaysToday ?? 0) + 1,
            ...(input.isNewHighScore ? { highestPawsistenceStreak: input.streak } : {}),
          })
          .where(eq(users.id, ctx.session.user.id));

        return { success: true };
      });
    }),

  incrementPlays: protectedProcedure.mutation(async ({ ctx }) => {
    const today = getUserLocalDate();

    return await ctx.db.transaction(async (tx) => {
      const user = await tx.query.users.findFirst({
        where: eq(users.id, ctx.session.user.id),
        columns: {
          pawsistencePlaysToday: true,
          lastPawsistenceDate: true,
        },
      });

      if (!user) throw new TRPCError({ code: "NOT_FOUND" });

      if (user.lastPawsistenceDate !== today) {
        await tx
          .update(users)
          .set({
            pawsistencePlaysToday: 1,
            lastPawsistenceDate: today,
          })
          .where(eq(users.id, ctx.session.user.id));

        return { success: true };
      }

      if ((user.pawsistencePlaysToday ?? 0) >= 3) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No plays remaining today"
        });
      }

      const newPlaysToday = (user.pawsistencePlaysToday ?? 0) + 1;
      await tx
        .update(users)
        .set({
          pawsistencePlaysToday: newPlaysToday,
        })
        .where(eq(users.id, ctx.session.user.id));

      return { 
        success: true,
        playsRemaining: 3 - newPlaysToday 
      };
    });
  }),
});