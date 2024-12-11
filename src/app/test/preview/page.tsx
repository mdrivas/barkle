'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import Image from "next/image";
import Link from "next/link";

// Add loading state component
const LoadingSpinner = () => (
  <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-emerald-500" />
);

export default function PreviewPage() {
  const { data: session, status } = useSession();
  const [breeds, setBreeds] = useState<null | any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Wait for session to be checked
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950">
        <LoadingSpinner />
      </div>
    );
  }

  const handlePreview = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/cron/daily-breeds', {
        method: 'POST',
      });
      const data = await response.json();
      setBreeds(data);
    } catch (error) {
      console.error('Failed to load preview:', error);
      setError('Failed to load preview. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-50 py-12 px-4">
        <div className="container max-w-3xl mx-auto text-center">
          <h1 className="text-5xl font-bold tracking-tight text-[#F9F8E4] mb-8">Preview</h1>
          <p>Please sign in to view previews</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 py-12 px-4">
      <div className="container max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <Link href="/">
            <h1 className="text-5xl font-bold tracking-tight text-[#F9F8E4] hover:text-[#538D4E] transition-colors cursor-pointer mb-8">
              Preview
            </h1>
          </Link>
          
          <Button 
            onClick={handlePreview}
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {loading ? 'Loading...' : 'Preview Tomorrow\'s Breeds'}
          </Button>
        </div>

        {error && (
          <div className="text-red-500 mb-4 text-center">{error}</div>
        )}

        {breeds && (
          <div className="space-y-8">
            <p className="text-center text-xl">Date: {breeds.date}</p>
            {breeds.breeds.map((breed: any, index: number) => (
              <Card key={index} className="overflow-hidden border border-gray-500 rounded-xl bg-zinc-900/50 backdrop-blur-sm shadow-xl shadow-emerald-900/10">
                <div className="relative w-full h-[300px] md:h-[350px] lg:h-[400px]">
                  <Image
                    src={breed.imageUrl}
                    alt={breed.breed}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover hover:scale-105 transition-transform duration-500 rounded-xl bg-zinc-900/50"
                    priority
                    quality={90}
                  />
                  {breed.type === 'community' && (
                    <div className="absolute top-4 right-4 bg-emerald-500/80 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                      Community Pup
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold uppercase text-xl">{breed.breed.replace("-", " ")}</h3>
                  {breed.submittedBy && (
                    <p className="text-sm text-emerald-500">By: @{breed.submittedBy}</p>
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