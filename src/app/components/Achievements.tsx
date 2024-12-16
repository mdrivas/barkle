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

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {achievements.map((achievement) => (
        <Card
          key={achievement.id}
          className={cn(
            "relative overflow-hidden p-4 transition-all",
            achievement.isUnlocked
              ? "bg-zinc-800/50 ring-1 ring-zinc-700"
              : "bg-zinc-900/50 opacity-50"
          )}
        >
          <div className="flex items-start gap-4">
            <div className={cn(
              "rounded-lg p-2",
              achievement.isUnlocked ? "bg-zinc-700" : "bg-zinc-800"
            )}>
              <Trophy className={cn(
                "h-6 w-6",
                achievement.isUnlocked ? "text-yellow-500" : "text-zinc-500"
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
          {achievement.rarity !== 'common' && (
            <div className="absolute right-2 top-2">
              <span className={cn(
                "rounded-full px-2 py-0.5 text-xs",
                achievement.rarity === 'rare' 
                  ? "bg-yellow-500/10 text-yellow-500"
                  : "bg-purple-500/10 text-purple-500"
              )}>
                {achievement.rarity}
              </span>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
