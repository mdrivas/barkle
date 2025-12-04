import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { feedback } from "~/server/db/schema";
import { TRPCError } from "@trpc/server";

export const feedbackRouter = createTRPCRouter({
  submit: publicProcedure
    .input(
      z.object({
        message: z.string().min(1).max(500),
        userId: z.string().optional(),
        tempId: z.string().nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Just store the message, userId/tempId are optional for reference only
        await ctx.db.insert(feedback).values({
          message: input.message,
          userId: input.userId ?? null,
          tempId: input.tempId ?? null,
        });

        return {
          success: true,
          message: "Feedback submitted successfully",
        };
      } catch (error) {
        // If FK constraint fails, try without user info
        try {
          await ctx.db.insert(feedback).values({
            message: input.message,
            userId: null,
            tempId: null,
          });
          return {
            success: true,
            message: "Feedback submitted successfully",
          };
        } catch {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to submit feedback",
          });
        }
      }
    }),
});
