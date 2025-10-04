import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { dailyBreeds, dogSubmissions } from "~/server/db/schema";
import seedrandom from "seedrandom";
import { eq, and, or, sql, desc } from "drizzle-orm";
import { dogSubmissionsBucket } from "~/lib/gcs-config";

interface DogBreed {
  breed: string;
  imageUrl: string;
  type: "api" | "community";
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

function formatDate(date: Date): string {
  const formatted = date.toISOString().split('T')[0];
  if (!formatted) throw new Error("Failed to format date");
  return formatted;
}

async function generateDailyBreeds() {
  // Get current date in PST
  const pstDate = new Date(
    new Date().toLocaleString("en-US", {
      timeZone: "America/Los_Angeles",
    })
  );
  
  // Add one day to get tomorrow's date
  pstDate.setDate(pstDate.getDate() + 1);
  
  // Format as YYYY-MM-DD
  const targetDate = formatDate(pstDate);

  console.log("Current UTC time:", new Date().toISOString());
  console.log("Target PST date:", targetDate);
  console.log("Generating breeds for tomorrow in PST");

  // Check if breeds already exist
  if (!targetDate) {
    throw new Error("Failed to generate target date");
  }

  const existingBreeds = await db.query.dailyBreeds.findFirst({
    where: (breeds) => eq(breeds.date, targetDate),
  });

  if (existingBreeds) {
    console.log(`Breeds already exist for ${targetDate}, skipping generation`);
    return;
  }

  // Get available community dogs
  const sevenDaysAgo = new Date(pstDate);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const verifiedDogs = await db.query.dogSubmissions.findMany({
    where: (dogs) =>
      and(
        eq(dogs.status, "verified"),
        or(
          sql`${dogs.lastFeaturedAt} IS NULL`,
          sql`${dogs.lastFeaturedAt} < ${sevenDaysAgo.toISOString()}`,
        ),
      ),
    with: {
      profile: {
        columns: {
          username: true,
        },
      },
    },
  });

  // Generate breeds using tomorrow's date as seed
  const rng = seedrandom(targetDate);
  const breedsResponse = await fetch("https://dog.ceo/api/breeds/list/all");
  const breedsData = (await breedsResponse.json()) as DogAPIResponse;
  const allBreeds = Object.keys(breedsData.message);

  console.log("\n=== API Breeds Pool ===");
  console.log(`Total available API breeds: ${allBreeds.length}`);
  console.log("Available breeds:", allBreeds.sort().join(", "));

  console.log("\n=== Breed Selection Debug ===");
  console.log("Target date:", targetDate);

  // Get recent breeds (last 30 days) to track frequency
  const recentBreeds = await db.query.dailyBreeds.findMany({
    orderBy: (breeds) => [desc(breeds.date)],
    limit: 30,
  });

  console.log("\nRecent daily breeds entries:", recentBreeds.map(b => b.date));

  // Get breed usage frequency from recent history only
  const breedFrequency = new Map<string, number>();
  recentBreeds.forEach(day => {
    const breeds = JSON.parse(day.breeds) as DogBreed[];
    breeds.forEach(breed => {
      const key = breed.breed.toLowerCase();
      breedFrequency.set(key, (breedFrequency.get(key) ?? 0) + 1);
    });
  });

  // Filter out 'mix' and sort by frequency (least used first)
  const sortedBreeds = allBreeds
    .filter(breed => breed !== 'mix')
    .sort((a, b) => {
      const freqA = breedFrequency.get(a.toLowerCase()) ?? 0;
      const freqB = breedFrequency.get(b.toLowerCase()) ?? 0;
      return freqA - freqB;
    });

  console.log("\nBreed frequency distribution (last 30 days):");
  sortedBreeds.slice(0, 10).forEach(breed => {
    console.log(`${breed}: ${breedFrequency.get(breed.toLowerCase()) ?? 0} uses`);
  });

  // Select breeds, prioritizing unused ones
  const selectedBreeds: DogBreed[] = [];
  const usedBreeds = new Set<string>();

  console.log("\nStarting breed selection...");

  // Select 4 unique breeds, prioritizing least recently used
  while (selectedBreeds.length < 4) {
    // Get breeds not yet used today
    const availableBreeds = sortedBreeds.filter(breed => !usedBreeds.has(breed));

    // Pick from available breeds (sorted by frequency, so picks least used first)
    const breed = availableBreeds[Math.floor(rng() * availableBreeds.length)];

    if (breed) {
      console.log(`\nSelected breed: ${breed}`);
      console.log(`Uses in last 30 days: ${breedFrequency.get(breed.toLowerCase()) ?? 0}`);

      const imageResponse = await fetch(
        `https://dog.ceo/api/breed/${breed}/images/random`,
      );
      const imageData = (await imageResponse.json()) as DogImageResponse;

      selectedBreeds.push({
        breed,
        imageUrl: imageData.message,
        type: "api",
      });
      usedBreeds.add(breed);
    }
  }

  console.log("\nFinal API breeds selected:", selectedBreeds.map(b => b.breed));

  console.log("\n=== Community Dog Selection ===");
  console.log(`Found ${verifiedDogs.length} eligible community dogs:`);
  verifiedDogs.forEach(dog => {
    const lastFeatured = dog.lastFeaturedAt 
      ? new Date(dog.lastFeaturedAt).toISOString() 
      : 'Never';
    console.log(`- ID: ${dog.id}, Breed: ${dog.breed}, User: ${dog.profile?.username ?? 'Anonymous'}, Last Featured: ${lastFeatured}`);
  });

  // Then add community dog as the 5th dog if available
  if (verifiedDogs.length > 0) {
    // Sort by ID in ascending order to prioritize lower IDs
    const sortedDogs = [...verifiedDogs].sort((a, b) => a.id - b.id);
    
    // Select the first dog (lowest ID) instead of using RNG
    const communityDog = sortedDogs[0];

    if (communityDog) {
      const lastFeatured = communityDog.lastFeaturedAt 
        ? new Date(communityDog.lastFeaturedAt).toISOString() 
        : 'Never';
      console.log(`\nSelected community dog:`);
      console.log(`- ID: ${communityDog.id}`);
      console.log(`- Breed: ${communityDog.breed}`);
      console.log(`- Submitted by: ${communityDog.profile?.username ?? 'Anonymous'}`);
      console.log(`- Last featured: ${lastFeatured}`);

      selectedBreeds.push({
        breed: communityDog.breed,
        imageUrl: `https://storage.googleapis.com/${dogSubmissionsBucket.name}/${communityDog.imagePath}`,
        type: "community",
        submittedBy: communityDog.profile?.username ?? "Anonymous",
      });

      // Update lastFeaturedAt
      await db
        .update(dogSubmissions)
        .set({ lastFeaturedAt: new Date() })
        .where(eq(dogSubmissions.id, communityDog.id));

      console.log(`Updated lastFeaturedAt for dog ID ${communityDog.id}`);
    }
  } else {
    console.log("\nNo eligible community dogs found, selecting another API breed");
    // Add another API breed if no community dog
    while (selectedBreeds.length < 5) {
      const breedIndex = Math.floor(rng() * allBreeds.length);
      const breed = allBreeds[breedIndex] as string;

      if (!usedBreeds.has(breed!) && breed) {
        const imageResponse = await fetch(
          `https://dog.ceo/api/breed/${breed}/images/random`,
        );
        const imageData = (await imageResponse.json()) as DogImageResponse;

        selectedBreeds.push({
          breed,
          imageUrl: imageData.message,
          type: "api",
        });
        usedBreeds.add(breed);
      }
    }
  }

  // Store in database
  if (!targetDate) {
    throw new Error("Failed to generate target date");
  }

  await db.insert(dailyBreeds).values({
    date: targetDate,
    breeds: JSON.stringify(selectedBreeds),
  });

  console.log(`Successfully generated breeds for ${targetDate}`);
}

async function previewTomorrowBreeds() {
  const tomorrow = new Date(
    new Date().toLocaleString("en-US", {
      timeZone: "America/Los_Angeles",
    }),
  );
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowString = formatDate(tomorrow);

  // Get available community dogs
  const sevenDaysAgo = new Date(tomorrow);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 8);

