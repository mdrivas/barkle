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
      results: z.array(z.boolean()),
      tempId: z.string().uuid().optional(),
      timezone: z.number()
    }))
    .mutation(async ({ ctx, input }) => {
      // Get start of today in user's local time
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      today.setMinutes(today.getMinutes() - input.timezone);

      // Check if user can play
      const canPlayCheck = await ctx.db
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

      if (canPlayCheck.length > 0) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You've already played today. Try again tomorrow!"
        });
      }

      const result = await ctx.db.insert(scores).values({
        score: input.score,
        results: input.results.map(r => r ? '1' : '0').join(','),
        userId: ctx.session?.user?.id ?? null,
        tempId: ctx.session?.user?.id ? null : input.tempId,
        createdAt: new Date()
      })    
      .returning({ id: scores.id });

      if (!result || result.length === 0 || !result[0]?.id) {
        throw new TRPCError({ 
          code: "INTERNAL_SERVER_ERROR", 
          message: "Failed to save score" 
        });
      }

      return { id: result[0].id };
    }),

  attachScoreToUser: protectedProcedure
    .input(z.object({ 
      tempId: z.string().uuid()
    }))
    .mutation(async ({ ctx, input }) => {
      // Find the temporary score
      const tempScore = await ctx.db
        .select()
        .from(scores)
        .where(eq(scores.tempId, input.tempId))
        .limit(1);

      if (tempScore.length > 0) {
        // Update the temporary score with the user ID and clear tempId
        await ctx.db
          .update(scores)
          .set({ 
            userId: ctx.session.user.id,
            tempId: null  // Clear the tempId to prevent duplication
          })
          .where(eq(scores.tempId, input.tempId));
      }

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

      return score[0] 
        ? { 
            score: score[0].score,
            results: score[0].results ?? []
          }
        : null;
    }),

}); 