import { NextResponse } from "next/server";
import { bucket } from "~/lib/gcs-config";

export async function POST() {
  try {
    // Make bucket public
    await bucket.makePublic();

    // Set CORS configuration
    await bucket.setCorsConfiguration([
      {
        maxAgeSeconds: 3600,
        method: ["GET", "HEAD", "PUT", "POST", "OPTIONS"],
        origin: ["http://localhost:3000"],  // Add your production domain later
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
      },
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Bucket configuration error:", error);
    return NextResponse.json({ error: "Failed to configure bucket" }, { status: 500 });
  }
} 