import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const dogSubmissionRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({
      imageUrl: z.string().url(),
      breed: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      // Just return success without saving to database
      return {
        success: true,
        imageUrl: input.imageUrl,
        breed: input.breed
      };
    }),
}); 