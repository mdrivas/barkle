import { NextResponse } from "next/server";
import { bucket } from "~/lib/gcs-config";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Generate unique filename
    const filename = `pending/${Date.now()}-${file.name.replace(/\s+/g, '-')}`;  // Replace spaces with hyphens
    const gcsFile = bucket.file(filename);

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to GCS with minimal options
    await gcsFile.save(buffer, {
      contentType: file.type,
      resumable: false, // For small files, this is faster
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