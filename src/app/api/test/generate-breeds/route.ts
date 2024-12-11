import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { dailyBreeds, dogSubmissions } from "~/server/db/schema";
import seedrandom from "seedrandom";
import { eq, and, or, sql } from "drizzle-orm";
import { dogSubmissionsBucket } from "~/lib/gcs-config";

interface DogBreed {
  breed: string;
  imageUrl: string;
  type: 'api' | 'community';
  submittedBy?: string;
}

export async function GET(request: Request) {
  try {
    // Only allow in development
    if (process.env.NODE_ENV !== 'development') {
      return new NextResponse("Not available in production", { status: 403 });
    }

    // Get tomorrow's date in PST
    const tomorrow = new Date(
      new Date().toLocaleString("en-US", { 
        timeZone: "America/Los_Angeles",
      })
    );
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowString = tomorrow.toISOString().split('T')[0];

    // Use the same logic as generateDailyBreeds but with tomorrow's date
    const sevenDaysAgo = new Date(tomorrow);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Rest of the logic remains the same as generateDailyBreeds
    const verifiedDogs = await db.query.dogSubmissions.findMany({
      where: (dogs) => and(
        eq(dogs.status, 'verified'),
        or(
          sql`${dogs.lastFeaturedAt} IS NULL`,
          sql`${dogs.lastFeaturedAt} < ${sevenDaysAgo}`
        )
      ),
      with: {
        user: {
          columns: {
            name: true,
          }
        }
      },
    });

    const rng = seedrandom(tomorrowString);
    const breedsResponse = await fetch("https://dog.ceo/api/breeds/list/all");
    const breedsData = await breedsResponse.json();
    const allBreeds = Object.keys(breedsData.message);

    const selectedBreeds: DogBreed[] = [];
    const usedBreeds = new Set<string>();

    // Select breeds and store them
    // ... (same logic as generateDailyBreeds)

    if (!tomorrowString) {
      throw new Error("Failed to generate date");
    }

    await db.insert(dailyBreeds).values({
      date: tomorrowString,
      breeds: JSON.stringify(selectedBreeds),
    });

    return NextResponse.json({ 
      success: true, 
      date: tomorrowString,
      breeds: selectedBreeds 
    });
  } catch (error) {
    console.error("Test generation failed:", error);
    return NextResponse.json({ error: "Failed to generate test breeds" }, { status: 500 });
  }
} 