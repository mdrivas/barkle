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
      <DialogContent className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] sm:w-full sm:max-w-[400px] bg-zinc-950/95 text-zinc-50 border border-zinc-800 rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            How to Play
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 px-4 sm:px-6">
          {/* Main Instructions */}
          <p className="text-zinc-300 text-center text-sm sm:text-base">
            Guess the breed of 5 dogs each day! Choose the correct breed from 4 options to score big.
          </p>

          {/* Instructions Grid */}
          <div className="grid gap-4">
            <div className="flex items-center gap-3 bg-zinc-900/50 p-3 rounded-lg border border-zinc-800">
              <div className="w-8 h-8 flex justify-center items-center bg-zinc-800 rounded-full">
                <span role="img" aria-label="target">🎯</span>
              </div>
              <p className="text-sm text-zinc-300">Four choices per dog — pick the right one!</p>
            </div>

            <div className="flex items-center gap-3 bg-zinc-900/50 p-3 rounded-lg border border-zinc-800">
              <div className="w-8 h-8 flex justify-center items-center bg-zinc-800 rounded-full">
                <span role="img" aria-label="correct and wrong feedback">✨</span>
              </div>
              <p className="text-sm text-zinc-300">Green means correct; red means try again.</p>
            </div>

            <div className="flex items-center gap-3 bg-zinc-900/50 p-3 rounded-lg border border-zinc-800">
              <div className="w-8 h-8 flex justify-center items-center bg-zinc-800 rounded-full">
                <span role="img" aria-label="daily refresh">🔄</span>
              </div>
              <p className="text-sm text-zinc-300">New dogs to guess every day!</p>
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-medium rounded-lg transition-colors"
          >
            Let's Play →
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
