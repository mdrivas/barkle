import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { env } from "~/env";
import { dogSubmissionsBucket } from "~/lib/gcs-config";
import { TRPCError } from "@trpc/server";

// Helper function to check admin status
const checkAdmin = (email: string | null | undefined) => {
  const adminEmails = env.ADMIN_EMAILS.split(",");
  return adminEmails.includes(email ?? "");
};

export const adminRouter = createTRPCRouter({
  getPendingImages: protectedProcedure
    .query(async ({ ctx }) => {
      if (!checkAdmin(ctx.session.user.email)) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const [files] = await dogSubmissionsBucket.getFiles({
        prefix: "pending/",
      });

      console.log('Found pending files:', files.length);

      return files.map(file => ({
        name: file.name,
        url: `https://storage.googleapis.com/${dogSubmissionsBucket.name}/${file.name}`
      }));
    }),

  approveImage: protectedProcedure
    .input(z.object({ filename: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!checkAdmin(ctx.session.user.email)) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const file = dogSubmissionsBucket.file(input.filename);
      const newFile = dogSubmissionsBucket.file(
        input.filename.replace("pending/", "verified/")
      );

      await file.move(newFile);
      return { success: true };
    }),

  rejectImage: protectedProcedure
    .input(z.object({ filename: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!checkAdmin(ctx.session.user.email)) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const file = dogSubmissionsBucket.file(input.filename);
      await file.delete();
      return { success: true };
    }),

  getStats: protectedProcedure
    .query(async ({ ctx }) => {
      if (!checkAdmin(ctx.session.user.email)) {
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
      if (!checkAdmin(ctx.session.user.email)) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      // Process all decisions in parallel
      await Promise.all(input.decisions.map(async ({ filename, action }) => {
        const file = dogSubmissionsBucket.file(filename);
        
        if (action === 'approve') {
          const newFile = dogSubmissionsBucket.file(
            filename.replace("pending/", "verified/")
          );
          await file.move(newFile);
        } else {
          await file.delete();
        }
      }));

      return { success: true };
    }),
}); 