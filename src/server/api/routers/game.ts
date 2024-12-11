/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { dailyBreeds } from "~/server/db/schema";
import { eq, sql } from "drizzle-orm";

export const gameRouter = createTRPCRouter({
    getDailyBreeds: publicProcedure
    .input(z.object({ timezone: z.number() }))
    .query(async ({ ctx }) => {
      // Explicitly use PST/PDT timezone
      const pstDate = new Date(
        new Date().toLocaleString("en-US", { 
          timeZone: "America/Los_Angeles",
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        })
      );
      
      const today = pstDate.toISOString().split('T')[0];
  
      if (!today) {
        throw new Error("Failed to generate date");
      }
  
      const breeds = await ctx.db.query.dailyBreeds.findFirst({
        where: (breeds) => eq(breeds.date, today),
      });
  
      if (!breeds) {
        throw new Error("No breeds available for today");
      }
  
      return breeds;
    }),
}); 