"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

interface DailyInstructionsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DailyInstructions({ isOpen, onClose }: DailyInstructionsProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="fixed left-1/2 top-1/2 w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-zinc-800 bg-zinc-950/95 text-zinc-50 sm:w-full sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            How to Play
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 px-4 sm:px-6">
          {/* Main Instructions */}
          <p className="text-center text-sm text-zinc-300 sm:text-base">
            Guess the breed of 5 dogs each day! Choose the correct breed from 4
            options to score big.
          </p>

          {/* Instructions Grid */}
          <div className="grid gap-4">
            <div className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800">
                <span role="img" aria-label="target">
                  🎯
                </span>
              </div>
              <p className="text-sm text-zinc-300">
                Four choices per dog — pick the right one!
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800">
                <span role="img" aria-label="correct and wrong feedback">
                  ✨
                </span>
              </div>
              <p className="text-sm text-zinc-300">
                Green means correct; red means try again.
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800">
                <span role="img" aria-label="daily refresh">
                  🔄
                </span>
              </div>
              <p className="text-sm text-zinc-300">
                New dogs to guess every day!
              </p>
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={onClose}
            className="w-full rounded-lg bg-sky-600 py-2.5 font-medium text-white transition-colors hover:bg-sky-700"
          >
            Let's Play →
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
