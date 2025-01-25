"use client";

import { useMemo, useState } from "react";
import { api } from "~/trpc/react";
import { cn } from "~/lib/utils";
import { useProfileContext } from "~/app/components/ProfileProvider";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import Image from "next/image";
import { MonthlyTopPlayersModal } from "~/app/components/MonthlyTopPlayersModal";
import { LevelSystemModal, getLevelBadge } from "~/app/components/LevelSystemModal";

// Base type for common properties
interface BaseLeaderboardEntry {
  username: string | null;
  userId: string | null;
  tempId: string | null;
  isVerified: boolean;
  achievements: string[];
  xp: number;
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

// Update PawpulationEntry type
interface PawpulationEntry extends BaseLeaderboardEntry {
  mode: "pawpulation";
  score: number;
  totalPlays: number;
}

// Add monthly type to the union type
type MonthlyEntry = {
  mode: "monthly";
  username: string | null;
  userId: string | null;
  tempId: string | null;
  isVerified: boolean;
  profileImageUrl: string | null;
  achievements: never[];
  totalScore: number;
  gamesPlayed: number;
  xp: number;
  monthlyStats: {
    dailyStreak: number;
    guessStreak: number;
    correctGuesses: number;
    gamesPlayed: number;
  };
  correctGuesses: number;
};

// Union type for all possible entries
type LeaderboardEntry = PawsistenceEntry | DailyEntry | PawpulationEntry | MonthlyEntry;

// Type guard to check if entry is pawsistence
function isPawsistenceEntry(
  entry: LeaderboardEntry,
): entry is PawsistenceEntry {
  return entry.mode === "pawsistence";
}

// Type guard to check if entry is daily

// Type guard to check if entry is pawpulation
function isPawpulationEntry(entry: LeaderboardEntry): entry is PawpulationEntry {
  return entry.mode === "pawpulation";
}

// Add type guard for monthly entries
function isMonthlyEntry(entry: LeaderboardEntry): entry is MonthlyEntry {
  return entry.mode === "monthly";
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
  if (isMonthlyEntry(entry)) {
    const stats = entry.monthlyStats;
    return (
      <div className="flex flex-col gap-1">
        <div className="text-center text-amber-500 font-semibold">
          {entry.totalScore}🏆
        </div>
        <div className="text-xs text-zinc-400">
          <div>Daily: {stats.dailyStreak * 10}</div>
          <div>Streak: {stats.guessStreak * 5}</div>
          <div>Perfect: {stats.correctGuesses * 5}</div>
          <div>Games: {stats.gamesPlayed * 5}</div>
        </div>
      </div>
    );
  }
  if (isPawsistenceEntry(entry)) {
    return (
      <div className="text-center text-amber-500">{entry.highestStreak}🔥</div>
    );
  }
  if (isPawpulationEntry(entry)) {
    return (
      <>
        <div className="text-center text-amber-500">{entry.score}🎯</div>
        <div className="text-center text-green-500">{entry.totalPlays}</div>
      </>
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

// Update AchievementIcons component to match your database achievements
const AchievementIcons = ({ achievements }: { achievements: string[] }) => {
  // Helper function to check if an achievement is superseded by a better one
  const isSuperseded = (achievement: string, allAchievements: string[]) => {
    const [type, rarity] = achievement.split('_');
    
    // If this is a RARE achievement, check if there's a LEGENDARY of the same type
    if (rarity === 'RARE') {
      return allAchievements.some(a => a === `${type}_LEGENDARY`);
    }
    
    return false;
  };

  // Filter out superseded achievements before sorting
  const filteredAchievements = achievements.filter(
    achievement => !isSuperseded(achievement, achievements)
  );

  const sortedAchievements = filteredAchievements.sort((a, b) => {
    const priority = {
      'DAILY_LEGENDARY': 5,    // Pawsome Dedication (10 days)
      'STREAK_LEGENDARY': 4,   // Unleashed Genius (20 streak)
      'STREAK_RARE': 3,        // Pawfect Streak (10 streak)
      'PAWSISTENCE_RARE': 3,   // Paw Pro (15 streak)
      'DAILY_COMMON': 2,       // Furry Regular (4 days)
      'SOCIAL_COMMON': 1,      // Top Dog Influencer
      'COMMUNITY_COMMON': 1,   // Community Contributor
    };
    return (priority[b as keyof typeof priority] || 0) - (priority[a as keyof typeof priority] || 0);
  });

  // Only show top 2 achievements
  const displayAchievements = sortedAchievements.slice(0, 2);

  return (
    <div className="flex items-center gap-[1px]">
      {displayAchievements.map((achievement) => {
        const [rarity] = achievement.split('_');
        const icon = {
          // Legendary achievements (purple)
          'DAILY_LEGENDARY': '👑',    // Pawsome Dedication - Crown for highest daily achievement
          'STREAK_LEGENDARY': '⚡',    // Unleashed Genius - Lightning for highest streak
          
          // Rare achievements (blue)
          'STREAK_RARE': '🔥',        // Pawfect Streak - Fire for streak
          'PAWSISTENCE_RARE': '💫',    // Paw Pro - Star burst for persistence
          
          // Common achievements (white/gray)
          'DAILY_COMMON': '📅',       // Furry Regular - Calendar for daily play
          'SOCIAL_COMMON': '📢',      // Top Dog Influencer - Megaphone for sharing
          'COMMUNITY_COMMON': '📸',    // Community Contributor - Camera for photo submission
        }[achievement] ?? '🏆';
        
        const details = getAchievementDetails(achievement);
        
        return (
          <div
            key={achievement}
            className="group relative cursor-pointer"
          >
            <span className={cn("text-[9px] opacity-75 hover:opacity-100",
              rarity === 'LEGENDARY' && "text-amber-400",
              rarity === 'RARE' && "text-blue-400"
            )}>
              {icon}
            </span>
            <div className="absolute bottom-full left-1/2 z-50 mb-1 hidden -translate-x-1/2 whitespace-normal rounded bg-black/90 px-2 py-1 text-left shadow-lg group-hover:block min-w-[200px] max-w-[240px]">
              <div className="font-semibold text-[11px] text-amber-400/90 mb-0.5 tracking-wide">
                {details.name}
              </div>
              <div className="text-[9px] text-zinc-300/90 font-normal">
                {details.description}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const getAchievementDetails = (achievement: string) => {
  const details = {
    'DAILY_LEGENDARY': {
      name: 'Pawsome Dedication',
      description: 'Return to Barkle for 10 days in a row'
    },
    'STREAK_LEGENDARY': {
      name: 'Unleashed Genius',
      description: 'Get 20 breeds right in a row on daily'
    },
    'STREAK_RARE': {
      name: 'Pawfect Streak',
      description: 'Reach a 10-guess streak on daily barkle'
    },
    'PAWSISTENCE_RARE': {
      name: 'Paw Pro',
      description: 'Reach a 15-streak in Pawsistence mode'
    },
    'DAILY_COMMON': {
      name: 'Furry Regular',
      description: 'Play 4 days in a row'
    },
    'SOCIAL_COMMON': {
      name: 'Top Dog Influencer',
      description: 'Share your account stats'
    },
    'COMMUNITY_COMMON': {
      name: 'Community Contributor',
      description: 'Submit a verified dog photo to the community collection'
    }
  }[achievement] ?? { name: 'Achievement', description: 'Unknown achievement' };

  return details;
};

// Update the mode type
type LeaderboardMode = "daily" | "pawsistence" | "pawpulation" | "monthly";

// Add onUserClick to props
interface LeaderboardContentProps {
  mode: LeaderboardMode;
  setMode?: (mode: LeaderboardMode) => void;
  onUserClick?: (userId: string | null, tempId: string | null) => void;
}

export function LeaderboardContent({
  mode,
  setMode,
  onUserClick,
}: LeaderboardContentProps) {
  const { tempId } = useProfileContext();
  const { data: session } = useSession();
  const userId = session?.user?.id ?? null;

  // Memoize this value to prevent unnecessary recalculations
  const isPawsistence = useMemo(() => mode === "pawsistence", [mode]);
  const isPawpulation = useMemo(() => mode === "pawpulation", [mode]);

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

  // Add pawpulation leaderboard query
  const {
    data: pawpulationLeaderboard,
    isLoading: pawpulationLeaderboardLoading,
  } = api.score.getPawpulationLeaderboard.useQuery(undefined, {
    enabled: mode === "pawpulation",
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  // Add monthly query
  const { data: monthlyLeaderboard, isLoading: monthlyLeaderboardLoading } =
    api.score.getMonthlyLeaderboard.useQuery(
      { month: new Date().toISOString().slice(0, 7) },
      {
        enabled: mode === "monthly",
        staleTime: 60 * 1000,
        gcTime: 5 * 60 * 1000,
      }
    );

  // Update data transformation to handle nulls
  const data = useMemo(() => {
    if (mode === "daily") {
      return dailyLeaderboard?.map((entry) => ({
        ...entry,
        mode: "daily" as const,
        isVerified: entry.isVerified ?? false,
        achievements: entry.achievements ?? [],
        score: entry.score ?? 0,
        currentStreak: entry.currentStreak ?? 0,
        dailyStreak: entry.dailyStreak ?? 0,
        xp: entry.xp ?? 0
      }));
    }
    if (mode === "pawpulation") {
      return pawpulationLeaderboard?.map((entry) => ({
        ...entry,
        mode: "pawpulation" as const,
        isVerified: entry.isVerified ?? false,
        achievements: entry.achievements ?? [],
        score: entry.score ?? 0,
        totalPlays: entry.totalPlays ?? 0,
        xp: entry.xp ?? 0
      }));
    }
    if (mode === "monthly") {
      return monthlyLeaderboard?.map((entry) => ({
        ...entry,
        mode: "monthly" as const,
        isVerified: entry.isVerified ?? false,
        achievements: [],
        totalScore: entry.totalScore ?? 0,
        gamesPlayed: entry.gamesPlayed ?? 0,
        xp: 0
      }));
    }
    return pawsistenceLeaderboard?.map((entry) => ({
      ...entry,
      mode: "pawsistence" as const,
      isVerified: entry.isVerified ?? false,
      achievements: entry.achievements ?? [],
      highestStreak: entry.highestStreak ?? 0,
      xp: entry.xp ?? 0
    }));
  }, [mode, dailyLeaderboard, pawsistenceLeaderboard, pawpulationLeaderboard, monthlyLeaderboard]);

  // Update loading state to include pawpulation
  const isLoading = 
    mode === "daily" ? dailyLeaderboardLoading : 
    mode === "monthly" ? monthlyLeaderboardLoading :
    mode === "pawpulation" ? pawpulationLeaderboardLoading :
    pawsistenceLeaderboardLoading;

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

  // Monthly view with modal
  if (mode === "monthly") {
    return (
      <div className="h-full">
        <MonthlyTopPlayersModal 
          open={true} 
          onOpenChange={() => {
            // Switch back to daily view when modal is closed
            setMode?.("daily");
          }} 
        />
      </div>
    );
  }

  // Return original leaderboard format for other modes
  return (
    <div className="grid h-full grid-rows-[auto_minmax(0,1fr)_auto] gap-2">
      {/* Scrollable content area - modified to start from top */}
      <div className="row-start-2 flex flex-col gap-3 overflow-y-auto pt-2">
        {userScore && (
          <UserScoreSection
            userScore={userScore!}
            userRank={userRank ?? 0}
            isPawsistence={isPawsistence}
            isPawpulation={isPawpulation}
          />
        )}
        <HeadersSection isPawsistence={isPawsistence} isPawpulation={isPawpulation} />
        <ScoresList 
          data={data} 
          isPawsistence={isPawsistence} 
          isPawpulation={isPawpulation}
          onUserClick={onUserClick}
        />
      </div>
    </div>
  );
}

// Split into smaller components for better performance
const UserScoreSection = ({
  userScore,
  userRank,
  isPawsistence,
  isPawpulation,
}: {
  userScore: LeaderboardEntry;
  userRank: number;
  isPawsistence: boolean;
  isPawpulation: boolean;
}) => {
  const levelInfo = getLevelBadge(userScore.xp);
  
  return (
    <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-2 text-xs">
      <div className="mb-1 font-medium text-green-500">Your Score Today</div>
      <div className={cn(
        "grid items-center gap-2",
        isPawsistence ? "grid-cols-3" : 
        isPawpulation ? "grid-cols-[12%_28%_30%_30%]" :
        "grid-cols-[12%_28%_18%_18%_18%]"
      )}>
        <div className="text-center font-bold text-green-500">
          #{userRank + 1}
        </div>
        <div className="flex items-center gap-1">
          <span className="truncate text-zinc-100">{userScore.username}</span>
          {levelInfo && (
            <span className={cn(levelInfo.color ?? "text-zinc-400", "ml-1")}>
              {levelInfo.badge}
            </span>
          )}
        </div>
        {renderScore(userScore)}
      </div>
    </div>
  );
};

const HeadersSection = ({ isPawsistence, isPawpulation }: { 
  isPawsistence: boolean;
  isPawpulation: boolean;
}) => (
  <div
    className={cn(
      "grid h-min gap-2 rounded-lg bg-zinc-800/50 p-2 text-xs font-medium text-zinc-400",
      isPawsistence ? "grid-cols-3" : 
      isPawpulation ? "grid-cols-[12%_28%_30%_30%]" :
      "grid-cols-[12%_28%_18%_18%_18%]"
    )}
  >
    <div className="text-center">Rank</div>
    <div>Player</div>
    {isPawsistence ? (
      <div className="text-center">Best Streak</div>
    ) : isPawpulation ? (
      <>
        <div className="text-center">Best Score</div>
        <div className="text-center">Total Plays</div>
      </>
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
  isPawpulation,
  onUserClick,
}: {
  data: LeaderboardEntry[];
  isPawsistence: boolean;
  isPawpulation: boolean;
  onUserClick?: (userId: string | null, tempId: string | null) => void;
}) => (
  <div className="scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-800/50 max-h-[400px] space-y-1.5 overflow-y-auto pr-1">
    {data.map((entry, i) => {
      const levelInfo = getLevelBadge(entry.xp);
      return (
        <div
          key={`${entry.username}-${i}`}
          className={cn(
            "grid items-center gap-2 rounded-lg border p-2 text-xs shadow-lg",
            isPawsistence ? "grid-cols-3" : 
            isPawpulation ? "grid-cols-[12%_28%_30%_30%]" :
            "grid-cols-[12%_28%_18%_18%_18%]",
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
            <button 
              onClick={() => onUserClick?.(entry.userId, entry.tempId)}
              className="flex items-center gap-1 hover:opacity-80"
            >
              <span className={cn("truncate text-zinc-100", { "font-semibold": i < 3 })}>
                {entry.username}
              </span>
              {levelInfo && (
                <span className={cn(levelInfo.color ?? "text-zinc-400", "ml-1")}>
                  {levelInfo.badge}
                </span>
              )}
            </button>
          </div>
          {renderScore(entry)}
        </div>
      );
    })}
  </div>
);

interface MonthlyPlayer {
  username: string;
  totalScore: number;
  profileImageUrl: string | null;
}

function MonthlyTopPlayersContent({ data }: { data: MonthlyPlayer[] }) {
  return (
    <div className="flex flex-col">
      <div className="flex justify-center">
        <div className="relative flex items-end justify-center gap-4">
          {/* Second Place */}
          {data?.[1] && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex w-24 flex-col items-center"
            >
              <div className="mb-2 h-16 w-16 overflow-hidden rounded-full border-4 border-[#C0C0C0] bg-zinc-800">
                <Image
                  src={data[1].profileImageUrl ?? "/avatars/dogav1.png"}
                  alt={`${data[1].username}'s avatar`}
                  width={64}
                  height={64}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="text-center">
                <div className="font-medium text-zinc-200">{data[1].username}</div>
                <div className="text-sm text-zinc-400">{data[1].totalScore} pts</div>
              </div>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 96 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-2 w-full rounded-t-lg bg-[#C0C0C0]"
              >
                <div className="pt-2 text-center text-2xl">2</div>
              </motion.div>
            </motion.div>
          )}

          {/* First Place */}
          {data?.[0] && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              transition={{ duration: 0.5 }}
              className="flex w-24 flex-col items-center"
            >
              <Trophy className="mb-2 h-8 w-8 text-yellow-500" />
              <div className="mb-2 h-20 w-20 overflow-hidden rounded-full border-4 border-[#FFD700] bg-zinc-800">
                <Image
                  src={data[0].profileImageUrl ?? "/avatars/dogav1.png"}
                  alt={`${data[0].username}'s avatar`}
                  width={80}
                  height={80}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="text-center">
                <div className="font-medium text-zinc-200">{data[0].username}</div>
                <div className="text-sm text-zinc-400">{data[0].totalScore} pts</div>
              </div>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 128 }}
                transition={{ duration: 0.5 }}
                className="mt-2 w-full rounded-t-lg bg-[#FFD700]"
              >
                <div className="pt-2 text-center text-2xl">1</div>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Rest of Top 10 with scrolling */}
      <div className="mt-8 max-h-[200px] space-y-2 overflow-y-auto px-4">
        {data?.slice(3).map((player, index) => (
          <div
            key={player.username}
            className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/50 p-3"
          >
            <div className="flex items-center gap-3">
              <div className="text-lg text-zinc-500">{index + 4}</div>
              <div>
                <div className="font-medium text-zinc-200">{player.username}</div>
                <div className="text-sm text-zinc-400">{player.totalScore} pts</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

