"use client";

import { api } from "~/trpc/react";
import { useSession } from "next-auth/react";
import { cn } from "~/lib/utils";

interface LeaderboardContentProps {
  mode: "daily" | "pawsistence";
}

type DailyScore = {
  username: string | null;
  score: number;
  currentStreak: number | null;
  dailyStreak: number | null;
  userId: string | null;
};

type PawsistenceScore = {
  username: string | null;
  highestStreak: number | null;
  gamesPlayed: number;
  averageScore: number;
};

// Add type guard
const isPawsistenceScore = (score: DailyScore | PawsistenceScore): score is PawsistenceScore => 
  'highestStreak' in score;

// Add this helper function at the top
const getScoreEmoji = (score: number) => {
  switch (score) {
    case 5: return "🏆"; // Perfect score
    case 4: return "🌟"; // Almost perfect
    case 3: return "🎯"; // Good score
    case 2: return "🐾"; // Getting there
    case 1: return "🦴"; // At least they got one
    default: return "🐕"; // Default/zero
  }
};

export function LeaderboardContent({ mode }: LeaderboardContentProps) {
  const { data: session } = useSession();
  const isPawsistence = mode === "pawsistence";
  
  const dailyLeaderboard = api.score.getDailyLeaderboard.useQuery({
    timezone: new Date().getTimezoneOffset(),
  });

  const pawsistenceLeaderboard = api.score.getPawsistenceLeaderboard.useQuery();
  const todayGames = api.score.getTodayGames.useQuery({
    timezone: new Date().getTimezoneOffset(),
  });

  const data = mode === "daily" ? dailyLeaderboard.data : pawsistenceLeaderboard.data;
  const isLoading = mode === "daily" ? dailyLeaderboard.isLoading : pawsistenceLeaderboard.isLoading;

  if (isLoading) {
    return <div className="animate-pulse space-y-2">
      {[...Array(10)].map((_, i) => (
        <div key={i} className="h-12 bg-zinc-800/50 rounded-lg" />
      ))}
    </div>;
  }

  if (!data?.length) {
    return <div className="text-center text-zinc-400 py-8">
      No scores yet today! Be the first to play!
    </div>;
  }

  const userScore = data.find(entry => entry.username === session?.user?.name);

  return (
    <>
      {/* Your Score */}
      {userScore && (
        <div className="bg-green-900/20 rounded-lg p-3 border border-green-900/30">
          <div className="text-green-500 text-xs font-medium mb-2">
            {isPawsistence ? "Your Best" : "Your Rank Today"}
          </div>
          <div className={cn("grid gap-2 text-xs items-center", 
            isPawsistence ? "grid-cols-4" : "grid-cols-5"
          )}>
            <div className="text-green-500">
              #{data.findIndex(entry => entry.username === userScore.username) + 1}
            </div>
            <div className="text-zinc-100 truncate">{userScore.username}</div>
            {isPawsistenceScore(userScore) ? (
              <>
                <div className="text-amber-500">{userScore.highestStreak}🔥</div>
                <div className="text-zinc-400">{userScore.gamesPlayed} games</div>
              </>
            ) : (
              <>
                <div className="text-amber-500">
                  {userScore.score}/5 {getScoreEmoji(userScore.score)}
                </div>
                <div className="text-green-500">{userScore.currentStreak}🔥</div>
                <div className="text-amber-500">{userScore.dailyStreak}🔥</div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Headers */}
      <div className={cn("grid gap-2 text-xs font-medium text-zinc-400 bg-zinc-800/50 p-2 rounded-lg",
        isPawsistence ? "grid-cols-4" : "grid-cols-5"
      )}>
        <div className="text-center">Rank</div>
        <div>Player</div>
        {isPawsistence ? (
          <>
            <div>Best Streak</div>
            <div>Games</div>
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
        {data.map((entry, i) => (
          <div 
            key={entry.username}
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
            <div className="text-green-500 text-center font-bold">#{i + 1}</div>
            <div className={cn("text-zinc-100 truncate", {
              "font-semibold": i < 3
            })}>{entry.username}</div>
            {isPawsistenceScore(entry) ? (
              <>
                <div className="text-amber-500">{entry.highestStreak}🔥</div>
                <div className="text-zinc-400">{entry.gamesPlayed} games</div>
              </>
            ) : (
              <>
                <div className="text-amber-500">
                  {entry.score}/5 {getScoreEmoji(entry.score)}
                </div>
                <div className="text-green-500">{entry.currentStreak}🔥</div>
                <div className="text-amber-500">{entry.dailyStreak}🔥</div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Total Players */}
      <div className="bg-gradient-to-r from-[#8B4513] to-[#DEB887] text-white p-2 rounded-full text-center text-xs font-medium">
        🏆 {mode === "daily" ? `${todayGames.data ?? 0} Total Players Today` : "Top 100 Streaks"} 🏆
      </div>
    </>
  );
}
