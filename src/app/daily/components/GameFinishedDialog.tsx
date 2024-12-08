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
  const [scoreAttached, setScoreAttached] = useState(false);

  const handleViewLeaderboard = () => {
    router.push('/?showLeaderboard=true');
  };

  // Check if user is returning from auth and attach score
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tempId = urlParams.get('tempId');
    
    if (tempId && session?.user && !scoreAttached && !attachUserToTempScore.isPending) {
      // Attach score to user
      attachUserToTempScore.mutate({ tempId }, {
        onSuccess: () => {
          setScoreAttached(true);
          setScoreSaved(true); // Prevent additional save attempts
          // Clean up URL
          window.history.replaceState({}, '', window.location.pathname);
        },
        onError: (error) => {
          console.error("Failed to attach score to user:", error);
        },
      });
    }
  }, [session?.user, attachUserToTempScore, scoreAttached]);

  // Save score only for new games (no tempId) and not when returning from auth
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tempId = urlParams.get('tempId');
    
    if (isOpen && !tempId && !scoreSaved) {
      if (session?.user) {
        // Logged in user, save directly
        saveScore.mutate({
          score,
          timestamp: new Date().toISOString(),
        }, {
          onSuccess: () => {
            setScoreSaved(true);
          },
          onError: (error) => {
            console.error("Failed to save score:", error);
          },
        });
      }
      // No else block needed as anonymous users should have tempId
    }
  }, [isOpen, session?.user, scoreSaved, saveScore, score]);

  // Reset states when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setScoreSaved(false);
      setScoreAttached(false);
    }
  }, [isOpen]);

  const handleSignIn = async () => {
    if (scoreSaved) return;

    const tempId = crypto.randomUUID();
    const resultsString = questionResults.map(r => r ? '1' : '0').join(',');
    
    // Save score with tempId for anonymous user
    try {
      await saveScore.mutateAsync({
        score,
        timestamp: new Date().toISOString(),
        tempId,
      });
      setScoreSaved(true);

      // Include score and results in URL
      void signIn("google", {
        callbackUrl: `${window.location.pathname}?tempId=${tempId}&score=${score}&results=${resultsString}`,
      });
    } catch (error) {
      console.error("Failed to save score for anonymous user:", error);
    }
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
      <DialogContent className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] sm:w-full sm:max-w-[400px] bg-zinc-950/95 text-zinc-50 border border-zinc-800 rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {score > 0 ? "Congratulations! 🎉" : "Game Over"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 px-4 sm:px-6">
          <div className="text-center space-y-2">
            <p className="text-3xl font-bold text-emerald-500">
              {score} {score === 1 ? "Point" : "Points"} 🐾
            </p>
            <p className="text-zinc-300 text-sm sm:text-base">
              {getScoreMessage(score)}
            </p>
          </div>

          {session ? (
            <div className="space-y-4">
              <Button
                onClick={handleViewLeaderboard}
                className="w-full bg-zinc-900/50 hover:bg-zinc-800 text-zinc-100 border border-zinc-800 transition-all duration-200 py-6 text-lg font-medium rounded-xl"
              >
                View Leaderboard 🏆
              </Button>
              <ShareResultsDialog 
                score={score}
                questionResults={questionResults}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-zinc-300 text-center text-sm sm:text-base">
                Want to start tracking your stats and streaks?
              </p>
              <button
                onClick={handleSignIn}
                className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-900 rounded-xl px-6 py-4 transition-colors duration-200"
              >
                <GoogleLogo />
                Continue with Google
              </button>
              <Button
                onClick={handleViewLeaderboard}
                className="w-full bg-zinc-900/50 hover:bg-zinc-800 text-zinc-100 border border-zinc-800 transition-all duration-200 py-6 text-lg font-medium rounded-xl"
              >
                View Leaderboard 🏆
              </Button>
              <ShareResultsDialog 
                score={score}
                questionResults={questionResults}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
