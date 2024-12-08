"use client";

// Import necessary dependencies
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
import { useToast } from "~/hooks/use-toast";

// Props interface for GameFinishedDialog component
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
  // Hooks initialization
  const router = useRouter();
  const { data: session } = useSession();
  const saveScore = api.score.saveScore.useMutation();
  const attachUserToTempScore = api.score.attachScoreToUser.useMutation();
  const [scoreSaved, setScoreSaved] = useState(false);
  const [scoreAttached, setScoreAttached] = useState(false);
  const { toast } = useToast();

  // Handler for leaderboard navigation
  const handleViewLeaderboard = () => {
    if (session) {
      router.push('/?showLeaderboard=true');
    } else {
      toast({
        title: "Sign in required",
        description: "Please sign in to view the leaderboard and track your progress! 🐾",
        variant: "default",
      });
    }
  };

  // Effect to handle user returning from authentication
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

  // Effect to save score for new games and not when returning from auth
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

  // Handler for Google sign in
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

    // Include score and results in URL for after auth
    void signIn("google", {
      callbackUrl: `${window.location.pathname}?tempId=${tempId}&score=${score}&results=${resultsString}`,
    });
      // Include score and results in URL
      void signIn("google", {
        callbackUrl: `${window.location.pathname}?tempId=${tempId}&score=${score}&results=${resultsString}`,
      });
    } catch (error) {
      console.error("Failed to save score for anonymous user:", error);
    }
  };

  // Function to get appropriate message based on score
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

  // Shared components used in both states
  const shareResults = (
    <ShareResultsDialog 
      score={score}
      questionResults={questionResults}
    />
  );

  const leaderboardButton = (
    <Button
      onClick={handleViewLeaderboard}
      className={`text-zinc-50 border-none transition-all duration-200 flex items-center justify-center gap-2 py-6 text-lg font-medium ${
        session 
          ? "bg-amber-500 hover:bg-amber-300 focus:bg-amber-300 shadow-lg shadow-amber-900/20"
          : "bg-amber-600/50 hover:bg-amber-600/50 focus:bg-amber-600/50 focus:ring-0 active:bg-amber-600/50 cursor-pointer"
      }`}
    >
      View Leaderboard 🏆
    </Button>
  );

  // Session-specific components
  const yesterdaysGameButton = (
    <Button
      onClick={handleViewLeaderboard}
      className="bg-zinc-800/50 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-50 border border-zinc-700 transition-all duration-200 flex items-center justify-center gap-2 py-6 text-lg font-medium"
    >
      Play Yesterday's Game 
    </Button>
  );

  const SignInPrompt = () => (
    <div className="space-y-3 text-center">
      <p className="text-gray-300">
        Want to start tracking your stats and streaks?
      </p>
    </div>
  );

  const GoogleSignInButton = () => (
    <button
      onClick={handleSignIn}
      className="flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-lg px-6 py-2 hover:bg-gray-50 w-full transition-colors duration-200 text-gray-900"
    >
      <GoogleLogo />
      Continue with Google
    </button>
  );

  const authenticatedContent = (
    <div className="flex flex-col gap-4 w-full">
      {shareResults}
      {leaderboardButton}
      {yesterdaysGameButton}
    </div>
  );

  const unauthenticatedContent = (
    <>
      <SignInPrompt />
      <div className="flex flex-col gap-4 w-full">
        <GoogleSignInButton />
        <div className="h-px bg-zinc-600/50 w-full my-2" />
        {shareResults}
        {leaderboardButton}
      </div>
    </>
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose?.()}>
      <DialogContent className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] sm:w-full sm:max-w-[400px] bg-zinc-950/95 text-zinc-50 border border-zinc-800 rounded-xl">
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

          {session ? authenticatedContent : unauthenticatedContent}
        </div>
      </DialogContent>
    </Dialog>
  );
}