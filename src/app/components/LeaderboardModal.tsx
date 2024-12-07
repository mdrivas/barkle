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

export function LeaderboardModal() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"daily" | "pawsistence">("daily");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          className="flex-1 py-3 text-sm font-semibold bg-zinc-600 hover:bg-zinc-500 text-white rounded-full shadow-lg"
        >
          LEADERBOARD
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gradient-to-br from-zinc-900 to-zinc-950 border-zinc-800 sm:max-w-[500px] gap-4">
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