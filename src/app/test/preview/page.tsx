"use client";

import { Suspense } from "react";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import Image from "next/image";
import Link from "next/link";

interface Breed {
  imageUrl: string;
  breed: string;
  type?: "community";
  submittedBy?: string;
}

interface BreedsResponse {
  date: string;
  breeds: Breed[];
}

const LoadingSpinner = () => (
  <div className="h-32 w-32 animate-spin rounded-full border-t-2 border-emerald-500" />
);

function PreviewContent() {
  const { data: session, status } = useSession();
  const [breeds, setBreeds] = useState<BreedsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Wait for session to be checked
  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <LoadingSpinner />
      </div>
    );
  }

  const handlePreview = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/cron/daily-breeds", {
        method: "POST",
      });
      const data = await response.json();
      setBreeds(data);
    } catch (error) {
      console.error("Failed to load preview:", error);
      setError("Failed to load preview. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-zinc-950 px-4 py-12 text-zinc-50">
        <div className="container mx-auto max-w-3xl text-center">
          <h1 className="mb-8 text-5xl font-bold tracking-tight text-[#F9F8E4]">
            Preview
          </h1>
          <p>Please sign in to view previews</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-12 text-zinc-50">
      <div className="container mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <Link href="/">
            <h1 className="mb-8 cursor-pointer text-5xl font-bold tracking-tight text-[#F9F8E4] transition-colors hover:text-[#538D4E]">
              Preview
            </h1>
          </Link>

          <Button
            onClick={handlePreview}
            disabled={loading}
            className="bg-emerald-600 text-white hover:bg-emerald-700"
          >
            {loading ? "Loading..." : "Preview Tomorrow's Breeds"}
          </Button>
        </div>

        {error && <div className="mb-4 text-center text-red-500">{error}</div>}

        {breeds && (
          <div className="space-y-8">
            <p className="text-center text-xl">Date: {breeds.date}</p>
            {breeds.breeds.map((breed: Breed, index: number) => (
              <Card
                key={index}
                className="overflow-hidden rounded-xl border border-gray-500 bg-zinc-900/50 shadow-xl shadow-emerald-900/10 backdrop-blur-sm"
              >
                <div className="relative h-[300px] w-full md:h-[350px] lg:h-[400px]">
                  <Image
                    src={breed.imageUrl}
                    alt={breed.breed}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="rounded-xl bg-zinc-900/50 object-cover transition-transform duration-500 hover:scale-105"
                    priority
                    quality={90}
                  />
                  {breed.type === "community" && (
                    <div className="absolute right-4 top-4 rounded-full bg-emerald-500/80 px-3 py-1 text-sm text-white backdrop-blur-sm">
                      Community Pup
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-bold uppercase">
                    {breed.breed.replace("-", " ")}
                  </h3>
                  {breed.submittedBy && (
                    <p className="text-sm text-emerald-500">
                      By: @{breed.submittedBy}
                    </p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function PreviewPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-zinc-950">
          <LoadingSpinner />
        </div>
      }
    >
      <PreviewContent />
    </Suspense>
  );
}
