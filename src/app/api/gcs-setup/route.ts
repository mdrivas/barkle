import { NextResponse } from "next/server";
import { dogSubmissionsBucket, profilePicsBucket } from "~/lib/gcs-config";

export async function POST() {
  try {
    if (!dogSubmissionsBucket || !profilePicsBucket) {
      return NextResponse.json({ error: "Buckets not initialized" }, { status: 500 });
    }

    // Make both buckets public
    await Promise.all([
      dogSubmissionsBucket.makePublic(),
      profilePicsBucket.makePublic()
    ]);

    // Set CORS configuration for both buckets
    const corsConfig = {
      maxAgeSeconds: 3600,
      method: ["GET", "HEAD", "PUT", "POST", "OPTIONS"],
      origin: ["*"],
      responseHeader: [
        "Content-Type",
        "Access-Control-Allow-Origin",
        "Access-Control-Allow-Methods",
        "Access-Control-Allow-Headers",
        "Origin",
        "Accept",
        "X-Requested-With",
        "Content-Type",
        "Access-Control-Request-Method",
        "Access-Control-Request-Headers"
      ],
    };

    await Promise.all([
      dogSubmissionsBucket.setCorsConfiguration([corsConfig]),
      profilePicsBucket.setCorsConfiguration([corsConfig])
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Bucket configuration error:", error);
    return NextResponse.json({ error: "Failed to configure bucket" }, { status: 500 });
  }
} 