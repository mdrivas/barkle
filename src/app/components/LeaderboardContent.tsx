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
  tempId: string | null;
  isCurrentUser: boolean;
};

type PawsistenceScore = {
  username: string | null;
  highestStreak: number | null;
  userId: string | null;
  tempId: string | null;
  isCurrentUser: boolean;
};

const isPawsistenceScore = (score: DailyScore | PawsistenceScore): score is PawsistenceScore => 
  'highestStreak' in score;

export function LeaderboardContent({ mode }: LeaderboardContentProps) {
  const { data: session } = useSession();
  const isPawsistence = mode === "pawsistence";
  
  const dailyLeaderboard = api.score.getDailyLeaderboard.useQuery({
    tempId: !session?.user ? localStorage.getItem("barkle_temp_id") ?? undefined : undefined,
  });
  const pawsistenceLeaderboard = api.score.getPawsistenceLeaderboard.useQuery({
    tempId: !session?.user ? localStorage.getItem("barkle_temp_id") ?? undefined : undefined,
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
      No scores yet! Be the first to play!
    </div>;
  }

  const userScore = data?.find(entry => entry.isCurrentUser);

  return (
    <>
      {/* Your Score */}
      {userScore && (
        <div className="bg-green-900/20 rounded-lg p-3 border border-green-900/30">
          <div className="text-green-500 text-xs font-medium mb-2">
            Your Best Streak
          </div>
          <div className={cn("grid items-center", 
            isPawsistence 
              ? "grid-cols-3 gap-2" // Match the 3 columns for pawsistence
              : "grid-cols-5 gap-2" // Match the 5 columns for daily
          )}>
            <div className="text-green-500 text-center font-bold">
              #{data.findIndex(entry => entry.username === userScore.username) + 1}
            </div>
            <div className="text-zinc-100 truncate">{userScore.username}</div>
            {isPawsistenceScore(userScore) ? (
              <div className="text-amber-500 text-center">{userScore.highestStreak}🔥</div>
            ) : (
              <>
                <div className="text-amber-500 text-center">{userScore.score}/5</div>
                <div className="text-green-500 text-center">{userScore.currentStreak}🔥</div>
                <div className="text-amber-500 text-center">{userScore.dailyStreak}🔥</div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Headers */}
      <div className={cn("grid gap-2 text-xs font-medium text-zinc-400 bg-zinc-800/50 p-2 rounded-lg",
        isPawsistence ? "grid-cols-3" : "grid-cols-5"
      )}>
        <div className="text-center">Rank</div>
        <div>Player</div>
        {isPawsistence ? (
          <div className="text-center">Best Streak</div>
        ) : (
          <>
            <div className="text-center">Score</div>
            <div className="text-center">Streak</div>
            <div className="text-center">Daily</div>
          </>
        )}
      </div>

      {/* Scores List */}
      <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-800/50">
        {data.map((entry, i) => (
          <div 
            key={entry.username}
            className={cn(
              "grid gap-2 text-xs p-2 rounded-lg border items-center shadow-lg",
              isPawsistence ? "grid-cols-3" : "grid-cols-5",
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
              <div className="text-amber-500 text-center">{entry.highestStreak}🔥</div>
            ) : (
              <>
                <div className="text-amber-500 text-center">{entry.score}/5</div>
                <div className="text-green-500 text-center">{entry.currentStreak}🔥</div>
                <div className="text-amber-500 text-center">{entry.dailyStreak}🔥</div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Total Players */}
      <div className="bg-gradient-to-r from-[#8B4513] to-[#DEB887] text-white p-2 rounded-full text-center text-xs font-medium">
        🏆 {isPawsistence ? "Top 100 Streaks" : "Today's Top 100"} 🏆
      </div>
    </>
  );
}
