"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { LeaderboardContent } from "./LeaderboardContent";

interface LeaderboardModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultMode?: "daily" | "pawsistence";
  source?: "pawsistence";
}

export function LeaderboardModal({ 
  open, 
  onOpenChange, 
  defaultMode = "daily",
  source 
}: LeaderboardModalProps) {
  const [mode, setMode] = useState<"daily" | "pawsistence">(defaultMode);

  const handleClose = () => {
    if (source === "pawsistence") {
      window.location.href = '/';
    }
    onOpenChange?.(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
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