  const verifiedDogs = await db.query.dogSubmissions.findMany({
    where: (dogs) =>
      and(
        eq(dogs.status, "verified"),
        or(
          sql`${dogs.lastFeaturedAt} IS NULL`,
          sql`${dogs.lastFeaturedAt} < ${sevenDaysAgo.toISOString()}`,
        ),
      ),
    with: {
      profile: {
        columns: {
          username: true,
        },
      },
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
        `https://dog.ceo/api/breed/${breed}/images/random`,
      );
      const imageData = (await imageResponse.json()) as DogImageResponse;

      selectedBreeds.push({
        breed,
        imageUrl: imageData.message,
        type: "api",
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
        type: "community",
        submittedBy: communityDog.profile?.username ?? "Anonymous",
      });
    }
  } else {
    // Add another API breed if no community dog
    while (selectedBreeds.length < 5) {
      const breedIndex = Math.floor(rng() * allBreeds.length);
      const breed = allBreeds[breedIndex] as string;

      if (!usedBreeds.has(breed!) && breed) {
        const imageResponse = await fetch(
          `https://dog.ceo/api/breed/${breed}/images/random`,
        );
        const imageData = (await imageResponse.json()) as DogImageResponse;

        selectedBreeds.push({
          breed,
          imageUrl: imageData.message,
          type: "api",
        });
        usedBreeds.add(breed);
      }
    }
  }

