"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { api } from "~/trpc/react";
import { Trophy } from "lucide-react";
import { motion } from "framer-motion";

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

export function MonthlyTopPlayersModal({
  open,
  onOpenChange,
}: MonthlyTopPlayersModalProps) {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const { data: topPlayers } = api.score.getMonthlyLeaderboard.useQuery({
    month: currentMonth,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[600px] flex-col gap-0 border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 p-6 sm:max-h-[80vh] sm:max-w-[500px] [&>button]:text-white">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-zinc-50">
            🎉 {new Date().toLocaleString('default', { month: 'long' })}&apos;s Champions 🏆
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col">
          {/* Fixed Podium Section */}
          <div className="flex-none">
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
                      <DogIcons.second />
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
                      <span className="text-2xl">🐕</span>
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
                      <span className="text-lg">🐕</span>
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

          {/* Scrollable List Section */}
          <div className="scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-800/50 -mx-6 flex-1 overflow-y-auto px-6 mt-8">
            <div className="space-y-2">
              {topPlayers?.slice(3).map((player, index) => (
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
        </div>
      </DialogContent>
    </Dialog>
  );
} 