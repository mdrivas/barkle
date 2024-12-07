import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";
import { scores } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";



//TODO: if the user logs in and already has a score today, do not save the score and do not let them play again today

export const scoreRouter = createTRPCRouter({
  saveScore: publicProcedure
    .input(z.object({ 
      score: z.number().min(0).max(5),
      timestamp: z.string().datetime(),
      tempId: z.string().uuid().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
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


    //TODO: make a query here to check if user can play today, call database get scores by user within the last 24 hours, if there are any, return false, otherwise return true
}); 