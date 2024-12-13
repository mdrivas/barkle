"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";

interface IncorrectGuessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  playsRemaining: number;
  onPlayAgain: () => void;
}

export function IncorrectGuessDialog({
  isOpen,
  onClose,
  playsRemaining,
  onPlayAgain,
}: IncorrectGuessDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="rounded-xl border border-zinc-800 bg-zinc-950/95 text-zinc-50">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            Incorrect Guess! 🐾
          </DialogTitle>
        </DialogHeader>

        <div className="mt-2 flex flex-col items-center gap-4">
          <p className="text-lg text-zinc-300">
            {playsRemaining} {playsRemaining === 1 ? "try" : "tries"} remaining
          </p>

          <Button
            onClick={onPlayAgain}
            className="w-full rounded-xl bg-emerald-600 py-6 text-lg font-semibold text-white hover:bg-emerald-700"
          >
            Play Again
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
