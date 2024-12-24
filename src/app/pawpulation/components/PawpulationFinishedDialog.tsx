"use client";

import { Button } from "~/components/ui/button";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Share2, Home, RotateCcw } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useState } from "react";
import { ShareResultsDialog } from "~/app/components/ShareResultsDialog";

interface PawpulationFinishedDialogProps {
  isOpen: boolean;
  score: number;
  onPlayAgain: () => void;
  onClose?: () => void;
}

export function PawpulationFinishedDialog({
  isOpen,
  score,
  onPlayAgain,
  onClose,
}: PawpulationFinishedDialogProps) {
  const router = useRouter();
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);

  const getScoreMessage = (score: number) => {
    if (score >= 15) return "Legendary Pawpulation Expert! 🌟";
    if (score >= 10) return "Amazing Dog Detective! 🔍";
    if (score >= 5) return "Great Dog Counter! 🐕";
    if (score >= 3) return "Getting the Hang of It! 🦮";
    return "Keep Practicing! Every Dog Has Its Day! 🐾";
  };

  const handleViewLeaderboard = () => {
    router.push("/?showLeaderboard=true");
  };

  const handlePlayDaily = () => {
    router.push("/daily");
  };

  const handlePlayPawsistence = () => {
    router.push("/pawsistence");
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose?.()}>
        <DialogContent className="fixed left-1/2 top-1/2 w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-zinc-800 bg-zinc-950/95 text-zinc-50 sm:w-full sm:max-w-[400px] [&>button]:hidden">
          <DialogHeader>
            <VisuallyHidden>
              <DialogTitle>Pawpulation Results</DialogTitle>
            </VisuallyHidden>
          </DialogHeader>
          <div className="mt-4 flex flex-col items-center gap-4">
            <div className="text-center">
              <h2 className="mb-4 text-3xl font-bold text-zinc-100">
                Game Over!
              </h2>
              <p className="mb-2 text-4xl font-bold">
                <span className="text-purple-400">Score: {score}</span>
              </p>
              <p className="text-sm text-gray-300 sm:text-base">
                {getScoreMessage(score)}
              </p>
            </div>

            <div className="flex w-full flex-col gap-4">
              <Button
                onClick={onPlayAgain}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-900 text-purple-100 transition-all duration-200 hover:bg-purple-800 py-2 text-base font-medium"
              >
                <RotateCcw className="h-5 w-5" />
                Play Again
              </Button>

              <Button
                onClick={handlePlayDaily}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-900 text-indigo-100 transition-all duration-200 hover:bg-indigo-800 py-2 text-base font-medium"
              >
                Play Today's Barkle
                <span className="text-xl">🎯</span>
              </Button>

              <Button
                onClick={handlePlayPawsistence}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-900 text-amber-100 transition-all duration-200 hover:bg-amber-800 py-2 text-base font-medium"
              >
                Play Pawsistence
                <span className="text-xl">🐾</span>
              </Button>

              <Button
                onClick={() => setIsShareDialogOpen(true)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-900 text-emerald-100 transition-all duration-200 hover:bg-emerald-800 py-2 text-base font-medium"
              >
                Share Results
                <Share2 className="h-5 w-5" />
              </Button>

              <Button
                onClick={handleViewLeaderboard}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-900 text-amber-100 transition-all duration-200 hover:bg-amber-800 py-2 text-base font-medium"
              >
                View Leaderboard
                <span className="text-xl">🏆</span>
              </Button>

              <Button
                onClick={() => router.push("/")}
                className="flex w-full items-center justify-center gap-2 rounded-xl border-zinc-800 bg-transparent text-zinc-200 hover:bg-zinc-800/50 py-2 text-base font-medium"
              >
                <Home className="h-5 w-5" /> Return Home
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ShareResultsDialog
        score={score}
        isOpen={isShareDialogOpen}
        onOpenChange={setIsShareDialogOpen}
        questionResults={[]}
        mode="pawpulation"
      />
    </>
  );
} 