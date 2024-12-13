"use client";

interface ShareableCardProps {
  score: number;
  questionResults: boolean[];
  mode?: "daily" | "pawsistence";
}

export function ShareableCard({ score, questionResults, mode }: ShareableCardProps) {
  const getEmoji = (score: number) => {
    if (score >= 4) return "🏆";
    if (score >= 3) return "🌟";
    return "🐾";
  };

  return (
    <div 
      className="instagram-card-wrapper flex h-[500px] w-[500px] flex-col items-center justify-center gap-6 rounded-3xl bg-zinc-900 p-8"
    >
      <div className="text-2xl font-bold text-zinc-400">
        barkle.vercel.app
      </div>
      
      {mode === "pawsistence" ? (
        <div className="text-center">
          <div className="mb-2 text-5xl font-bold text-emerald-400">
            {score} 🔥
          </div>
          <div className="text-xl text-zinc-400">Highest Streak</div>
        </div>
      ) : (
        <>
          <div className="flex gap-3">
            {questionResults.map((result, i) => (
              <div
                key={i}
                className={`h-12 w-12 rounded-lg ${
                  result ? "bg-emerald-500" : "bg-zinc-700"
                }`}
              />
            ))}
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold text-emerald-400">
              {score}/5 {getEmoji(score)}
            </div>
          </div>
        </>
      )}
    </div>
  );
} 