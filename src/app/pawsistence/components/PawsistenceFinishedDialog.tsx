"use client";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "~/components/ui/dialog";
import { useSession, signIn } from "next-auth/react";
import { GoogleLogo } from "~/components/icons";
import { Share2, Trophy, Home } from "lucide-react";
import { useState } from "react";
import { ShareResultsDialog } from "~/app/components/ShareResultsDialog";
import { LeaderboardModal } from "~/app/components/LeaderboardModal";
import { useRouter } from "next/navigation";

interface PawsistenceFinishedDialogProps {
  isOpen: boolean;
  onClose?: () => void;
  currentStreak: number;
  isHighScore: boolean;
  playsRemaining: number;
  highestStreak: number;
}

export function PawsistenceFinishedDialog({
  isOpen,
  onClose,
  currentStreak,
  isHighScore,
  playsRemaining,
  highestStreak,
}: PawsistenceFinishedDialogProps) {
  const { data: session } = useSession();
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const isOutOfPlays = playsRemaining === 0 && currentStreak === 0;
  const router = useRouter();

  const handleViewLeaderboard = () => {
    router.push("/?showLeaderboard=true");
  };

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          if (playsRemaining > 0) {
            onClose?.();
          }
        }}
        modal={true}
      >
        <DialogContent className="fixed left-1/2 top-1/2 w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-zinc-800 bg-zinc-950/95 text-zinc-50 sm:w-full sm:max-w-[400px] [&>button]:hidden">
          <div className="flex w-full flex-col items-center justify-center">
            <DialogHeader className="flex w-full flex-col items-center justify-center">
              <DialogTitle className="text-center text-2xl font-bold text-zinc-50">
                {isOutOfPlays ? "No Plays Remaining" : "Game Over!"}
              </DialogTitle>
              <div className="mt-4 flex flex-col items-center justify-center space-y-2">
                <DialogDescription className="text-center text-base text-zinc-300">
                  You've used all your plays for today. Come back at 12 AM PST
                  for more attempts!
                </DialogDescription>
                <p className="text-center text-sm font-medium text-emerald-500">
                  Daily limit: 3 games
                </p>
              </div>
            </DialogHeader>

            <div className="mt-6 flex w-full flex-col gap-3">
              <Button
                onClick={() => setIsShareDialogOpen(true)}
                className="w-full bg-emerald-600 text-zinc-100 hover:bg-emerald-700"
              >
                <Share2 className="mr-2 h-4 w-4" />
                Share Results
              </Button>

              <Button
                onClick={handleViewLeaderboard}
                className="w-full bg-amber-600 text-zinc-100 hover:bg-amber-700"
              >
                <Trophy className="mr-2 h-4 w-4" />
                View Leaderboard
              </Button>

              <Button
                onClick={() => (window.location.href = "/")}
                className="w-full bg-zinc-800 text-zinc-100 hover:bg-zinc-700"
              >
                <Home className="mr-2 h-4 w-4" />
                Return Home
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ShareResultsDialog
        score={highestStreak ?? currentStreak}
        questionResults={[true]}
        isOpen={isShareDialogOpen}
        onOpenChange={setIsShareDialogOpen}
        mode="pawsistence"
      />

      <LeaderboardModal
        open={isLeaderboardOpen}
        onOpenChange={setIsLeaderboardOpen}
        defaultMode="pawsistence"
        source="pawsistence"
      />
    </>
  );
}
