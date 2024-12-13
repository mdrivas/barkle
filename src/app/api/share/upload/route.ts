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
    const formData = await request.formData();
    const file = formData.get('file') as File;
    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `share-${Date.now()}.png`;
    
    const blob = bucket.file(filename);
    await blob.save(buffer, {
      contentType: 'image/png',
      public: true,
      metadata: {
        cacheControl: 'public, max-age=3600',
      },
    });

    const publicUrl = `https://storage.googleapis.com/${env.GCS_INSTAGRAM_STORIES_BUCKET}/${filename}`;

    return NextResponse.json({ imageUrl: publicUrl }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
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