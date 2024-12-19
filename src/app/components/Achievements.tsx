import { Trophy } from "lucide-react";
import { Card } from "~/components/ui/card";
import { cn } from "~/lib/utils";

type Achievement = {
  id: number;
  name: string;
  description: string;
  icon: string;
  rarity: string | null;  // Changed from just string
  isUnlocked: boolean;
  unlockedAt?: Date;
};

export const ACHIEVEMENT_TYPES = {
  STREAK: 'streak',
  DAILY: 'daily',
  SOCIAL: 'social',
  COMMUNITY: 'community',
  PAWSISTENCE: 'pawsistence',
} as const;

const getAchievementIcon = (type: string) => {
  const icons = {
    'STREAK': '⚡',
    'DAILY': '📅',
    'SOCIAL': '🦮',
    'COMMUNITY': '📸',
    'PAWSISTENCE': '🎯',
  };
  return icons[type as keyof typeof icons] ?? '🏆';
};

const getAchievementColor = (type: string) => {
  const colors = {
    'STREAK': 'yellow',
    'DAILY': 'blue',
    'SOCIAL': 'green',
    'COMMUNITY': 'purple',
    'PAWSISTENCE': 'red', // Add new color
  };
  return colors[type as keyof typeof colors] ?? 'gray';
};

export function Achievements({ 
  achievements, 
  isLoading 
}: { 
  achievements: Achievement[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {[...Array(3)].map((_, i) => (
        <Card key={i} className="h-24 animate-pulse bg-zinc-800/50" />
      ))}
    </div>;
  }

  // Group achievements by rarity
  const groupedAchievements = achievements.reduce((acc, achievement) => {
    const rarity = achievement.rarity ?? 'common';
    if (!acc[rarity]) acc[rarity] = [];
    acc[rarity].push(achievement);
    return acc;
  }, {} as Record<string, Achievement[]>);

  // Define rarity order
  const rarityOrder = ['legendary', 'rare', 'common'];

  return (
    <div className="space-y-6">
      {rarityOrder.map(rarity => {
        const rarityAchievements = groupedAchievements[rarity];
        if (!rarityAchievements?.length) return null;

        return (
          <div key={rarity} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {rarityAchievements.map((achievement) => (
                <Card
                  key={achievement.id}
                  className={cn(
                    "relative overflow-hidden p-4 transition-all",
                    achievement.isUnlocked
                      ? "bg-zinc-800/50 ring-1 ring-zinc-700"
                      : "bg-zinc-900/50 opacity-50",
                    // Add subtle glow effect based on rarity
                    {
                      "shadow-lg shadow-purple-500/10": rarity === 'legendary',
                      "shadow-md shadow-yellow-500/10": rarity === 'rare',
                    }
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "rounded-lg p-2",
                      achievement.isUnlocked ? "bg-zinc-700" : "bg-zinc-800"
                    )}>
                      <Trophy className={cn(
                        "h-6 w-6",
                        achievement.isUnlocked 
                          ? {
                              "text-purple-400": rarity === 'legendary',
                              "text-yellow-500": rarity === 'rare',
                              "text-zinc-400": rarity === 'common',
                            }
                          : "text-zinc-500"
                      )} />
                    </div>
                    <div>
                      <h3 className={cn(
                        "font-medium",
                        achievement.isUnlocked ? "text-zinc-100" : "text-zinc-400"
                      )}>
                        {achievement.name}
                      </h3>
                      <p className={cn(
                        "text-sm",
                        achievement.isUnlocked ? "text-zinc-300" : "text-zinc-500"
                      )}>
                        {achievement.description}
                      </p>
                      {achievement.isUnlocked && (
                        <p className="mt-1 text-xs text-zinc-500">
                          Unlocked {achievement.unlockedAt?.toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="absolute right-2 top-2">
                    <span className={cn(
                      "rounded-full px-2 py-0.5 text-xs",
                      {
                        "bg-purple-500/10 text-purple-400": rarity === 'legendary',
                        "bg-yellow-500/10 text-yellow-500": rarity === 'rare',
                        "bg-zinc-500/10 text-zinc-400": rarity === 'common',
                      }
                    )}>
                      {rarity}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
