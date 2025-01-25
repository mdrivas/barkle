import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { desc } from "drizzle-orm";
import { blogPosts } from "~/server/db/schema";

export const pawstsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.query.blogPosts.findMany({
      orderBy: desc(blogPosts.createdAt),
      with: {
        author: {
          with: {
            user: true,
          },
        },
        comments: {
          with: {
            user: {
              with: {
                profile: true,
              },
            },
          },
        },
      },
    });
  }),

  create: protectedProcedure
    .input(z.object({
      title: z.string().min(1),
      content: z.string().min(1),
      imageUrl: z.string().optional().nullable(),
    }))
    .mutation(async ({ ctx, input }) => {
      const [post] = await ctx.db.insert(blogPosts).values({
        title: input.title,
        content: input.content,
        imageUrl: input.imageUrl ?? null,
        userId: ctx.session.user.id,
      }).returning();
      
      return post;
    }),
}); 