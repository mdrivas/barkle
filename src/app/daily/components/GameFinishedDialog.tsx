"use client";

import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { useSession, signIn } from "next-auth/react";
import { GoogleLogo } from "~/components/icons";
import { api } from "~/trpc/react";
import { ShareResultsDialog } from "~/app/components/ShareResultsDialog";

interface GameFinishedDialogProps {
  isOpen: boolean;
  score: number;
  questionResults: boolean[];
  onClose?: () => void;
}

export function GameFinishedDialog({ 
  isOpen, 
  score, 
  questionResults,
  onClose,
}: GameFinishedDialogProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const saveScore = api.score.saveScore.useMutation();
  const attachUserToTempScore = api.score.attachScoreToUser.useMutation();
  const [scoreSaved, setScoreSaved] = useState(false);

  const handleViewLeaderboard = () => {
    router.push('/?showLeaderboard=true');
  };

  // Check if user is returning from auth and attach score
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tempId = urlParams.get('tempId');
    
    if (tempId && session?.user) {
      // Attach score to user
      attachUserToTempScore.mutate({ tempId });
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
      return;
    }
  }, [session?.user, attachUserToTempScore]);

  // Save score only for new games (no tempId)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tempId = urlParams.get('tempId');
    
    if (isOpen && !tempId && !scoreSaved) {
      if (session?.user) {
        // Logged in user, save directly
        saveScore.mutate({
          score,
          timestamp: new Date().toISOString(),
        });
      }
      setScoreSaved(true);
    }
  }, [isOpen, session?.user, scoreSaved, saveScore, score]);

  const handleSignIn = async () => {
    const tempId = crypto.randomUUID();
    const resultsString = questionResults.map(r => r ? '1' : '0').join(',');
    
    // Save score with tempId for anonymous user
    await saveScore.mutateAsync({
      score,
      timestamp: new Date().toISOString(),
      tempId,
    });

    // Include score and results in URL
    void signIn("google", {
      callbackUrl: `${window.location.pathname}?tempId=${tempId}&score=${score}&results=${resultsString}`,
    });
  };

  const getScoreMessage = (score: number) => {
    if (score === 5) {
      return "Pawsome! You're the top dog! 🌟";
    } else if (score === 4) {
      return "Tail-wagging performance! Almost perfect! 🐕";
    } else if (score === 3) {
      return "Barking brilliant! You're getting the hang of it! 🦮";
    } else if (score === 2) {
      return "Ruff day? You're still learning new tricks! 🦴";
    } else if (score === 1) {
      return "Paw-sitive attitude! Every dog was once a puppy! 🐾";
    } else {
      return "Don't roll over yet - every dog has its day! 🐶";
    }
  };

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        if (!open && onClose) {
          onClose();
        }
      }}
    >
      <DialogContent className="bg-zinc-900 border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-zinc-50 text-center">
            {score > 0 ? "Congratulations! 🎉" : "Game Over"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 items-center mt-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-500 mb-2">
              {score} {score === 1 ? "Point" : "Points"} 🐾
            </p>
            <p className="text-gray-300 text-sm sm:text-base">
              {getScoreMessage(score)}
            </p>
          </div>

          {session ? (
            <div className="flex flex-col gap-4 w-full">
              <Button
                onClick={handleViewLeaderboard}
                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border-none transition-all duration-200 flex items-center justify-center gap-2 py-6 text-lg font-medium"
              >
                View Leaderboard 🏆
              </Button>
              <ShareResultsDialog 
                score={score}
                questionResults={questionResults}
              />
            </div>
          ) : (
            <>
              <div className="space-y-3 text-center">
                <p className="text-gray-300">
                  Want to start tracking 
                  your stats and 
                  streaks?
                </p>
              </div>

              <div className="flex flex-col gap-4 w-full">
                <button
                  onClick={handleSignIn}
                  className="flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-lg px-6 py-2 hover:bg-gray-50 w-full transition-colors duration-200"
                >
                  <GoogleLogo />
                  Continue with Google
                </button>
                <Button
                  onClick={handleViewLeaderboard}
                  className="bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border-none transition-all duration-200 flex items-center justify-center gap-2 py-6 text-lg font-medium"
                >
                  View Leaderboard 🏆
                </Button>
                <ShareResultsDialog 
                  score={score}
                  questionResults={questionResults}
                />
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
