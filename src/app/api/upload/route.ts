import { NextResponse } from "next/server";
import { dogSubmissionsBucket, profilePicsBucket, postsImagesBucket } from "~/lib/gcs-config";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Select bucket based on upload type
    let bucket;
    if (type === "profile") {
      bucket = profilePicsBucket;
    } else if (type === "post") {
      bucket = postsImagesBucket;
    } else {
      bucket = dogSubmissionsBucket;
    }

    // Generate unique filename
    const filename = type === "submission" 
      ? `pending/${Date.now()}-${file.name.replace(/\s+/g, "-")}`
      : `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;

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
      { status: 500 },
    );
  }
}
