import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { dailyBreeds } from "~/server/db/schema";
import seedrandom from "seedrandom";
import { eq } from "drizzle-orm";

async function generateDailyBreeds() {
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

  // Check if breeds already exist for today
  const existingBreeds = await db.query.dailyBreeds.findFirst({
    where: (breeds) => eq(breeds.date, today),
  });

  if (existingBreeds) {
    return; // Breeds already exist for today
  }

  // Generate breeds using the date as seed
  const rng = seedrandom(today);
  const breedsResponse = await fetch("https://dog.ceo/api/breeds/list/all");
  const breedsData = await breedsResponse.json();
  const allBreeds = Object.keys(breedsData.message);

  const selectedBreeds = [];
  const usedBreeds = new Set();

  while (selectedBreeds.length < 5) {
    const breedIndex = Math.floor(rng() * allBreeds.length);
    const breed = allBreeds[breedIndex];

    if (!usedBreeds.has(breed)) {
      const imageResponse = await fetch(
        `https://dog.ceo/api/breed/${breed}/images/random`
      );
      const imageData = await imageResponse.json();

      selectedBreeds.push({
        breed,
        imageUrl: imageData.message,
      });
      usedBreeds.add(breed);
    }
  }

  // Store in database
  await db.insert(dailyBreeds).values({
    date: today,
    breeds: JSON.stringify(selectedBreeds),
  });
}

export async function GET(request: Request) {
  try {
    // Match Vercel's exact authorization check
    if (request.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await generateDailyBreeds();
    return new NextResponse("Success", { status: 200 });
  } catch (error) {
    console.error("CRON job failed:", error);
    return new NextResponse("Failed", { status: 500 });
  }
} 