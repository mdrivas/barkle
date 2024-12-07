import { cn } from "~/lib/utils";

export type DailyScore = {
  rank: number;
  name: string;
  score: string;
  guessStreak: number;
  dailyStreak: number;
};

export type PawsistenceScore = {
  rank: number;
  name: string;
  bestStreak: number;
  date: string;
};

export const mockDailyScores: DailyScore[] = [
  { rank: 1, name: "macaro13", score: "5/5 👑", guessStreak: 5, dailyStreak: 2 },
  { rank: 2, name: "Alexandros", score: "5/5 👑", guessStreak: 5, dailyStreak: 2 },
  { rank: 3, name: "Young Dolphin", score: "4/5 🐕‍🦺", guessStreak: 0, dailyStreak: 2 },
  { rank: 4, name: "Alexandros", score: "3/5 🐕", guessStreak: 2, dailyStreak: 2 },
  { rank: 5, name: "Mattheos", score: "3/5 🐕", guessStreak: 0, dailyStreak: 2 },
];

export const mockPawsistenceScores: PawsistenceScore[] = [
  { rank: 1, name: "mdg2.0", bestStreak: 11, date: "Dec 5" },
  { rank: 2, name: "Young Dolphin", bestStreak: 5, date: "Dec 6" },
  { rank: 3, name: "Dan", bestStreak: 4, date: "Dec 5" },
  { rank: 4, name: "Mattheos", bestStreak: 4, date: "Dec 6" },
  { rank: 5, name: "Tdog", bestStreak: 3, date: "Dec 5" },
];

interface LeaderboardContentProps {
  mode: "daily" | "pawsistence";
}

export function LeaderboardContent({ mode }: LeaderboardContentProps) {
  const isPawsistence = mode === "pawsistence";
  const scores = isPawsistence ? mockPawsistenceScores : mockDailyScores;

  const defaultUserScore = isPawsistence 
    ? { rank: 0, name: "Guest", bestStreak: 0, date: "Never" }
    : { rank: 0, name: "Guest", score: "0/5", guessStreak: 0, dailyStreak: 0 };

  const userScore = scores[3] ?? defaultUserScore;

  return (
    <>
      {/* Your Score */}
      <div className="bg-green-900/20 rounded-lg p-3 border border-green-900/30">
        <div className="text-green-500 text-xs font-medium mb-2">
          {isPawsistence ? "Your Best" : "Your Rank Today"}
        </div>
        <div className={cn("grid gap-2 text-xs items-center", 
          isPawsistence ? "grid-cols-4" : "grid-cols-5"
        )}>
          <div className="text-green-500">#{userScore.rank}</div>
          <div className="text-zinc-100 truncate">{userScore.name}</div>
          {isPawsistence ? (
            <>
              <div className="text-amber-500">{(userScore as PawsistenceScore).bestStreak}🔥</div>
              <div className="text-zinc-400">{(userScore as PawsistenceScore).date}</div>
            </>
          ) : (
            <>
              <div className="text-amber-500">{(userScore as DailyScore).score}</div>
              <div className="text-green-500">{(userScore as DailyScore).guessStreak}🔥</div>
              <div className="text-amber-500">{(userScore as DailyScore).dailyStreak}🔥</div>
            </>
          )}
        </div>
      </div>

      {/* Headers */}
      <div className={cn("grid gap-2 text-xs font-medium text-zinc-400 bg-zinc-800/50 p-2 rounded-lg",
        isPawsistence ? "grid-cols-4" : "grid-cols-5"
      )}>
        <div className="text-center">Rank</div>
        <div>Player</div>
        {isPawsistence ? (
          <>
            <div>Best Streak</div>
            <div>Date</div>
          </>
        ) : (
          <>
            <div>Score</div>
            <div>Streak</div>
            <div>Daily</div>
          </>
        )}
      </div>

      {/* Scores List */}
      <div className="space-y-1.5 max-h-[200px] overflow-y-auto pr-1">
        {scores.map((score, i) => (
          <div 
            key={i}
            className={cn(
              "grid gap-2 text-xs p-2 rounded-lg border items-center shadow-lg",
              isPawsistence ? "grid-cols-4" : "grid-cols-5",
              {
                "bg-gold animate-medal-shine": i === 0,
                "bg-silver animate-medal-shine": i === 1,
                "bg-bronze animate-medal-shine": i === 2,
                "bg-zinc-800/30 border-zinc-800": i > 2
              }
            )}
          >
            <div className="text-green-500 text-center font-bold">#{score.rank}</div>
            <div className={cn("text-zinc-100 truncate", {
              "font-semibold": i < 3
            })}>{score.name}</div>
            {isPawsistence ? (
              <>
                <div className="text-amber-500">{(score as PawsistenceScore).bestStreak}🔥</div>
                <div className="text-zinc-400">{(score as PawsistenceScore).date}</div>
              </>
            ) : (
              <>
                <div className="text-amber-500">{(score as DailyScore).score}</div>
                <div className="text-green-500">{(score as DailyScore).guessStreak}🔥</div>
                <div className="text-amber-500">{(score as DailyScore).dailyStreak}🔥</div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Total Players */}
      <div className="bg-gradient-to-r from-[#8B4513] to-[#DEB887] text-white p-2 rounded-full text-center text-xs font-medium">
        🏆 {mode === "daily" ? "163 Total Players Today" : "Top 100 Streaks"} 🏆
      </div>
    </>
  );
}
