"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { api } from "~/trpc/react";
import { Trophy, Info } from "lucide-react";
import { motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import Image from "next/image";
import { useState } from "react";

interface MonthlyTopPlayersModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const SCORING_INFO = {
  daily: "Daily Streak (×10 pts)",
  streak: "Current Guess Streak (×5 pts)",
  correct: "Correct Guesses This Month (×5 pts)",
  games: "Games Played This Month (×5 pts)",
};

export function MonthlyTopPlayersModal({
  open,
  onOpenChange,
}: MonthlyTopPlayersModalProps) {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const { data: topPlayers } = api.score.getMonthlyLeaderboard.useQuery({
    month: currentMonth,
  });

  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[600px] flex-col gap-0 border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 p-6 sm:max-h-[80vh] sm:max-w-[500px] [&>button]:text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-center gap-2 text-center text-2xl font-bold text-zinc-50">
            <span>
              🎉 {new Date().toLocaleString('default', { month: 'long' })}&apos;s Champions 🏆
            </span>
            <TooltipProvider delayDuration={0}>
              <Tooltip open={showTooltip}>
                <TooltipTrigger asChild>
                  <Info
                    className="h-5 w-5 cursor-help text-zinc-400 hover:text-zinc-300"
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                  />
                </TooltipTrigger>
                <TooltipContent className="space-y-2 bg-zinc-900 p-4">
                  <h3 className="font-semibold text-zinc-200">Monthly Scoring System</h3>
                  <ul className="space-y-1 text-sm text-zinc-400">
                    {Object.entries(SCORING_INFO).map(([key, info]) => (
                      <li key={key} className="flex items-center gap-2">
                        <span>• {info}</span>
                      </li>
                    ))}
                  </ul>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </DialogTitle>
        </DialogHeader>

        <div className="mt-8 flex flex-col items-center">
          <div className="flex items-end justify-center gap-4">
            {/* Second Place */}
            {topPlayers?.[1] && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: "auto" }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex w-24 flex-col items-center"
              >
                <div className="mb-2 h-16 w-16 overflow-hidden rounded-full border-4 border-[#C0C0C0] bg-zinc-800">
                  <Image
                    src={topPlayers[1].profileImageUrl ?? "/avatars/dogav1.png"}
                    alt={`${topPlayers[1].username}'s avatar`}
                    width={64}
                    height={64}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="text-center">
                  <div className="font-medium text-zinc-200">{topPlayers[1].username}</div>
                  <div className="text-sm text-zinc-400">{topPlayers[1].totalScore} pts</div>
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
            {topPlayers?.[0] && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: "auto" }}
                transition={{ duration: 0.5 }}
                className="flex w-24 flex-col items-center"
              >
                <Trophy className="mb-2 h-8 w-8 text-yellow-500" />
                <div className="mb-2 h-20 w-20 overflow-hidden rounded-full border-4 border-[#FFD700] bg-zinc-800">
                  <Image
                    src={topPlayers[0].profileImageUrl ?? "/avatars/dogav1.png"}
                    alt={`${topPlayers[0].username}'s avatar`}
                    width={80}
                    height={80}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="text-center">
                  <div className="font-medium text-zinc-200">{topPlayers[0].username}</div>
                  <div className="text-sm text-zinc-400">{topPlayers[0].totalScore} pts</div>
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

            {/* Third Place */}
            {topPlayers?.[2] && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: "auto" }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex w-24 flex-col items-center"
              >
                <div className="mb-2 h-14 w-14 overflow-hidden rounded-full border-4 border-[#CD7F32] bg-zinc-800">
                  <Image
                    src={topPlayers[2].profileImageUrl ?? "/avatars/dogav1.png"}
                    alt={`${topPlayers[2].username}'s avatar`}
                    width={56}
                    height={56}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="text-center">
                  <div className="font-medium text-zinc-200">{topPlayers[2].username}</div>
                  <div className="text-sm text-zinc-400">{topPlayers[2].totalScore} pts</div>
                </div>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 80 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="mt-2 w-full rounded-t-lg bg-[#CD7F32]"
                >
                  <div className="pt-2 text-center text-2xl">3</div>
                </motion.div>
              </motion.div>
            )}
          </div>
        </div>

        {/* List Section */}
        <div className="mt-8 space-y-2 overflow-y-auto px-4">
          {topPlayers?.slice(3).map((player, index) => (
            <div
              key={player.username}
              className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/50 p-3"
            >
              <div className="flex items-center gap-3">
                <div className="text-lg text-zinc-500">{index + 4}</div>
                <div className="h-8 w-8 overflow-hidden rounded-full">
                  <Image
                    src={player.profileImageUrl ?? "/avatars/dogav1.png"}
                    alt={`${player.username}'s avatar`}
                    width={32}
                    height={32}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <div className="font-medium text-zinc-200">{player.username}</div>
                  <div className="text-sm text-zinc-400">{player.totalScore} pts</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}