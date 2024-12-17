"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { LeaderboardContent } from "./LeaderboardContent";

interface LeaderboardModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultMode?: "daily" | "pawsistence" | "pawpulation";
  source?: "pawsistence" | "pawpulation";
}

export function LeaderboardModal({
  open,
  onOpenChange,
  defaultMode = "daily",
  source,
}: LeaderboardModalProps) {
  const [mode, setMode] = useState<"daily" | "pawsistence" | "pawpulation">(defaultMode);

  const handleClose = () => {
    if (source === "pawsistence" || source === "pawpulation") {
      window.location.href = "/";
    }
    onOpenChange?.(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="flex h-[600px] flex-col gap-0 border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 p-6 sm:max-h-[80vh] sm:max-w-[500px] [&>button]:text-white">
        <DialogHeader className="flex-none">
          <DialogTitle className="text-2xl font-bold text-zinc-50">
            <p>🏆 Top Scores 🏆</p>
            <div className="flex h-min border-b border-zinc-800">
              <button
                onClick={() => setMode("daily")}
                className={`relative h-min flex-1 py-3 text-sm font-medium ${
                  mode === "daily" ? "text-green-500" : "text-zinc-400"
                }`}
              >
                Today&apos;s Barkle
                {mode === "daily" && (
                  <div className="absolute bottom-0 left-0 h-0.5 w-full bg-green-500" />
                )}
              </button>
              <button
                onClick={() => setMode("pawsistence")}
                className={`relative h-min flex-1 py-3 text-sm font-medium ${
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
                className={`relative h-min flex-1 py-3 text-sm font-medium ${
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

        <div className="flex-1 overflow-hidden">
          <LeaderboardContent mode={mode} />
        </div>

        <DialogFooter className="flex-none">
          <div className="h-min w-full rounded-full bg-gradient-to-r from-[#8B4513] to-[#DEB887] p-2 text-center text-xs font-medium text-white">
            🏆 {mode === "pawsistence" 
              ? "Top 100 Streaks" 
              : mode === "pawpulation"
              ? "Top Pawpulation Scores"
              : "Today's Top 100"} 🏆
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
