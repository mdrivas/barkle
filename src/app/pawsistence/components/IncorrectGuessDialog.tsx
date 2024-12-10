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
      <DialogContent className="bg-zinc-950/95 text-zinc-50 border border-zinc-800 rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Incorrect Guess! 🐾
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center gap-4 mt-2">
          <p className="text-lg text-zinc-300">
            {playsRemaining} {playsRemaining === 1 ? 'try' : 'tries'} remaining
          </p>
          
          <Button
            onClick={onPlayAgain}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-6 text-lg font-semibold rounded-xl"
          >
            Play Again
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 