  // Return the preview data at the end
  return {
    date: tomorrowString,
    breeds: selectedBreeds,
    preview: true,
  };
}

// Add this function to help with testing
async function generateTomorrowBreeds() {
  // Force tomorrow's date in PST
  const pstNow = new Date(
    new Date().toLocaleString("en-US", {
      timeZone: "America/Los_Angeles",
    })
  );
  
  // Add one day to get tomorrow
  pstNow.setDate(pstNow.getDate() + 1);
  
  // Format date as YYYY-MM-DD
  const tomorrowString = formatDate(pstNow);

  console.log("Generating breeds for date:", tomorrowString);

  // Check if breeds already exist
  const existingBreeds = await db.query.dailyBreeds.findFirst({
    where: (breeds) => eq(breeds.date, tomorrowString),
  });

  if (existingBreeds) {
    console.log(`Breeds already exist for ${tomorrowString}`);
    return existingBreeds;
  }

  // Get the preview data
  const previewData = await previewTomorrowBreeds();

  if (!previewData?.breeds) {
    throw new Error("Failed to generate breeds data");
  }

  // Insert into database
  await db.insert(dailyBreeds).values({
    date: tomorrowString,
    breeds: JSON.stringify(previewData.breeds),
  });

  console.log(`Successfully generated breeds for ${tomorrowString}`);
  return previewData;
}

// Add a new test endpoint
export async function PUT(_request: Request) {
  try {
    if (process.env.NODE_ENV !== "development") {
      return new NextResponse("Not available in production", { status: 403 });
    }

    const data = await generateTomorrowBreeds();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to generate tomorrow's breeds:", error);
    return NextResponse.json(
      { error: "Failed to generate breeds" },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    console.log("=== Cron Job Debug ===");
    console.log("Timestamp:", new Date().toISOString());
    console.log("Starting daily breeds generation...");

    await generateDailyBreeds();
    
    console.log("Daily breeds generated successfully");
    return new NextResponse("Success", { status: 200 });
  } catch (error) {
    console.error("Cron job failed:", error);
    return new NextResponse("Failed", { status: 500 });
  }
}

export async function POST(_request: Request) {
  try {
    if (process.env.NODE_ENV !== "development") {
      return new NextResponse("Preview not available in production", {
        status: 403,
      });
    }

    const preview = await previewTomorrowBreeds();
    return NextResponse.json(preview);
  } catch (error) {
    console.error("Preview generation failed:", error);
    return NextResponse.json(
      { error: "Failed to generate preview" },
      { status: 500 },
    );
  }
}
