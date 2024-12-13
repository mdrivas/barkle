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
import { useSession } from "next-auth/react";
import { GoogleLogo } from "~/components/icons";
import { api } from "~/trpc/react";
import { ShareResultsDialog } from "~/app/components/ShareResultsDialog";
import { useToast } from "~/hooks/use-toast";
import { Share2 } from "lucide-react";
import { useSignIn } from "~/hooks/useSignIn";
import { useProfileContext } from "~/app/components/ProfileProvider";

// Props interface for GameFinishedDialog component
interface GameFinishedDialogProps {
  isOpen: boolean;
  score: number;
  questionResults: boolean[];
  onClose?: () => void;
  isReturningFromAuth?: boolean;
}

export function GameFinishedDialog({
  isOpen,
  score,
  questionResults,
  onClose,
  isReturningFromAuth = false,
}: GameFinishedDialogProps) {
  // Hooks initialization
  const router = useRouter();
  const { data: session } = useSession();
  const saveScore = api.score.saveScore.useMutation();
  const { toast } = useToast();
  const { tempId } = useProfileContext();

  // Add state for share dialog
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);

  // Use the custom hook to get tempId
  const { handleGoogleSignIn } = useSignIn();

  // Add state to track if username has been set
  const [shouldShowResults, setShouldShowResults] =
    useState(!isReturningFromAuth);

  // Add effect to update shouldShowResults when username is set
  useEffect(() => {
    if (!isReturningFromAuth) {
      setShouldShowResults(true);
    }
  }, [isReturningFromAuth]);

  // Define handleViewLeaderboard at the top level of the component
  const handleViewLeaderboard = () => {
    router.push("/?showLeaderboard=true");
  };

  // Simplified sign in handler
  const handleSignIn = async () => {
    const resultsString = questionResults.map((r) => (r ? "1" : "0")).join(",");
    
    try {
      if (tempId) {
        // Don't save score again, just redirect to auth with the score params
        void handleGoogleSignIn(
          `${window.location.pathname}?score=${score}&results=${resultsString}`,
        );
      }
    } catch (error) {
      console.error("Failed during sign in:", error);
      toast({
        title: "Error",
        description: "Failed to sign in. Please try again later.",
        variant: "destructive",
      });
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

  // Simplified query
  const todayScoreQuery = api.score.getTodayScore.useQuery(
    {
      tempId,
    },
    {
      enabled: !!tempId || !!session?.user,
    },
  );

  // Use the actual score from props or query
  const displayScore = todayScoreQuery.data?.score ?? score;
  const displayResults = todayScoreQuery.data?.results
    ? todayScoreQuery.data.results.split(",").map((r) => r === "1")
    : questionResults;

  // Replace shareResults component with button
  const shareResults = (
    <Button
      onClick={() => setIsShareDialogOpen(true)}
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-6 text-lg font-medium text-zinc-100 transition-all duration-200 hover:bg-emerald-700"
    >
      Share Results
      <Share2 className="h-5 w-5" />
    </Button>
  );

  const leaderboardButton = (
    <Button
      onClick={handleViewLeaderboard}
      className={`flex items-center justify-center gap-2 border-none py-6 text-lg font-medium text-zinc-50 transition-all duration-200 ${
        session
          ? "bg-amber-500 shadow-lg shadow-amber-900/20 hover:bg-amber-300 focus:bg-amber-300"
          : "cursor-pointer bg-amber-600/50 hover:bg-amber-600/50 focus:bg-amber-600/50 focus:ring-0 active:bg-amber-600/50"
      }`}
    >
      View Leaderboard 🏆
    </Button>
  );

  // Session-specific components
  const SignInPrompt = () => (
    <div className="space-y-3 text-center">
      <p className="text-gray-300">
        Create an account to save your progress permanently and submit your own pup photos!
      </p>
    </div>
  );

  const GoogleSignInButton = () => (
    <button
      onClick={handleSignIn}
      className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-2 text-gray-900 transition-colors duration-200 hover:bg-gray-50"
    >
      <GoogleLogo />
      Continue with Google
    </button>
  );

  const authenticatedContent = (
    <div className="flex w-full flex-col gap-4">
      {shareResults}
      {leaderboardButton}
    </div>
  );

  const unauthenticatedContent = (
    <>
      <SignInPrompt />
      <div className="flex w-full flex-col gap-4">
        <GoogleSignInButton />
        <div className="my-2 h-px w-full bg-zinc-600/50" />
        {shareResults}
        {leaderboardButton}
      </div>
    </>
  );

  return (
    <>
      <Dialog
        open={isOpen && shouldShowResults}
        onOpenChange={(open) => !open && onClose?.()}
      >
        <DialogContent className="fixed left-1/2 top-1/2 w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-zinc-800 bg-zinc-950/95 text-zinc-50 sm:w-full sm:max-w-[400px] [&>button]:hidden">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold text-zinc-50">
              {displayScore > 0 ? "Congratulations! 🎉" : "Game Over"}
            </DialogTitle>
          </DialogHeader>

          <div className="mt-4 flex flex-col items-center gap-4">
            <div className="text-center">
              <p className="mb-2 text-2xl font-bold text-emerald-500">
                {displayScore} {displayScore === 1 ? "Point" : "Points"} 🐾
              </p>
              <p className="text-sm text-gray-300 sm:text-base">
                {getScoreMessage(displayScore)}
              </p>
            </div>

            {session ? authenticatedContent : unauthenticatedContent}
          </div>
        </DialogContent>
      </Dialog>

      <ShareResultsDialog
        score={displayScore}
        questionResults={displayResults}
        isOpen={isShareDialogOpen}
        onOpenChange={setIsShareDialogOpen}
      />
    </>
  );
}
