import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import seedrandom from 'seedrandom';
import { dailyBreeds } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export const gameRouter = createTRPCRouter({
  getDailyBreeds: publicProcedure
    .input(z.object({ timezone: z.number() }))
    .query(async ({ ctx, input }) => {
      // Adjust date for timezone
      const date = new Date();
      date.setMinutes(date.getMinutes() + input.timezone);
      const dateString = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

      // Check if we already have breeds for today
      const existingBreeds = await ctx.db.query.dailyBreeds.findFirst({
        where: (breeds) => eq(breeds.date, dateString),
      });

      if (existingBreeds) {
        return existingBreeds;
      }

      // If not, generate new breeds
      const rng = seedrandom(dateString);
      const breedsResponse = await fetch('https://dog.ceo/api/breeds/list/all');
      const breedsData = await breedsResponse.json();
      const allBreeds = Object.keys(breedsData.message);

      // Select 5 random breeds
      const selectedBreeds = [];
      const usedBreeds = new Set();

      while (selectedBreeds.length < 5) {
        const breedIndex = Math.floor(rng() * allBreeds.length);
        const breed = allBreeds[breedIndex];
        
        if (!usedBreeds.has(breed)) {
          const imageResponse = await fetch(`https://dog.ceo/api/breed/${breed}/images/random`);
          const imageData = await imageResponse.json();
          
          selectedBreeds.push({
            breed,
            imageUrl: imageData.message
          });
          usedBreeds.add(breed);
        }
      }

      // Store in database
      const newDailyBreeds = await ctx.db.insert(dailyBreeds).values({
        date: dateString,
        breeds: JSON.stringify(selectedBreeds)
      }).returning();

      return newDailyBreeds[0];
    }),
}); 