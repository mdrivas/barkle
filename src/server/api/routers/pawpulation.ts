import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import { breedPopulations, profiles, scores } from "~/server/db/schema";
import { sql, eq, or } from "drizzle-orm";
import { isSameDay } from "~/lib/streaks";

export const pawpulationRouter = createTRPCRouter({
  getBreedPair: publicProcedure
    .input(z.object({
      currentBreedId: z.number().nullish(),
    }))
    .query(async ({ ctx, input }) => {
      // Get all breeds except current
      const breeds = await ctx.db.query.breedPopulations.findMany({
        where: input.currentBreedId 
          ? sql`id != ${input.currentBreedId}` 
          : undefined,
        orderBy: sql`RANDOM()`,
        limit: 2,
      });

      if (breeds.length < 2) {
        throw new Error("Not enough breeds in database");
      }

      return {
        currentBreed: input.currentBreedId 
          ? await ctx.db.query.breedPopulations.findFirst({
              where: eq(breedPopulations.id, input.currentBreedId),
            })
          : breeds[0],
        nextBreed: input.currentBreedId ? breeds[0] : breeds[1],
      };
    }),

  saveGame: publicProcedure
    .input(z.object({
      score: z.number(),
      tempId: z.string().uuid().nullable(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.transaction(async (tx) => {
        const profile = await tx.query.profiles.findFirst({
          where: or(
            ctx.session?.user?.id ? eq(profiles.userId, ctx.session.user.id) : undefined,
            input.tempId ? eq(profiles.tempId, input.tempId) : undefined,
          ),
        });

        if (!profile) return;

        const now = new Date();
        const lastPlayed = profile.lastPawpulationAt;
        
        // Reset plays count if it's a new day
        const playsToday = isSameDay(lastPlayed, now) 
          ? (profile.pawpulationPlaysToday ?? 0) + 1 
          : 1;

        await tx
          .update(profiles)
          .set({
            pawpulationPlaysToday: playsToday,
            pawpulationGamesPlayed: sql`COALESCE(${profiles.pawpulationGamesPlayed}, 0) + 1`,
            pawpulationHighScore: sql`GREATEST(COALESCE(${profiles.pawpulationHighScore}, 0), ${input.score})`,
            lastPawpulationAt: now,
          })
          .where(eq(profiles.id, profile.id));
      });
    }),
}); 