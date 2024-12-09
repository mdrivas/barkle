import { NextResponse } from "next/server";
import { bucket } from "~/lib/gcs-config";

export async function GET() {
  try {
    // Try to get bucket metadata
    const [exists] = await bucket.exists();
    
    return NextResponse.json({
      success: true,
      message: exists ? "Successfully connected to GCS bucket" : "Bucket not found",
      bucketName: bucket.name
    });
  } catch (error) {
    console.error("GCS Connection Error:", error);
    return NextResponse.json(
      { error: "Failed to connect to GCS" },
      { status: 500 }
    );
  }
} 