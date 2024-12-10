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
import { Share2 } from "lucide-react";

// Props interface for GameFinishedDialog component
interface GameFinishedDialogProps {
  isOpen: boolean;
  score: number;
  questionResults: boolean[];
  onClose?: () => void;
  isReturningFromAuth?: boolean;
  tempId?: string;
}

export function GameFinishedDialog({ 
  isOpen, 
  score, 
  questionResults,
  onClose,
  isReturningFromAuth = false,
  tempId,
}: GameFinishedDialogProps) {
  // Hooks initialization
  const router = useRouter();
  const { data: session } = useSession();
  const saveScore = api.score.saveScore.useMutation();
  const { toast } = useToast();

  // Add state for share dialog
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);

  // Add state for tempId
  const [localTempId, setLocalTempId] = useState<string | undefined>();

  // Add state to track if we've handled the auth return
  const [hasHandledAuthReturn, setHasHandledAuthReturn] = useState(false);

  // Add state to track if username has been set
  const [shouldShowResults, setShouldShowResults] = useState(!isReturningFromAuth);

  // Add effect to update shouldShowResults when username is set
  useEffect(() => {
    if (!isReturningFromAuth) {
      setShouldShowResults(true);
    }
  }, [isReturningFromAuth]);

  // Add useEffect to get localStorage value
  useEffect(() => {
    setLocalTempId(localStorage.getItem('barkle_temp_id') ?? undefined);
  }, []);

  // Define handleViewLeaderboard at the top level of the component
  const handleViewLeaderboard = () => {
    router.push('/?showLeaderboard=true');
  };

  // Handler for Google sign in
  const handleSignIn = async () => {
    const existingTempId = localStorage.getItem('barkle_temp_id');
    const newTempId = crypto.randomUUID();
    const resultsString = questionResults.map(r => r ? '1' : '0').join(',');
    
    try {
      // Save score with new tempId if none exists
      const tempIdToUse = existingTempId || newTempId;
      if (!existingTempId) {
        localStorage.setItem('barkle_temp_id', newTempId);
        
        await saveScore.mutateAsync({
          score,
          results: resultsString,
          tempId: tempIdToUse,
          currentGuessStreak: 0
        });
      }
      
      void signIn("google", {
        callbackUrl: `${window.location.pathname}?tempId=${tempIdToUse}&score=${score}&results=${resultsString}`,
      });
    } catch (error) {
      console.error("Failed to save score for anonymous user:", error);
      toast({
        title: "Error",
        description: "Failed to save score. Please try again later.",
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

  // Update the query to use the state
  const todayScoreQuery = api.score.getTodayScore.useQuery(
    {
      tempId: !session?.user ? tempId ?? localTempId ?? undefined : undefined,
    },
    {
      enabled: !!localTempId || !!session?.user,
    }
  );

  // Use the actual score from props or query
  const displayScore = todayScoreQuery.data?.score ?? score;
  const displayResults = todayScoreQuery.data?.results 
    ? todayScoreQuery.data.results.split(',').map(r => r === '1')
    : questionResults;

  // Replace shareResults component with button
  const shareResults = (
    <Button 
      onClick={() => setIsShareDialogOpen(true)}
      className="w-full bg-emerald-600 hover:bg-emerald-700 text-zinc-100 transition-all duration-200 py-3 text-base font-medium rounded-xl flex items-center justify-center gap-2"
    >
      Share Results
      <Share2 className="h-4 w-4" />
    </Button>
  );

  const leaderboardButton = (
    <Button
      onClick={handleViewLeaderboard}
      className="w-full bg-amber-700 hover:bg-amber-800 text-zinc-50 border-none transition-all duration-200 
        flex items-center justify-center gap-2 py-3 text-base font-medium rounded-xl"
    >
      View Leaderboard 🏆
    </Button>
  );

  // Session-specific components
  const yesterdaysGameButton = (
    <Button
      onClick={handleViewLeaderboard}
      className="bg-zinc-800/50 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-50 border border-zinc-700 transition-all duration-200 flex items-center justify-center gap-2 py-4 text-sm font-medium"
    >
      Play Yesterday's Game 
    </Button>
  );

  const SignInPrompt = () => (
    <div className="space-y-2 text-center">
      <h3 className="text-2xl font-bold text-zinc-50">Track Your Progress</h3>
      <div className="flex items-center justify-center gap-4 my-1">
        <span className="text-xl">📈</span>
        <span className="text-xl">🏆</span>
        <span className="text-xl">🔥</span>
      </div>
      <ul className="text-base text-zinc-300 space-y-1">
        <li className="flex items-center justify-center gap-2">
          <span className="text-emerald-500">✓</span> Save your daily scores
        </li>
        <li className="flex items-center justify-center gap-2">
          <span className="text-emerald-500">✓</span> Build winning streaks
        </li>
        <li className="flex items-center justify-center gap-2">
          <span className="text-emerald-500">✓</span> Compete on the leaderboard
        </li>
      </ul>
    </div>
  );

  const GoogleSignInButton = () => (
    <button
      onClick={handleSignIn}
      className="flex items-center justify-center gap-3 bg-white hover:bg-gray-50 active:bg-gray-100 
        border border-gray-300 rounded-xl px-6 py-4 w-full transition-all duration-200 
        text-gray-900 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
    >
      <GoogleLogo className="w-6 h-6" />
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
      <div className="flex flex-col gap-4 w-full mt-2">
        <GoogleSignInButton />
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-zinc-700" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-zinc-950/95 px-2 text-zinc-500">or continue without signing in</span>
          </div>
        </div>
        <div className="flex flex-col gap-3 w-full">
          {shareResults}
          {leaderboardButton}
        </div>
      </div>
    </>
  );

  return (
    <>
      <Dialog open={isOpen && shouldShowResults} onOpenChange={(open) => !open && onClose?.()}>
        <DialogContent className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] sm:w-full sm:max-w-[400px] bg-zinc-950/95 text-zinc-50 border border-zinc-800 rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-zinc-50 text-center">
              {displayScore > 0 ? "Congratulations! 🎉" : "Game Over"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col gap-4 items-center mt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-500 mb-2">
                {displayScore} {displayScore === 1 ? "Point" : "Points"} 🐾
              </p>
              <p className="text-gray-300 text-sm sm:text-base">
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