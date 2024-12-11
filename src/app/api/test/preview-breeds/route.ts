export async function GET(request: Request) {
  try {
    // Only allow in development
    if (process.env.NODE_ENV !== 'development') {
      return new NextResponse("Not available in production", { status: 403 });
    }

    const tomorrow = new Date(
      new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
    );
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowString = tomorrow.toISOString().split('T')[0];

    // ... rest of your breed generation logic ...

    // Don't save to database, just return the preview
    return NextResponse.json({ 
      success: true, 
      date: tomorrowString,
      breeds: selectedBreeds,
      wouldSave: true // Indicates it would have saved in production
    });

  } catch (error) {
    console.error("Preview generation failed:", error);
    return NextResponse.json({ error: "Failed to generate preview" }, { status: 500 });
  }
} 