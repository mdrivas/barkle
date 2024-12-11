"use client";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
  nextGameTime: Date | null;
}

export function PawsistenceFinishedDialog({
  isOpen,
  onClose,
  currentStreak,
  isHighScore,
  playsRemaining,
  highestStreak,
  nextGameTime,
}: PawsistenceFinishedDialogProps) {
  const { data: session } = useSession();
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const isOutOfPlays = playsRemaining === 0 && currentStreak === 0;
  const router = useRouter();

  const handleViewLeaderboard = () => {
    router.push('/?showLeaderboard=true');
  };

  const formatNextGameTime = () => {
    if (!nextGameTime) return '';
    return new Date(nextGameTime).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      timeZone: 'America/Los_Angeles',
    });
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
        <DialogContent className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] sm:w-full sm:max-w-[400px] bg-zinc-950/95 text-zinc-50 border border-zinc-800 rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-zinc-50 text-center">
              {isOutOfPlays ? "No Plays Remaining" : "Game Over!"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col gap-4 items-center mt-4">
            <div className="text-center">
              <p className="text-gray-300 text-sm sm:text-base">
                You've used all your plays for today. Come back at {formatNextGameTime()} PST for more attempts!
              </p>
              <p className="text-emerald-500 text-sm mt-2">
                Daily limit: 3 games
              </p>
            </div>

            <div className="flex flex-col gap-4 w-full">
              <Button
                onClick={() => setIsShareDialogOpen(true)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-zinc-100"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share Results
              </Button>
              
              <Button
                onClick={handleViewLeaderboard}
                className="w-full bg-amber-600 hover:bg-amber-700 text-zinc-100"
              >
                <Trophy className="w-4 h-4 mr-2" />
                View Leaderboard
              </Button>

              <Button
                onClick={() => window.location.href = '/'}
                className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-100"
              >
                <Home className="w-4 h-4 mr-2" />
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