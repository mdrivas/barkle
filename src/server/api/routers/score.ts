import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";
import { scores } from "~/server/db/schema";
import { eq, and, gte } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const scoreRouter = createTRPCRouter({
  canPlayToday: publicProcedure
    .input(z.object({ 
      tempId: z.string().uuid().optional(),
      timezone: z.number()
    }))
    .query(async ({ ctx, input }) => {
      // Get start of today in user's local time
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      today.setMinutes(today.getMinutes() - input.timezone);

      // Check for existing scores today
      const recentScores = await ctx.db
        .select()
        .from(scores)
        .where(
          and(
            ctx.session?.user?.id
              ? eq(scores.userId, ctx.session.user.id)
              : eq(scores.tempId, input.tempId ?? ''),
            gte(scores.createdAt, today)
          )
        )
        .orderBy(scores.createdAt)
        .limit(1);

      // Calculate next play time (local midnight)
      const tomorrow = new Date();
      tomorrow.setHours(24, 0, 0, 0);

      return {
        canPlay: recentScores.length === 0,
        nextPlayTime: recentScores.length > 0 ? tomorrow : null,
        lastPlayedAt: recentScores[0]?.createdAt ?? null
      };
    }),

    saveScore: publicProcedure
    .input(z.object({
      score: z.number(),
      tempId: z.string().uuid().optional(),
      results: z.string(),
      timezone: z.number()
    }))
    .mutation(async ({ ctx, input }) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      today.setMinutes(today.getMinutes() - input.timezone);

      // Check for existing scores today
      const existingScore = await ctx.db
        .select()
        .from(scores)
        .where(
          and(
            ctx.session?.user?.id
              ? eq(scores.userId, ctx.session.user.id)
              : eq(scores.tempId, input.tempId ?? ''),
            gte(scores.createdAt, today)
          )
        )
        .limit(1);

      if (existingScore.length > 0) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: "You've already played today. Try again tomorrow!"
        });
      }

      // If no existing score, insert new score
      return ctx.db.insert(scores).values({
        score: input.score,
        userId: ctx.session?.user?.id,
        tempId: !ctx.session?.user?.id ? input.tempId : null,
        results: input.results,
      });
    }),

  attachScoreToUser: protectedProcedure
    .input(z.object({ 
      tempId: z.string().uuid(),
      timezone: z.number()
    }))
    .mutation(async ({ ctx, input }) => {
      console.log("attachScoreToUser Mutation Input:", input);

      // Get start of today in user's local time
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      today.setMinutes(today.getMinutes() - input.timezone);

      // Find the temporary score from today
      const tempScore = await ctx.db
        .select()
        .from(scores)
        .where(
          and(
            eq(scores.tempId, input.tempId),
            gte(scores.createdAt, today)
          )
        )
        .limit(1);

      if (tempScore.length === 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'No score found with this temporary ID for today'
        });
      }

      // Check if user already has a score for today
      const existingUserScore = await ctx.db
        .select()
        .from(scores)
        .where(
          and(
            eq(scores.userId, ctx.session.user.id),
            gte(scores.createdAt, today)
          )
        )
        .limit(1);

      if (existingUserScore.length > 0) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'User already has a score for today'
        });
      }

      // Update the temporary score with the user ID
      await ctx.db
        .update(scores)
        .set({ 
          userId: ctx.session.user.id,
          tempId: null
        })
        .where(
          and(
            eq(scores.tempId, input.tempId),
            gte(scores.createdAt, today)
          )
        );

      return { success: true };
    }),

  getTodayScore: publicProcedure
    .input(z.object({
      tempId: z.string().uuid().optional(),
      timezone: z.number()
    }))
    .query(async ({ ctx, input }) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      today.setMinutes(today.getMinutes() - input.timezone);

      const score = await ctx.db
        .select()
        .from(scores)
        .where(
          and(
            ctx.session?.user?.id
              ? eq(scores.userId, ctx.session.user.id)
              : eq(scores.tempId, input.tempId ?? ''),
            gte(scores.createdAt, today)
          )
        )
        .limit(1);

      if (!score.length) return null;

      return {
        score: score[0]?.score ?? 0,
        results: score[0]?.results ?? ''
      };
    }),

}); 