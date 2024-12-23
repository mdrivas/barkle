"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { LeaderboardContent } from "./LeaderboardContent";

interface LeaderboardModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultMode?: "daily" | "pawsistence" | "pawpulation" | "monthly";
  source?: "pawsistence" | "pawpulation";
  showMonthlyIntro?: boolean;
  onMonthlyIntroClose?: () => void;
}

export function LeaderboardModal({
  open,
  onOpenChange,
  defaultMode = "daily",
}: LeaderboardModalProps) {
  const [mode, setMode] = useState<"daily" | "pawsistence" | "pawpulation" | "monthly">(defaultMode);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[600px] flex-col gap-0 border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 p-6 sm:max-h-[80vh] sm:max-w-[500px] [&>button]:text-white">
        <DialogHeader className="flex-none">
          <DialogTitle className="text-2xl font-bold text-zinc-50">
            <p>🏆 Top Scores 🏆</p>
            <div className="flex h-min border-b border-zinc-800">
              <button
                onClick={() => setMode("daily")}
                className={`relative h-min flex-1 py-3 text-xs font-medium ${
                  mode === "daily" ? "text-green-500" : "text-zinc-400"
                }`}
              >
                Barkle
                {mode === "daily" && (
                  <div className="absolute bottom-0 left-0 h-0.5 w-full bg-green-500" />
                )}
              </button>
              <button
                onClick={() => setMode("monthly")}
                className={`relative h-min flex-1 py-3 text-xs font-medium ${
                  mode === "monthly" ? "text-green-500" : "text-zinc-400"
                }`}
              >
                Monthly
                {mode === "monthly" && (
                  <div className="absolute bottom-0 left-0 h-0.5 w-full bg-green-500" />
                )}
              </button>
              <button
                onClick={() => setMode("pawsistence")}
                className={`relative h-min flex-1 py-3 text-xs font-medium ${
                  mode === "pawsistence" ? "text-green-500" : "text-zinc-400"
                }`}
              >
                Pawsistence
                {mode === "pawsistence" && (
                  <div className="absolute bottom-0 left-0 h-0.5 w-full bg-green-500" />
                )}
              </button>
              <button
                onClick={() => setMode("pawpulation")}
                className={`relative h-min flex-1 py-3 text-xs font-medium ${
                  mode === "pawpulation" ? "text-green-500" : "text-zinc-400"
                }`}
              >
                Pawpulation
                {mode === "pawpulation" && (
                  <div className="absolute bottom-0 left-0 h-0.5 w-full bg-green-500" />
                )}
              </button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="relative flex-1 overflow-hidden">
          <LeaderboardContent mode={mode} />
        </div>

        <DialogFooter className="flex-none">
          <div className="h-min w-full rounded-full bg-gradient-to-r from-[#8B4513] to-[#DEB887] p-2 text-center text-xs font-medium text-white">
            🏆 {mode === "pawsistence" 
              ? "Top 100 Streaks" 
              : mode === "pawpulation"
              ? "Top Pawpulation Scores"
              : mode === "monthly"
              ? "Monthly Champions"
              : "Today's Top 100"} 🏆
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
