"use client";

import { useMemo } from "react";
import { api } from "~/trpc/react";
import { cn } from "~/lib/utils";
import { useProfileContext } from "~/app/components/ProfileProvider";
import { useSession } from "next-auth/react";

// Base type for common properties
interface BaseLeaderboardEntry {
  username: string | null;
  userId: string | null;
  tempId: string | null;
  isVerified: boolean;
}

// Specific types for each leaderboard mode
interface PawsistenceEntry extends BaseLeaderboardEntry {
  mode: "pawsistence";
  highestStreak: number | null;
}

interface DailyEntry extends BaseLeaderboardEntry {
  mode: "daily";
  score: number;
  currentStreak: number | null;
  dailyStreak: number | null;
}

// Union type for all possible entries
type LeaderboardEntry = PawsistenceEntry | DailyEntry;

// Type guard to check if entry is pawsistence
function isPawsistenceEntry(
  entry: LeaderboardEntry,
): entry is PawsistenceEntry {
  return entry.mode === "pawsistence";
}

// Type guard to check if entry is daily
function isDailyEntry(entry: LeaderboardEntry): entry is DailyEntry {
  return entry.mode === "daily";
}

// Helper function to check if an entry matches the current user
const isCurrentUser = (
  entry: LeaderboardEntry,
  tempId: string | null,
  userId: string | null,
): boolean => {
  if (!tempId && !userId) return false;
  return userId ? entry.userId === userId : entry.tempId === tempId;
};

// Helper to render score based on entry type
const renderScore = (entry: LeaderboardEntry) => {
  if (isPawsistenceEntry(entry)) {
    return (
      <div className="text-center text-amber-500">{entry.highestStreak}🔥</div>
    );
  }

  return (
    <>
      <div className="text-center text-amber-500">{entry.score}/5</div>
      <div className="text-center text-green-500">{entry.currentStreak}🔥</div>
      <div className="text-center text-amber-500">{entry.dailyStreak}🔥</div>
    </>
  );
};

export function LeaderboardContent({
  mode,
}: {
  mode: "daily" | "pawsistence";
}) {
  const { tempId } = useProfileContext();
  const { data: session } = useSession();
  const userId = session?.user?.id ?? null;

  // Memoize this value to prevent unnecessary recalculations
  const isPawsistence = useMemo(() => mode === "pawsistence", [mode]);

  // Optimize queries with proper options
  const { data: dailyLeaderboard, isLoading: dailyLeaderboardLoading } =
    api.score.getDailyLeaderboard.useQuery(undefined, {
      // Only fetch when this tab is active
      enabled: mode === "daily",
      // Keep data for 1 minute when switching tabs
      staleTime: 60 * 1000,
      // Keep cached data when switching tabs
      gcTime: 5 * 60 * 1000,
    });

  const {
    data: pawsistenceLeaderboard,
    isLoading: pawsistenceLeaderboardLoading,
  } = api.score.getPawsistenceLeaderboard.useQuery(undefined, {
    enabled: mode === "pawsistence",
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  // Memoize the transformed data
  const data = useMemo(() => {
    if (mode === "daily") {
      return dailyLeaderboard?.map((entry) => ({
        ...entry,
        mode: "daily" as const,
        isVerified: entry.isVerified ?? false
      }));
    }
    return pawsistenceLeaderboard?.map((entry) => ({
      ...entry,
      mode: "pawsistence" as const,
      isVerified: entry.isVerified ?? false
    }));
  }, [mode, dailyLeaderboard, pawsistenceLeaderboard]);

  const isLoading =
    mode === "daily" ? dailyLeaderboardLoading : pawsistenceLeaderboardLoading;

  // Memoize user-related calculations
  const { userScore, userRank } = useMemo(() => {
    const score = data?.find((entry) => isCurrentUser(entry, tempId, userId));
    const rank = data?.findIndex((entry) =>
      isCurrentUser(entry, tempId, userId),
    );
    return { userScore: score, userRank: rank };
  }, [data, tempId, userId]);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="h-12 rounded-lg bg-zinc-800/50" />
        ))}
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div className="py-8 text-center text-zinc-400">
        No scores yet! Be the first to play!
      </div>
    );
  }

  return (
    <div className="grid h-full grid-rows-[auto_minmax(0,1fr)_auto] gap-2">
      {/* Scrollable content area - modified to start from top */}
      <div className="row-start-2 flex flex-col gap-3 overflow-y-auto pt-2">
        {userScore && (
          <UserScoreSection
            userScore={userScore}
            userRank={userRank}
            isPawsistence={isPawsistence}
          />
        )}
        <HeadersSection isPawsistence={isPawsistence} />
        <ScoresList data={data} isPawsistence={isPawsistence} />
      </div>
    </div>
  );
}

