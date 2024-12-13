import { NextResponse } from "next/server";
import { Storage } from "@google-cloud/storage";
import { env } from "~/env";

const storage = new Storage({
  projectId: env.GOOGLE_CLOUD_PROJECT_ID,
  credentials: {
    client_email: env.GOOGLE_CLOUD_CLIENT_EMAIL,
    private_key: env.GOOGLE_CLOUD_PRIVATE_KEY.replace(/\\n/g, "\n"),
  },
});

const bucket = storage.bucket(env.GCS_INSTAGRAM_STORIES_BUCKET);

export async function POST(request: Request) {
  try {
    console.log("Upload request received");
    const formData = await request.formData();
    const file = formData.get('file') as File;
    if (!file) {
      console.error("No file in request");
      return NextResponse.json({ error: "No file" }, { status: 400 });
    }

    console.log("File received, size:", file.size);
    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `share-${Date.now()}.png`;
    
    console.log("Uploading to GCS...");
    const blob = bucket.file(filename);
    await blob.save(buffer, {
      contentType: 'image/png',
      public: true,
      metadata: {
        cacheControl: 'public, max-age=3600',
      },
    });

    const publicUrl = `https://storage.googleapis.com/${env.GCS_INSTAGRAM_STORIES_BUCKET}/${filename}`;
    console.log("File uploaded, URL:", publicUrl);

    return NextResponse.json({ imageUrl: publicUrl }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ 
      error: "Upload failed", 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

// Handle preflight requests
export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
} 