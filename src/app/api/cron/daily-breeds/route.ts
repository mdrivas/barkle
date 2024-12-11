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

interface DogAPIResponse {
  message: string[];
  status: string;
}

interface DogImageResponse {
  message: string;
  status: string;
}

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
    console.log(`Breeds already exist for ${today}, skipping generation`);
    return; // Breeds already exist for today
  }

  // Get available community dogs first
  const sevenDaysAgo = new Date(pstDate);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const verifiedDogs = await db.query.dogSubmissions.findMany({
    where: (dogs) => and(
      eq(dogs.status, 'verified'),
      or(
        sql`${dogs.lastFeaturedAt} IS NULL`,
        sql`${dogs.lastFeaturedAt} < ${sevenDaysAgo.toISOString()}`
      )
    ),
    with: {
      user: {
        columns: {
          username: true,
        }
      }
    },
  });

  // Generate breeds using the date as seed
  const rng = seedrandom(today);
  const breedsResponse = await fetch("https://dog.ceo/api/breeds/list/all");
  const breedsData = (await breedsResponse.json()) as DogAPIResponse;
  const allBreeds = Object.keys(breedsData.message);

  const selectedBreeds: DogBreed[] = [];
  const usedBreeds = new Set<string>();

  // First, select 4 API breeds
  while (selectedBreeds.length < 4) {
    const breedIndex = Math.floor(rng() * allBreeds.length);
    const breed = allBreeds[breedIndex] as string;

    if (!usedBreeds.has(breed!) && breed) {
      const imageResponse = await fetch(
        `https://dog.ceo/api/breed/${breed}/images/random`
      );
      const imageData = (await imageResponse.json()) as DogImageResponse;

      selectedBreeds.push({
        breed,
        imageUrl: imageData.message,
        type: 'api'
      });
      usedBreeds.add(breed);
    }
  }

  // Then add community dog as the 5th dog if available
  if (verifiedDogs.length > 0) {
    const communityDogIndex = Math.floor(rng() * verifiedDogs.length);
    const communityDog = verifiedDogs[communityDogIndex];
    
    if (communityDog) {
      selectedBreeds.push({
        breed: communityDog.breed,
        imageUrl: `https://storage.googleapis.com/${dogSubmissionsBucket.name}/${communityDog.imagePath}`,
        type: 'community',
        submittedBy: communityDog.user?.username ?? 'Anonymous'
      });

      await db.update(dogSubmissions)
        .set({ lastFeaturedAt: new Date() })
        .where(eq(dogSubmissions.id, communityDog.id));
    }
  } else {
    // If no community dog available, add another API breed
    while (selectedBreeds.length < 5) {
      const breedIndex = Math.floor(rng() * allBreeds.length);
      const breed = allBreeds[breedIndex] as string;

      if (!usedBreeds.has(breed!) && breed) {
        const imageResponse = await fetch(
          `https://dog.ceo/api/breed/${breed}/images/random`
        );
        const imageData = (await imageResponse.json()) as DogImageResponse;

        selectedBreeds.push({
          breed,
          imageUrl: imageData.message,
          type: 'api'
        });
        usedBreeds.add(breed);
      }
    }
  }

  // Store in database
  await db.insert(dailyBreeds).values({
    date: today,
    breeds: JSON.stringify(selectedBreeds),
  });
}

