"use client";


interface ShareableCardProps {
  score: number;
  questionResults: boolean[];
  mode?: "daily" | "pawsistence";
}

export function ShareableCard({}: ShareableCardProps) {
  return (
    <div 
      className="flex h-[500px] w-[500px] items-center justify-center"
      style={{ backgroundColor: '#18181B' }}
    >
      <p className="text-3xl font-bold text-emerald-400">
        barkle.vercel.app
      </p>
    </div>
  );
} 