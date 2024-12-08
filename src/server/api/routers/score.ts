import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";
import { scores } from "~/server/db/schema";
import { eq, and, gte } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const scoreRouter = createTRPCRouter({
  canPlayToday: publicProcedure
    .input(z.object({ 
      tempId: z.string().uuid().optional() 
    }))
    .query(async ({ ctx, input }) => {
      // Get start of today in UTC
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);

      // Check for existing scores today
      const recentScores = await ctx.db
        .select()
        .from(scores)
        .where(
          and(
            // Check either userId (if logged in) or tempId
            ctx.session?.user?.id
              ? eq(scores.userId, ctx.session.user.id)
              : eq(scores.tempId, input.tempId ?? ''),
            gte(scores.createdAt, today)
          )
        )
        .orderBy(scores.createdAt)
        .limit(1);

      // Calculate next play time (midnight UTC)
      const tomorrow = new Date();
      tomorrow.setUTCHours(24, 0, 0, 0);

      return {
        canPlay: recentScores.length === 0,
        nextPlayTime: recentScores.length > 0 ? tomorrow : null,
        lastPlayedAt: recentScores[0]?.createdAt ?? null
      };
    }),

  saveScore: publicProcedure
    .input(z.object({ 
      score: z.number().min(0).max(5),
      timestamp: z.string().datetime(),
      tempId: z.string().uuid().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Check if user can play
      const canPlayCheck = await ctx.db
        .select()
        .from(scores)
        .where(
          and(
            ctx.session?.user?.id
              ? eq(scores.userId, ctx.session.user.id)
              : eq(scores.tempId, input.tempId ?? ''),
            gte(scores.createdAt, new Date(Date.now() - 24 * 60 * 60 * 1000))
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
        userId: ctx.session?.user?.id ?? null,
        tempId: ctx.session?.user?.id ? null : input.tempId,
        createdAt: new Date(input.timestamp)
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
      await ctx.db
        .update(scores)
        .set({ userId: ctx.session.user.id })
        .where(eq(scores.tempId, input.tempId));

      return { success: true };
    }),


}); 