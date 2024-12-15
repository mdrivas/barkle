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
        console.log("Feedback submission attempt:", {
          message: input.message,
          userId: input.userId,
          tempId: input.tempId,
        });

        const result = await ctx.db.insert(feedback).values({
          message: input.message,
          userId: input.userId ?? null,
          tempId: input.tempId ?? null,
        });

        console.log("Insert result:", result);

        return {
          success: true,
          message: "Feedback submitted successfully",
        };
      } catch (error) {
        console.error("Detailed error in feedback submission:", {
          error,
          input,
          userId: input.userId,
          tempId: input.tempId,
        });

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to submit feedback",
          cause: error,
        });
      }
    }),
});
