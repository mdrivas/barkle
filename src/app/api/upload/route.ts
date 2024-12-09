import { NextResponse } from "next/server";
import { dogSubmissionsBucket, profilePicsBucket } from "~/lib/gcs-config";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'profile' or 'submission'
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Select bucket based on upload type
    const bucket = type === 'profile' ? profilePicsBucket : dogSubmissionsBucket;
    
    // Generate unique filename (remove 'pending/' for profile pics)
    const filename = type === 'profile' 
      ? `${Date.now()}-${file.name.replace(/\s+/g, '-')}`
      : `pending/${Date.now()}-${file.name.replace(/\s+/g, '-')}`;

    const gcsFile = bucket.file(filename);
    const buffer = Buffer.from(await file.arrayBuffer());

    await gcsFile.save(buffer, {
      contentType: file.type,
      resumable: false,
    });

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
} 