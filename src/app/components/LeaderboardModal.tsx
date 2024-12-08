"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { LeaderboardContent } from "./LeaderboardContent";

interface LeaderboardModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function LeaderboardModal({ open, onOpenChange }: LeaderboardModalProps) {
  const [mode, setMode] = useState<"daily" | "pawsistence">("daily");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button 
          className="w-full py-7 text-xl font-bold bg-gradient-to-br from-zinc-700 to-zinc-800 hover:from-zinc-600 hover:to-zinc-700 text-white rounded-2xl shadow-lg transform transition-all active:scale-95 border border-zinc-600/20"
        >
          LEADERBOARD
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gradient-to-br from-zinc-900 to-zinc-950 border-zinc-800 sm:max-w-[500px] gap-4 [&>button]:text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-zinc-50">
            🏆 Top Scores 🏆
          </DialogTitle>
        </DialogHeader>

        {/* Mode Selector */}
        <div className="flex border-b border-zinc-800">
          <button
            onClick={() => setMode("daily")}
            className={`flex-1 py-3 text-sm font-medium relative ${
              mode === "daily" ? "text-green-500" : "text-zinc-400"
            }`}
          >
            Today&apos;s Barkle
            {mode === "daily" && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-green-500" />
            )}
          </button>
          <button
            onClick={() => setMode("pawsistence")}
            className={`flex-1 py-3 text-sm font-medium relative ${
              mode === "pawsistence" ? "text-green-500" : "text-zinc-400"
            }`}
          >
            Pawsistence
            {mode === "pawsistence" && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-green-500" />
            )}
          </button>
        </div>

        <LeaderboardContent mode={mode} />
      </DialogContent>
    </Dialog>
  );
}