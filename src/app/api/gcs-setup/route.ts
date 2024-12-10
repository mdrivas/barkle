import { NextResponse } from "next/server";
import { Storage } from '@google-cloud/storage';
import { env } from "~/env";

export async function POST() {
  try {
    const storage = new Storage({
      projectId: env.GOOGLE_CLOUD_PROJECT_ID,
      credentials: {
        client_email: env.GOOGLE_CLOUD_CLIENT_EMAIL,
        private_key: env.GOOGLE_CLOUD_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
    });

    const mainBucket = storage.bucket(env.GOOGLE_CLOUD_BUCKET_NAME);
    const profileBucket = storage.bucket('profile_pics_barkle');

    // Check and create buckets
    const [mainExists] = await mainBucket.exists();
    const [profileExists] = await profileBucket.exists();

    if (!mainExists) {
      await mainBucket.create();
    }
    if (!profileExists) {
      await profileBucket.create();
    }

    // Set up CORS and public access
    const corsConfig = {
      maxAgeSeconds: 3600,
      method: ["GET", "HEAD", "PUT", "POST", "OPTIONS"],
      origin: ["*"],
      responseHeader: ["*"],
    };

    await Promise.all([
      mainBucket.makePublic(),
      profileBucket.makePublic(),
      mainBucket.setCorsConfiguration([corsConfig]),
      profileBucket.setCorsConfiguration([corsConfig])
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json({ error: "Failed to setup buckets" }, { status: 500 });
  }
} 