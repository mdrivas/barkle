import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { dogSubmissionsBucket } from "~/lib/gcs-config";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { users, dogSubmissions } from "~/server/db/schema";
import { db } from "~/server/db";

interface AdminCheckContext {
  db: typeof db;
  session: { user: { id: string } };
}

// Helper function to check admin status from database
const checkAdminDB = async (ctx: AdminCheckContext) => {
  const user = await ctx.db.query.users.findFirst({
    where: eq(users.id, ctx.session.user.id),
    columns: {
      isAdmin: true,
    },
  });
  return user?.isAdmin ?? false;
};

export const adminRouter = createTRPCRouter({
  getPendingImages: protectedProcedure
    .query(async ({ ctx }) => {
      const isAdmin = await checkAdminDB(ctx);
      if (!isAdmin) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const pendingSubmissions = await ctx.db.query.dogSubmissions.findMany({
        where: eq(dogSubmissions.status, 'pending'),
        with: {
          user: {
            columns: {
              name: true,
              email: true,
            }
          }
        },
      });

      return pendingSubmissions.map(submission => ({
        name: submission.imagePath,
        url: `https://storage.googleapis.com/${dogSubmissionsBucket.name}/${submission.imagePath}`,
        breed: submission.breed,
        submittedBy: submission.user.name ?? 'Anonymous',
        submittedAt: submission.createdAt,
      }));
    }),

  approveImage: protectedProcedure
    .input(z.object({ 
      submissionId: z.number(),
      filename: z.string() 
    }))
    .mutation(async ({ ctx, input }) => {
      const isAdmin = await checkAdminDB(ctx);
      if (!isAdmin) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      // Move file in GCS
      const file = dogSubmissionsBucket.file(input.filename);
      const newFile = dogSubmissionsBucket.file(
        input.filename.replace("pending/", "verified/")
      );
      await file.move(newFile);

      // Update database
      await ctx.db.update(dogSubmissions)
        .set({
          status: 'verified',
          verifiedAt: new Date(),
          verifiedBy: ctx.session.user.id,
          imagePath: input.filename.replace("pending/", "verified/"),
        })
        .where(eq(dogSubmissions.id, input.submissionId));

      return { success: true };
    }),

  rejectImage: protectedProcedure
    .input(z.object({ filename: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const isAdmin = await checkAdminDB(ctx);
      if (!isAdmin) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const file = dogSubmissionsBucket.file(input.filename);
      await file.delete();
      return { success: true };
    }),

  getStats: protectedProcedure
    .query(async ({ ctx }) => {
      const isAdmin = await checkAdminDB(ctx);
      if (!isAdmin) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const [pendingFiles] = await dogSubmissionsBucket.getFiles({
        prefix: "pending/",
      });

      const [verifiedFiles] = await dogSubmissionsBucket.getFiles({
        prefix: "verified/",
      });

      return {
        pending: pendingFiles.length,
        verified: verifiedFiles.length,
        total: pendingFiles.length + verifiedFiles.length,
      };
    }),

  batchProcessImages: protectedProcedure
    .input(z.object({
      decisions: z.array(z.object({
        filename: z.string(),
        action: z.enum(['approve', 'reject'])
      }))
    }))
    .mutation(async ({ ctx, input }) => {
      const isAdmin = await checkAdminDB(ctx);
      if (!isAdmin) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      await Promise.all(input.decisions.map(async ({ filename, action }) => {
        const file = dogSubmissionsBucket.file(filename);
        
        if (action === 'approve') {
          // Move file in GCS
          const newFile = dogSubmissionsBucket.file(
            filename.replace("pending/", "verified/")
          );
          await file.move(newFile);

          // Update database
          await ctx.db.update(dogSubmissions)
            .set({
              status: 'verified',
              verifiedAt: new Date(),
              verifiedBy: ctx.session.user.id,
              imagePath: filename.replace("pending/", "verified/"),
            })
            .where(eq(dogSubmissions.imagePath, filename));
        } else {
          // Delete file from GCS
          await file.delete();

          // Update database to mark as rejected
          await ctx.db.update(dogSubmissions)
            .set({
              status: 'rejected',
              verifiedAt: new Date(),
              verifiedBy: ctx.session.user.id,
            })
            .where(eq(dogSubmissions.imagePath, filename));
        }
      }));

      return { success: true };
    }),
}); 