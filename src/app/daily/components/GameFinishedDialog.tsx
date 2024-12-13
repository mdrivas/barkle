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
import { Share2, Home } from "lucide-react";
import { useSignIn } from "~/hooks/useSignIn";
import { useProfileContext } from "~/app/components/ProfileProvider";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

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

  // Replace shareResults component with button - Updated for authenticated users
  const shareResults = (
    <Button
      onClick={() => setIsShareDialogOpen(true)}
      className={`flex w-full items-center justify-center gap-2 rounded-xl ${
        session 
          ? "bg-emerald-900 text-emerald-100" 
          : "bg-emerald-900/80 text-emerald-100/90"
      } py-2 text-base font-medium transition-all duration-200 hover:bg-emerald-800`}
    >
      Share Results
      <Share2 className="h-5 w-5" />
    </Button>
  );

  const leaderboardButton = (
    <Button
      onClick={handleViewLeaderboard}
      className={`flex w-full items-center justify-center gap-2 rounded-xl ${
        session 
          ? "bg-amber-900 text-amber-100" 
          : "bg-amber-900/80 text-amber-100/90"
      } py-2 text-base font-medium transition-all duration-200 hover:bg-amber-800`}
    >
      View Leaderboard 🏆
    </Button>
  );

  const returnHomeButton = (
    <Button
      variant="outline"
      onClick={() => router.push("/")}
      className={`flex w-full items-center justify-center gap-2 rounded-xl border-zinc-800 ${
        session 
          ? "bg-transparent text-zinc-200" 
          : "bg-transparent text-zinc-400"
      } py-2 text-base font-medium hover:bg-zinc-800/50`}
    >
      <Home className="h-5 w-5" /> Return Home
    </Button>
  );

  // Session-specific components
  const SignInPrompt = () => (
    <div className="mt-4 space-y-4 text-center">
      <h3 className="text-2xl font-bold text-zinc-100">Save your score!</h3>
      <div className="mb-4 flex justify-center gap-4 text-[10px] text-zinc-300">
        <div className="flex items-center gap-1">
          <div className="flex h-3 w-3 items-center justify-center rounded-full bg-emerald-500/20">
            <span className="text-emerald-500">✓</span>
          </div>
          <span>Create account</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="flex h-3 w-3 items-center justify-center rounded-full bg-emerald-500/20">
            <span className="text-emerald-500">✓</span>
          </div>
          <span>Track streaks</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="flex h-3 w-3 items-center justify-center rounded-full bg-emerald-500/20">
            <span className="text-emerald-500">✓</span>
          </div>
          <span>Submit photos</span>
        </div>
      </div>
    </div>
  );

  const GoogleSignInButton = () => (
    <button
      onClick={handleSignIn}
      className="flex w-full items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 text-base font-medium text-gray-900 shadow-lg transition-colors duration-200 hover:bg-gray-50"
    >
      <GoogleLogo />
      Continue with Google
    </button>
  );

  const authenticatedContent = (
    <div className="flex w-full flex-col gap-4">
      <div className="relative my-3">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-zinc-700" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-zinc-950 px-2 text-zinc-500">Continue with</span>
        </div>
      </div>
      {shareResults}
      {leaderboardButton}
      {returnHomeButton}
    </div>
  );

  const unauthenticatedContent = (
    <>
      <SignInPrompt />
      <div className="flex w-full flex-col gap-4">
        <GoogleSignInButton />
        <div className="relative my-3">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-zinc-700" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-zinc-950 px-2 text-zinc-500">or</span>
          </div>
        </div>
        {shareResults}
        {leaderboardButton}
        {returnHomeButton}
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
            <VisuallyHidden asChild>
              <DialogTitle>Game Results</DialogTitle>
            </VisuallyHidden>
          </DialogHeader>
          <div className="mt-4 flex flex-col items-center gap-4">
            <div className="text-center">
              <h2 className="mb-4 text-2xl font-bold text-zinc-100 sm:text-2xl">
                {session ? "Daily Challenge Complete!" : "Today's Score"}
              </h2>
              <p className="mb-2 text-4xl font-bold">
                <span className="text-emerald-500">{displayScore}/5</span>
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
