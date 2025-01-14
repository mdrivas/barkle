"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Progress } from "~/components/ui/progress";
import { api } from "~/trpc/react";
import { useSession } from "next-auth/react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import { ChevronDown } from "lucide-react";

export interface LevelTier {
  level: number;
  title: string;
  requiredXP: number;
  badge: string;
  color: string;
}

export const LEVEL_TIERS: LevelTier[] = [
  {
    level: 1,
    title: "Puppy Paddler",
    requiredXP: 0,
    badge: "🐕",
    color: "text-zinc-400"
  },
  {
    level: 2,
    title: "Tail Tracker",
    requiredXP: 500,
    badge: "🦮",
    color: "text-green-400"
  },
  {
    level: 3,
    title: "Bark Beginner",
    requiredXP: 1500,
    badge: "🐕‍🦺",
    color: "text-blue-400"
  },
  {
    level: 4,
    title: "Paw Patroller",
    requiredXP: 3500,
    badge: "🐾",
    color: "text-purple-400"
  },
  {
    level: 5,
    title: "Canine Cadet",
    requiredXP: 7500,
    badge: "🎖️",
    color: "text-yellow-400"
  },
  {
    level: 6,
    title: "Breed Buddy",
    requiredXP: 20000,
    badge: "🏅",
    color: "text-orange-400"
  },
  {
    level: 7,
    title: "Doggy Detective",
    requiredXP: 35000,
    badge: "🔍",
    color: "text-pink-400"
  },
  {
    level: 8,
    title: "Furry Fanatic",
    requiredXP: 50000,
    badge: "⭐",
    color: "text-amber-400"
  },
  {
    level: 9,
    title: "Hound Hero",
    requiredXP: 75000,
    badge: "👑",
    color: "text-indigo-400"
  },
  {
    level: 10,
    title: "Barkle Master",
    requiredXP: 100000,
    badge: "🏆",
    color: "text-red-400"
  },
];

export function getLevelBadge(xp: number) {
  const currentTier = [...LEVEL_TIERS]
    .reverse()
    .find(tier => xp >= tier.requiredXP);
  
  return currentTier ?? LEVEL_TIERS[0];
}

interface LevelSystemModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  userId?: string | null;
  tempId?: string | null;
}

export function LevelSystemModal({ open, onOpenChange, userId, tempId }: LevelSystemModalProps) {
  const { data: userStats, error } = api.score.getMonthlyStats.useQuery(
    { 
      userId: userId === null ? undefined : userId,
      tempId: tempId === null ? undefined : tempId
    },
    {
      enabled: open,
      refetchOnMount: true
    }
  );

  // Show loading state while fetching
  if (!userStats && open) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 p-8">
          <div className="flex items-center justify-center p-8">
            <div className="text-zinc-400">Loading...</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error) return null;
  if (!userStats) return null;

  const currentXP = userStats.xp;
  
  const getCurrentLevel = (xp: number) => {
    const currentTier = LEVEL_TIERS.findLast(tier => xp >= tier.requiredXP);
    return currentTier ?? LEVEL_TIERS[0];
  };

  const currentTier = getCurrentLevel(currentXP);
  const nextTier = LEVEL_TIERS[currentTier.level] ?? currentTier;
  
  const progressToNext = nextTier === currentTier ? 100 :
    ((currentXP - currentTier.requiredXP) / (nextTier.requiredXP - currentTier.requiredXP)) * 100;

  // Updated XP breakdown with actual values
  const xpBreakdown = userStats?.xpBreakdown && userStats.stats ? (
    <Collapsible className="mt-4">
      <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-2 text-sm text-zinc-400 hover:bg-zinc-800/50">
        <span>XP Breakdown</span>
        <ChevronDown className="h-4 w-4" />
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2 space-y-2 text-sm text-zinc-400">
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
          <ul className="space-y-2">
            <li className="flex justify-between">
              <span>Games Played ({userStats.stats.totalGamesPlayed})</span>
              <span>{userStats.stats.totalGamesPlayed * 20} XP</span>
            </li>
            <li className="flex justify-between">
              <span>Perfect Scores ({userStats.stats.perfectScores})</span>
              <span>{userStats.stats.perfectScores * 50} XP</span>
            </li>
            <li className="flex justify-between">
              <span>Current Daily Streak ({userStats.stats.currentDailyStreak})</span>
              <span>{userStats.stats.currentDailyStreak * 25} XP</span>
            </li>
            <li className="flex justify-between">
              <span>Highest Daily Streak ({userStats.stats.highestDailyStreak})</span>
              <span>{userStats.stats.highestDailyStreak * 50} XP</span>
            </li>
            <li className="flex justify-between">
              <span>Pawsistence Best ({userStats.stats.highestPawsistenceStreak})</span>
              <span>{userStats.stats.highestPawsistenceStreak * 25} XP</span>
            </li>
            <li className="flex justify-between">
              <span>Pawpulation Games ({userStats.stats.totalPawpulationGames})</span>
              <span>{userStats.stats.totalPawpulationGames * 10} XP</span>
            </li>
            <li className="flex justify-between">
              <span>Pawpulation Score ({userStats.stats.highestPawpulationScore})</span>
              <span>{userStats.stats.highestPawpulationScore * 10} XP</span>
            </li>
            <li className="border-t border-zinc-800 my-2" />
            <li className="flex justify-between font-medium">
              <span>Total XP</span>
              <span>{userStats.xp.toLocaleString()} XP</span>
            </li>
          </ul>
        </div>
      </CollapsibleContent>
    </Collapsible>
  ) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 p-8">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-zinc-50">
            🎖️ Level System
          </DialogTitle>
        </DialogHeader>

        <div className="mt-6 space-y-6">
          {/* Current Level Display */}
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
            <div className="text-center">
              <span className="text-4xl">{currentTier?.badge}</span>
              <h3 className={`mt-2 text-xl font-bold ${currentTier?.color}`}>
                {currentTier?.title}
              </h3>
              <p className="mt-1 text-sm text-zinc-400">
                Level {currentTier?.level}
              </p>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">XP: {currentXP.toLocaleString()}</span>
                <span className="text-zinc-400">
                  {nextTier === currentTier ? "MAX" : `${nextTier.requiredXP.toLocaleString()} XP`}
                </span>
              </div>
              <Progress value={progressToNext} className="h-2" />
            </div>

            {xpBreakdown}
          </div>

          {/* Level Tiers List */}
          <div className="max-h-[300px] space-y-2 overflow-y-auto">
            {LEVEL_TIERS.map((tier) => (
              <div
                key={tier.level}
                className={`flex items-center justify-between rounded-lg border ${
                  tier === currentTier
                    ? "border-zinc-600 bg-zinc-800/50"
                    : "border-zinc-800 bg-zinc-900/50"
                } p-4`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{tier.badge}</span>
                  <div>
                    <h4 className={`font-bold ${tier.color}`}>{tier.title}</h4>
                    <p className="text-sm text-zinc-400">
                      Level {tier.level} ({tier.requiredXP} XP)
                    </p>
                  </div>
                </div>
                {tier === currentTier && (
                  <span className="rounded-full bg-zinc-700 px-2 py-1 text-xs font-medium text-zinc-300">
                    Current
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}