import { z } from "zod";
import { createTRPCRouter, adminProcedure } from "../trpc";
import { dogSubmissionsBucket } from "~/lib/gcs-config";
import { eq } from "drizzle-orm";
import { dogSubmissions } from "~/server/db/schema";

export const adminRouter = createTRPCRouter({
  getPendingImages: adminProcedure.query(async ({ ctx }) => {
    const pendingSubmissions = await ctx.db.query.dogSubmissions.findMany({
      where: eq(dogSubmissions.status, "pending"),
      with: {
        user: {
          columns: {
            name: true,
            email: true,
          },
        },
      },
    });

    return pendingSubmissions.map((submission) => ({
      name: submission.imagePath,
      url: `https://storage.googleapis.com/${dogSubmissionsBucket.name}/${submission.imagePath}`,
      breed: submission.breed,
      submittedBy: submission.user.name ?? "Anonymous",
      submittedAt: submission.createdAt,
    }));
  }),

  approveImage: adminProcedure
    .input(
      z.object({
        submissionId: z.number(),
        filename: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Move file in GCS
      const file = dogSubmissionsBucket.file(input.filename);
      const newFile = dogSubmissionsBucket.file(
        input.filename.replace("pending/", "verified/"),
      );
      await file.move(newFile);

      // Update database
      await ctx.db
        .update(dogSubmissions)
        .set({
          status: "verified",
          verifiedAt: new Date(),
          verifiedBy: ctx.session.user.id,
          imagePath: input.filename.replace("pending/", "verified/"),
        })
        .where(eq(dogSubmissions.id, input.submissionId));

      return { success: true };
    }),

  rejectImage: adminProcedure
    .input(z.object({ filename: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const file = dogSubmissionsBucket.file(input.filename);
      await file.delete();
      return { success: true };
    }),

  getStats: adminProcedure.query(async () => {
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

  batchProcessImages: adminProcedure
    .input(
      z.object({
        decisions: z.array(
          z.object({
            filename: z.string(),
            action: z.enum(["approve", "reject"]),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await Promise.all(
        input.decisions.map(async ({ filename, action }) => {
          const file = dogSubmissionsBucket.file(filename);

          if (action === "approve") {
            // Move file in GCS
            const newFile = dogSubmissionsBucket.file(
              filename.replace("pending/", "verified/"),
            );
            await file.move(newFile);

            // Update database
            await ctx.db
              .update(dogSubmissions)
              .set({
                status: "verified",
                verifiedAt: new Date(),
                verifiedBy: ctx.session.user.id,
                imagePath: filename.replace("pending/", "verified/"),
              })
              .where(eq(dogSubmissions.imagePath, filename));
          } else {
            // Delete file from GCS
            await file.delete();

            // Update database to mark as rejected
            await ctx.db
              .update(dogSubmissions)
              .set({
                status: "rejected",
                verifiedAt: new Date(),
                verifiedBy: ctx.session.user.id,
              })
              .where(eq(dogSubmissions.imagePath, filename));
          }
        }),
      );

      return { success: true };
    }),
});
