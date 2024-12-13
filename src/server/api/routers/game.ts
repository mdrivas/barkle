/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { dailyBreeds } from "~/server/db/schema";
import { eq, sql } from "drizzle-orm";

export const gameRouter = createTRPCRouter({
  getDailyBreeds: publicProcedure
    .input(
      z.object({
        timezone: z.number(),
        testTomorrow: z.boolean().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      // Explicitly use PST/PDT timezone
      const pstDate = new Date(
        new Date().toLocaleString("en-US", {
          timeZone: "America/Los_Angeles",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }),
      );

      // Add days if testing tomorrow
      if (input.testTomorrow && process.env.NODE_ENV === "development") {
        pstDate.setDate(pstDate.getDate() + 1);
      }

      const today = pstDate.toISOString().split("T")[0];

      if (!today) {
        throw new Error("Failed to generate date");
      }

      const breeds = await ctx.db.query.dailyBreeds.findFirst({
        where: (breeds) => eq(breeds.date, today),
      });

      if (!breeds) {
        throw new Error("No breeds available for today");
      }

      try {
        // Validate the breeds data
        const parsedBreeds = JSON.parse(breeds.breeds);
        if (!Array.isArray(parsedBreeds) || parsedBreeds.length !== 5) {
          throw new Error("Invalid breeds data format");
        }
      } catch (error) {
        console.error("Failed to parse breeds data:", error);
        throw new Error("Invalid breeds data");
      }

      return breeds;
    }),
});