async function previewTomorrowBreeds() {
  const tomorrow = new Date(
    new Date().toLocaleString("en-US", { 
      timeZone: "America/Los_Angeles",
    })
  );
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowString = tomorrow.toISOString().split('T')[0];

  // Get available community dogs
  const sevenDaysAgo = new Date(tomorrow);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const verifiedDogs = await db.query.dogSubmissions.findMany({
    where: (dogs) => and(
      eq(dogs.status, 'verified'),
      or(
        sql`${dogs.lastFeaturedAt} IS NULL`,
        sql`${dogs.lastFeaturedAt} < ${sevenDaysAgo.toISOString()}`
      )
    ),
    with: {
      user: {
        columns: {
          username: true,
        }
      }
    },
  });

  const rng = seedrandom(tomorrowString);
  const breedsResponse = await fetch("https://dog.ceo/api/breeds/list/all");
  const breedsData = (await breedsResponse.json()) as DogAPIResponse;
  const allBreeds = Object.keys(breedsData.message);

  const selectedBreeds: DogBreed[] = [];
  const usedBreeds = new Set<string>();

  // Select 4 API breeds
  while (selectedBreeds.length < 4) {
    const breedIndex = Math.floor(rng() * allBreeds.length);
    const breed = allBreeds[breedIndex] as string;

    if (!usedBreeds.has(breed!) && breed) {
      const imageResponse = await fetch(
        `https://dog.ceo/api/breed/${breed}/images/random`
      );
      const imageData = (await imageResponse.json()) as DogImageResponse;

      selectedBreeds.push({
        breed,
        imageUrl: imageData.message,
        type: 'api'
      });
      usedBreeds.add(breed);
    }
  }

  // Add community dog if available
  if (verifiedDogs.length > 0) {
    const communityDogIndex = Math.floor(rng() * verifiedDogs.length);
    const communityDog = verifiedDogs[communityDogIndex];
    
    if (communityDog) {
      selectedBreeds.push({
        breed: communityDog.breed,
        imageUrl: `https://storage.googleapis.com/${dogSubmissionsBucket.name}/${communityDog.imagePath}`,
        type: 'community',
        submittedBy: communityDog.user?.username ?? 'Anonymous'
      });
    }
  } else {
    // Add another API breed if no community dog
    while (selectedBreeds.length < 5) {
      const breedIndex = Math.floor(rng() * allBreeds.length);
      const breed = allBreeds[breedIndex] as string;

      if (!usedBreeds.has(breed!) && breed) {
        const imageResponse = await fetch(
          `https://dog.ceo/api/breed/${breed}/images/random`
        );
        const imageData = (await imageResponse.json()) as DogImageResponse;

        selectedBreeds.push({
          breed,
          imageUrl: imageData.message,
          type: 'api'
        });
        usedBreeds.add(breed);
      }
    }
  }

  // Return the preview data at the end
  return {
    date: tomorrowString,
    breeds: selectedBreeds,
    preview: true
  };
}

// Add this function to help with testing
async function generateTomorrowBreeds() {
  const tomorrow = new Date(
    new Date().toLocaleString("en-US", { 
      timeZone: "America/Los_Angeles",
    })
  );
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowString = tomorrow.toISOString().split('T')[0];

  if (!tomorrowString) {
    throw new Error("Failed to generate date");
  }

  // Get the preview data
  const previewData = await previewTomorrowBreeds();
  
  // Add type check before insert
  if (!previewData?.breeds) {
    throw new Error("Failed to generate breeds data");
  }

  await db.insert(dailyBreeds).values({
    date: tomorrowString,
    breeds: JSON.stringify(previewData.breeds),
  });

  return previewData;
}

// Add a new test endpoint
export async function PUT(request: Request) {
  try {
    if (process.env.NODE_ENV !== 'development') {
      return new NextResponse("Not available in production", { status: 403 });
    }

    const data = await generateTomorrowBreeds();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to generate tomorrow's breeds:", error);
    return NextResponse.json({ error: "Failed to generate breeds" }, { status: 500 });
  }
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

export async function POST(_request: Request) {
  try {
    if (process.env.NODE_ENV !== 'development') {
      return new NextResponse("Preview not available in production", { status: 403 });
    }

    const preview = await previewTomorrowBreeds();
    return NextResponse.json(preview);
  } catch (error) {
    console.error("Preview generation failed:", error);
    return NextResponse.json({ error: "Failed to generate preview" }, { status: 500 });
  }
} 