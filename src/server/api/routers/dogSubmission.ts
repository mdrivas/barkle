import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { dogSubmissions } from "~/server/db/schema";
import { TRPCError } from "@trpc/server";
import { eq, desc } from "drizzle-orm";

export const dogSubmissionRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({
      imageUrl: z.string().url(),
      breed: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      // Extract filename from the GCS URL
      const imagePath = `pending/${input.imageUrl.split('/').pop()}`;

      // Save to database
      await ctx.db.insert(dogSubmissions).values({
        userId: ctx.session.user.id,
        breed: input.breed,
        imagePath,
        status: 'pending',
      });

      return { success: true };
    }),

  // Optional: Add a query to let users see their submissions
  getUserSubmissions: protectedProcedure
    .query(async ({ ctx }) => {
      return ctx.db.query.dogSubmissions.findMany({
        where: eq(dogSubmissions.userId, ctx.session.user.id),
        orderBy: desc(dogSubmissions.createdAt),
      });
    }),
}); 