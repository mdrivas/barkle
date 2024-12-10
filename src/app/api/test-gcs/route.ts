import { NextResponse } from "next/server";
import { dogSubmissionsBucket, profilePicsBucket } from "~/lib/gcs-config";

export async function GET() {
  try {
    // Try to get bucket metadata for both buckets
    const [dogSubmissionsExists] = await dogSubmissionsBucket.exists();
    const [profilePicsExists] = await profilePicsBucket.exists();
    
    return NextResponse.json({
      success: true,
      dogSubmissions: {
        message: dogSubmissionsExists ? "Successfully connected to dog submissions bucket" : "Bucket not found",
        bucketName: dogSubmissionsBucket.name
      },
      profilePics: {
        message: profilePicsExists ? "Successfully connected to profile pics bucket" : "Bucket not found",
        bucketName: profilePicsBucket.name
      }
    });
  } catch (error) {
    console.error("GCS Connection Error:", error);
    return NextResponse.json(
      { error: "Failed to connect to GCS" },
      { status: 500 }
    );
  }
} 