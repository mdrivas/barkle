import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { comments } from "~/server/db/schema";
import { eq, desc } from "drizzle-orm";

export const commentsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({
      content: z.string().min(1),
      blogPostId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const [comment] = await ctx.db.insert(comments).values({
        content: input.content,
        blogPostId: input.blogPostId,
        userId: ctx.session.user.id,
      }).returning();
      
      return comment;
    }),

  getByBlogPostId: protectedProcedure
    .input(z.number().nullable().optional())
    .query(async ({ ctx, input }) => {
      if (!input) return [];
      
      return ctx.db.query.comments.findMany({
        where: eq(comments.blogPostId, input),
        orderBy: desc(comments.createdAt),
        with: {
          user: {
            with: {
              profile: true,
            },
          },
        },
      });
    }),
}); 