// Split into smaller components for better performance
const UserScoreSection = ({
  userScore,
  userRank,
  isPawsistence,
}: {
  userScore: LeaderboardEntry | undefined;
  userRank: number | undefined;
  isPawsistence: boolean;
}) => (
  <div className="rounded-lg border border-green-900/30 bg-green-900/20 p-3">
    <div className="mb-2 text-xs font-medium text-green-500">
      {isPawsistence ? "Your Best Score" : "Your Score Today"}
    </div>
    <div
      className={cn(
        "grid items-center",
        isPawsistence ? "grid-cols-3 gap-2" : "grid-cols-5 gap-2",
      )}
    >
      <div className="text-center font-bold text-green-500">
        {userRank !== undefined ? `#${userRank + 1}` : "N/A"}
      </div>
      <div className="truncate text-zinc-100">{userScore?.username}</div>
      {userScore ? (
        isPawsistence && isPawsistenceEntry(userScore) ? (
          <div className="text-center text-amber-500">
            {userScore.highestStreak}🔥
          </div>
        ) : (
          isDailyEntry(userScore) && (
            <>
              <div className="text-center text-amber-500">
                {userScore.score}/5
              </div>
              <div className="text-center text-green-500">
                {userScore.currentStreak}🔥
              </div>
              <div className="text-center text-amber-500">
                {userScore.dailyStreak}🔥
              </div>
            </>
          )
        )
      ) : (
        <div className="text-zinc-400">You haven&apos;t played yet!</div>
      )}
    </div>
  </div>
);

const HeadersSection = ({ isPawsistence }: { isPawsistence: boolean }) => (
  <div
    className={cn(
      "grid h-min gap-2 rounded-lg bg-zinc-800/50 p-2 text-xs font-medium text-zinc-400",
      isPawsistence ? "grid-cols-3" : "grid-cols-[12%_28%_18%_18%_18%]"
    )}
  >
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
);

const ScoresList = ({
  data,
  isPawsistence,
}: {
  data: LeaderboardEntry[];
  isPawsistence: boolean;
}) => (
  <div className="scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-800/50 max-h-[400px] space-y-1.5 overflow-y-auto pr-1">
    {data.map((entry, i) => (
      <div
        key={`${entry.username}-${i}`}
        className={cn(
          "grid items-center gap-2 rounded-lg border p-2 text-xs shadow-lg",
          isPawsistence ? "grid-cols-3" : "grid-cols-[12%_28%_18%_18%_18%]",
          {
            "bg-gold animate-medal-shine": i === 0,
            "bg-silver animate-medal-shine": i === 1,
            "bg-bronze animate-medal-shine": i === 2,
            "border-zinc-800 bg-zinc-800/30": i > 2,
          },
        )}
      >
        <div className="text-center font-bold text-green-500">#{i + 1}</div>
        <div className="flex items-center gap-1">
          <span className={cn("truncate text-zinc-100", { "font-semibold": i < 3 })}>
            {entry.username}
          </span>
        </div>
        {renderScore(entry)}
      </div>
    ))}
  </div>
);
