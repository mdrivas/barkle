import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { useSession, signIn } from "next-auth/react";
import { GoogleLogo } from "~/components/icons";
import { api } from "~/trpc/react";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";
import { cn } from "~/lib/utils";

interface GameFinishedDialogProps {
  isOpen: boolean;
  score: number;
  onClose?: () => void;
}

export function GameFinishedDialog({ 
  isOpen, 
  score, 
  onClose,
}: GameFinishedDialogProps) {
  const { data: session } = useSession();
  const saveScore = api.score.saveScore.useMutation();
  const attachUserToTempScore = api.score.attachScoreToUser.useMutation();
  const [scoreSaved, setScoreSaved] = useState(false);

  useEffect(() => {
    // Only check for tempId when user logs in
    if (session?.user) {
      const urlParams = new URLSearchParams(window.location.search);
      const tempId = urlParams.get('tempId');
      if (tempId) {
        attachUserToTempScore.mutate({ tempId });
        // Clean up URL after attaching score
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, [session?.user, attachUserToTempScore]);

  // Move score saving to a separate useEffect that runs only once when dialog opens
  useEffect(() => {
    if (isOpen && session?.user && !scoreSaved) {
      saveScore.mutate({
        score,
        timestamp: new Date().toISOString(),
      });
      setScoreSaved(true);
    }
  }, [isOpen, session?.user, scoreSaved, saveScore, score]); // Add scoreSaved as dependency

  // Reset scoreSaved when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setScoreSaved(false);
    }
  }, [isOpen]);

  const handleSignIn = async () => {
    // Generate a temporary ID
    const tempId = crypto.randomUUID();
    
    // Save the score with the temporary ID
    await saveScore.mutateAsync({
      score,
      timestamp: new Date().toISOString(),
      tempId,
    });

    // Redirect to sign in with the temp ID
    void signIn("google", {
      callbackUrl: `${window.location.pathname}?tempId=${tempId}`,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-zinc-50 text-center">
            {score > 0 ? "Congratulations! 🎉" : "Game Over! 🐾"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 items-center mt-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-500 mb-2">
              {score} Points! 🐾
            </p>
            <p className="text-gray-300">
              {score > 0 
                ? "You're off to an amazing start!" 
                : "Don't worry, every dog has its day!"}
            </p>
          </div>

          {session ? (
            <div className="flex flex-col gap-4 w-full">
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 text-lg"
              >
                Play Again Tomorrow
              </Button>
              <Button
                variant="outline"
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              >
                View Leaderboard
              </Button>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
              >
                Share 🔗
              </Button>
            </div>
          ) : ( // if no session, show sign in and share buttons
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
                  className="flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-lg px-6 py-2 hover:bg-gray-50 w-full"
                >
                  <GoogleLogo />
                  Continue with Google
                </button>
                <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
              >
                Share 🔗
              </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
