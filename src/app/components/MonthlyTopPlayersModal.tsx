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

const DogIcons = {
  first: () => (
    <svg className="w-8 h-8 text-yellow-500" viewBox="0 0 24 24" fill="currentColor">
      {/* Add custom SVG path for first place dog */}
    </svg>
  ),
  second: () => (
    <svg className="w-7 h-7 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
      {/* Add custom SVG path for second place dog */}
    </svg>
  ),
  third: () => (
    <svg className="w-6 h-6 text-amber-700" viewBox="0 0 24 24" fill="currentColor">
      {/* Add custom SVG path for third place dog */}
    </svg>
  ),
};

const SCORING_INFO = {
  barkle: "Correct Guesses (×5 pts each)",
  daily: "Daily Streak (×25 pts)",
  highest: "Highest Guess Streak (×10 pts)",
  current: "Current Guess Streak (×15 pts)",
  pawsistence: "Highest Pawsistence Streak (×15 pts)",
  pawpulation: "Highest Pawpulation Score (×15 pts)",
  games: "Daily Games Played (×5 pts)",
  pawpulationGames: "Pawpulation Games Played (×5 pts)"
};

export function MonthlyTopPlayersModal({
  open,
  onOpenChange,
}: MonthlyTopPlayersModalProps) {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const { data: topPlayers } = api.score.getMonthlyLeaderboard.useQuery({
    month: currentMonth,
  });

  // Initialize tooltip state as false
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
                  <button 
                    onClick={() => setShowTooltip(!showTooltip)} 
                    className="rounded-full p-1 hover:bg-zinc-800"
                  >
                    <Info className="h-5 w-5 text-zinc-400 hover:text-zinc-300" />
                  </button>
                </TooltipTrigger>
                <TooltipContent 
                  side="bottom" 
                  className="w-72 bg-zinc-900 p-4 text-zinc-100"
                  onPointerDownOutside={() => setShowTooltip(false)}
                >
                  <h3 className="mb-2 font-bold">Monthly Score Calculation:</h3>
                  <ul className="space-y-1 text-sm">
                    {Object.entries(SCORING_INFO).map(([key, desc]) => (
                      <li key={key} className="flex justify-between gap-2">
                        <span>{desc}</span>
                      </li>
                    ))}
                  </ul>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </DialogTitle>
        </DialogHeader>

        {/* Make entire content scrollable */}
        <div className="scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-800/50 -mx-6 flex-1 overflow-y-auto px-6">
          {/* Podium Section */}
          <div className="mb-8">
            <div className="flex justify-center">
              <div className="relative flex items-end justify-center gap-4">
                {/* Second Place */}
                {topPlayers?.[1] && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="flex w-24 flex-col items-center"
                  >
                    <div className="mb-2 h-16 w-16 overflow-hidden rounded-full border-4 border-[#C0C0C0] bg-zinc-800 flex items-center justify-center">
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
          </div>

          {/* List Section */}
          <div className="space-y-2 pb-4">
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
        </div>
      </DialogContent>
    </Dialog>
  );
} 