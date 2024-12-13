"use client";

interface ShareableCardProps {
  score: number;
  questionResults: boolean[];
  mode?: "daily" | "pawsistence";
}

export function ShareableCard({ score, questionResults, mode }: ShareableCardProps) {
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });

  return (
    <div className="flex h-[1080px] w-[1080px] flex-col items-center justify-between bg-[#121213]">
      <div className="flex flex-col items-center gap-1 mt-8">
        <div className="flex items-center gap-2">
          <h1 className="text-7xl font-bold text-white tracking-wide">Barkle</h1>
          <span className="text-5xl">🐕</span>
        </div>
        <p className="text-3xl text-zinc-400">
          {mode === "pawsistence" ? "My Pawsistence" : "My Daily Barkle"}
        </p>
        <p className="text-2xl text-zinc-500">{formattedDate}</p>
      </div>

      <div className="flex flex-col items-center gap-6">
        <div className="flex flex-col items-center">
          <span className="text-[120px] font-bold text-emerald-400 leading-none">
            {mode === "pawsistence" ? `${score} 🔥` : `${score}/5`}
          </span>
          <p className="text-4xl text-zinc-400 mt-4">
            {mode === "pawsistence" ? "Best Streak" : "Correct"}
          </p>
        </div>
        
        {mode !== "pawsistence" && (
          <div className="flex gap-4">
            {questionResults.map((result, i) => (
              <div
                key={i}
                className={`relative flex h-24 w-24 items-center justify-center rounded-2xl ${
                  result ? 'bg-emerald-500' : 'bg-red-500'
                }`}
              >
                <span className="text-3xl">🐾</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col items-center gap-2 mb-8">
        <p className="text-2xl text-zinc-400">
          Fetch your own pups at
        </p>
        <p className="text-3xl text-emerald-400">
          barkle.vercel.app
        </p>
      </div>
    </div>
  );
} 