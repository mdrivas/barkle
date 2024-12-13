"use client";

import { cn } from "~/lib/utils";

interface ShareableCardProps {
  score: number;
  questionResults: boolean[];
  mode?: "daily" | "pawsistence";
}

export function ShareableCard({ score, questionResults }: ShareableCardProps) {
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date());

  return (
    <div className="flex h-[1920px] w-[1080px] flex-col items-center bg-gradient-to-b from-emerald-950/30 via-zinc-900 to-zinc-900/95 p-32 text-center">
      {/* Header */}
      <div className="mt-20">
        <h1 className="text-[120px] font-bold text-white">Barkle 🐕</h1>
        <div className="mt-4 space-y-2">
          <p className="text-5xl font-medium text-zinc-300">Daily Barkle</p>
          <p className="text-3xl text-zinc-500">{formattedDate}</p>
        </div>
      </div>

      {/* Score */}
      <div className="mt-32">
        <div className="text-[200px] font-bold text-emerald-400">
          {score}<span className="text-[100px]">/5</span>
        </div>
        <p className="text-4xl text-zinc-400">correct</p>
      </div>

      {/* Results */}
      <div className="mt-32 flex gap-6">
        {questionResults.map((result, i) => (
          <div
            key={i}
            className={cn(
              "flex h-32 w-32 items-center justify-center rounded-2xl",
              result ? "bg-emerald-500" : "bg-red-500/80"
            )}
          >
            <span className="text-4xl">🐾</span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-auto">
        <p className="text-3xl text-zinc-400">Fetch your own pups at</p>
        <p className="mt-4 text-5xl font-bold text-emerald-400">
          barkle.vercel.app
        </p>
      </div>
    </div>
  );
} 