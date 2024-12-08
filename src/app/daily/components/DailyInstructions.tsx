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
            Barkle gives you 5 dogs to identify each day. Choose the correct breed from 4 options!
          </p>

          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-3 bg-zinc-900/50 p-2.5 sm:p-3 rounded-lg border border-zinc-800">
              <span className="text-lg sm:text-xl">🎯</span>
              <p className="text-xs sm:text-sm text-zinc-300">4 breed options per dog</p>
            </div>
            
            <div className="flex items-center gap-3 bg-zinc-900/50 p-2.5 sm:p-3 rounded-lg border border-zinc-800">
              <span className="text-lg sm:text-xl">✨</span>
              <p className="text-xs sm:text-sm text-zinc-300">Green for correct, red for wrong</p>
            </div>
            
            <div className="flex items-center gap-3 bg-zinc-900/50 p-2.5 sm:p-3 rounded-lg border border-zinc-800">
              <span className="text-lg sm:text-xl">🔄</span>
              <p className="text-xs sm:text-sm text-zinc-300">New pups every day!</p>
            </div>
          </div>

          <p className="text-center text-zinc-400 text-xs sm:text-sm pt-2 border-t border-zinc-800">
            How many can you get right? 🐕
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}