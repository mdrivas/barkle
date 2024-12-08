"use client";

import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { useToast } from "~/hooks/use-toast";
import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { GameFinishedDialog } from "./components/GameFinishedDialog";
import { useSession } from "next-auth/react";
import { api } from "~/trpc/react";
import { cn } from "~/lib/utils";
import Link from "next/link";
import { DailyInstructions } from "./components/DailyInstructions";
import { UsernameDialog } from "./components/UsernameDialog";
import { useRouter, useSearchParams } from "next/navigation";

interface DogBreed {
  breed: string;
  imageUrl: string;
}

interface GameState {
  currentBreed: DogBreed | null;
  options: string[];
  isLoading: boolean;
  score: number;
  guessesRemaining: number;
  gameOver: boolean;
}

interface BreedsResponse {
  message: Record<string, string[]>;
  status: string;
}

interface ImageResponse {
  message: string;
  status: string;
}

export default function DailyGame() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tempId = searchParams.get('tempId');
  const isReturningFromAuth = !!tempId;

  // Get or create tempId for non-signed in users
  const [localTempId, setLocalTempId] = useState<string | null>(null);
  
  useEffect(() => {
    if (!session?.user) {
      const storedTempId = localStorage.getItem('barkle_temp_id');
      if (storedTempId) {
        setLocalTempId(storedTempId);
      } else {
        const newTempId = crypto.randomUUID();
        localStorage.setItem('barkle_temp_id', newTempId);
        setLocalTempId(newTempId);
      }
    }
  }, [session?.user]);

  // Single canPlayQuery
  const canPlayQuery = api.score.canPlayToday.useQuery({ 
    tempId: !session?.user ? (tempId ?? localTempId ?? undefined) : undefined,
    timezone: new Date().getTimezoneOffset()
  }, {
    enabled: !!localTempId || !!session?.user // Enable when we have either localTempId or session
  });

  const [showInstructions, setShowInstructions] = useState(false);
  const [showUsernameDialog, setShowUsernameDialog] = useState(false);
  const [showGameResults, setShowGameResults] = useState(false);

  // Add at the top with other state declarations
  const [hasShownToast, setHasShownToast] = useState(false);

  // Update the toast effect
  useEffect(() => {
    if (!isReturningFromAuth && !hasShownToast && canPlayQuery.data && !canPlayQuery.data.canPlay) {
      const tomorrow = new Date();
      tomorrow.setHours(24, 0, 0, 0);

      toast({
        title: "You've already played today!",
        description: `Next game available at ${tomorrow.toLocaleTimeString([], {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        })} your local time`,
        variant: "destructive",
        duration: 3000,
      });
      
      setHasShownToast(true);
    }
  }, [canPlayQuery.data, toast, isReturningFromAuth, hasShownToast]);

  const [gameState, setGameState] = useState<GameState>({
    currentBreed: null,
    options: [],
    isLoading: true,
    score: 0,
    guessesRemaining: 5,
    gameOver: false
  });

  const [answeredBreed, setAnsweredBreed] = useState<string | null>(null);


  const happyBarkRef = useRef<HTMLAudioElement | null>(null);
  const angryBarkRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    happyBarkRef.current = new Audio('/happy_bark.mp3');
    angryBarkRef.current = new Audio('/angry_bark.mp3');
  }, []);

  const fetchNewRound = useCallback(async () => {
    try {
      setGameState(prev => ({ ...prev, isLoading: true }));

      // Fetch list of all breeds
      const breedsResponse = await fetch('https://dog.ceo/api/breeds/list/all');
      const breedsData = (await breedsResponse.json()) as BreedsResponse;
      const allBreeds = Object.keys(breedsData.message);

      // Select random breed for correct answer
      const correctBreed = allBreeds[Math.floor(Math.random() * allBreeds.length)];

      // Fetch random image for correct breed
      const imageResponse = await fetch(`https://dog.ceo/api/breed/${correctBreed}/images/random`);
      const imageData = (await imageResponse.json()) as ImageResponse;

      // Generate 3 wrong options
      const wrongOptions = new Set<string>();
      while (wrongOptions.size < 3) {
        const wrongBreed = allBreeds[Math.floor(Math.random() * allBreeds.length)];
        if (wrongBreed && wrongBreed !== correctBreed) {
          wrongOptions.add(wrongBreed);
        }
      }

      // Combine and shuffle options
      const options = [...wrongOptions, correctBreed]
        .filter((breed): breed is string => breed !== undefined)
        .sort(() => Math.random() - 0.5);

      if (!correctBreed) throw new Error("No breed selected");

      setGameState(prev => ({
        ...prev,
        currentBreed: {
          breed: correctBreed,
          imageUrl: imageData.message
        },
        options,
        isLoading: false
      }));

    } catch (error) {
      console.error('Error fetching game data:', error);
      toast({
        title: "Error",
        description: "Failed to load dog breeds. Please try again.",
        variant: "destructive"
      });
    }
  }, [toast]);

  useEffect(() => {
    void fetchNewRound();
  }, [fetchNewRound]);

  // Add state to track correct/incorrect answers
  const [questionResults, setQuestionResults] = useState<Array<boolean>>([]);

  // Add the mutation hook at component level
  const saveScoreMutation = api.score.saveScore.useMutation();

  const handleGuess = (selectedBreed: string) => {
    if (!gameState.currentBreed || gameState.gameOver) return;

    const isCorrect = selectedBreed === gameState.currentBreed.breed;
    setAnsweredBreed(selectedBreed);
    
    // Add result to questionResults
    setQuestionResults(prev => [...prev, isCorrect]);

    const newGuessesRemaining = gameState.guessesRemaining - 1;
    const isGameOver = newGuessesRemaining === 0;
    
    if (isCorrect) {
      happyBarkRef.current?.play().catch(console.error);
    } else {
      angryBarkRef.current?.play().catch(console.error);
    }

    const newScore = isCorrect ? gameState.score + 1 : gameState.score;

    setGameState(prev => ({
      ...prev,
      score: newScore,
      guessesRemaining: newGuessesRemaining,
      gameOver: isGameOver
    }));

    toast({
      title: isCorrect ? "Correct!" : "Wrong!",
      description: isCorrect 
        ? "Good job! That's the right breed!"
        : `Sorry, it was a ${gameState.currentBreed.breed}. ${newGuessesRemaining} guesses remaining`,
      variant: isCorrect ? "default" : "destructive",
      duration: 2000
    });

    // Save score when game is over
    if (isGameOver) {
      const resultsWithCurrentGuess = [...questionResults, isCorrect];
      
      saveScoreMutation.mutate({
        score: newScore,
        results: resultsWithCurrentGuess,
        tempId: !session?.user ? localTempId ?? undefined : undefined,
        timezone: new Date().getTimezoneOffset()
      });
    }

    // Fetch next round after delay if not game over
    if (!isGameOver) {
      setTimeout(() => {
        setAnsweredBreed(null);
        void fetchNewRound();
      }, 1500);
    }
  };

  const handleGameFinishedClose = () => {
    setGameState(prev => ({
      ...prev,
      gameOver: false
    }));
  };

  // Show username dialog when user returns from auth with tempId
  useEffect(() => {
    if (session?.user && tempId) {
      setShowUsernameDialog(true);
      // Get the score from URL if available
      const urlScore = searchParams.get('score');
      const urlResults = searchParams.get('results');
      
      if (urlScore && urlResults) {
        setGameState(prev => ({
          ...prev,
          score: parseInt(urlScore),
          gameOver: true
        }));
        setQuestionResults(urlResults.split(',').map(r => r === '1'));
      }
    }
  }, [session, tempId, searchParams]);

  // Handle username submission
  const onUsernameSubmit = async () => {
    setShowUsernameDialog(false);
  };

  // Show instructions only after we confirm they can play
  useEffect(() => {
    if (canPlayQuery.data?.canPlay && !isReturningFromAuth) {
      setShowInstructions(true);
    }
  }, [canPlayQuery.data?.canPlay, isReturningFromAuth]);

  // Single todayScoreQuery
  const todayScoreQuery = api.score.getTodayScore.useQuery(
    { 
      tempId: !session?.user ? (tempId ?? localTempId ?? undefined) : undefined,
      timezone: new Date().getTimezoneOffset()
    },
    {
      enabled: !canPlayQuery.data?.canPlay && (!!localTempId || !!session?.user)
    }
  );

  // Show loading until canPlayQuery is settled
  if (canPlayQuery.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-emerald-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 py-12 px-4">
      {/* Show game UI when returning from auth OR when canPlay is true */}
      {(isReturningFromAuth || canPlayQuery.data?.canPlay) ? (
        <div className="container max-w-4xl mx-auto">
          <div className="text-center mb-8 space-y-4">
            <Link href="/">
              <h1 className="text-5xl font-bold tracking-tight text-[#F9F8E4] hover:text-[#538D4E] transition-colors cursor-pointer">
                Barkle
              </h1>
            </Link>
            
            {/* Modern Score Display */}
            <div className="inline-flex items-center justify-center gap-2 bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-3 border border-zinc-800">
              <div className="flex items-center gap-3">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "w-6 h-8 rounded-full transition-all duration-300 relative flex items-center justify-center",
                      {
                        "bg-gradient-to-b from-[#58A84D] to-[#4A9341] shadow-lg shadow-[#58A84D]/20": 
                          questionResults[i] === true,
                        "bg-gradient-to-b from-red-500 to-red-600 shadow-lg shadow-red-500/20":
                          questionResults[i] === false,
                        "bg-zinc-800":
                          questionResults[i] === undefined
                      }
                    )}
                  >
                    <span className="text-[10px] text-white/90">
                      {questionResults[i] === true && "🐾"}
                      {questionResults[i] === false && "🐾"}
                      {questionResults[i] === undefined && "🐾"}
                    </span>
                  </div>
                ))}
              </div>
              <div className="text-xl font-bold text-zinc-400 pl-4 border-l border-zinc-800">
                {gameState.score}/5
              </div>
            </div>
          </div>

          {gameState.currentBreed && (
            <Card className="overflow-hidden mb-8 border-0 rounded-xl bg-zinc-900/50 backdrop-blur-sm shadow-xl shadow-emerald-900/10">
              <Image
                src={gameState.currentBreed.imageUrl}
                alt="Mystery dog"
                width={800}
                height={400}
                className="w-full h-[400px] object-cover hover:scale-105 transition-transform duration-500"
              />
            </Card>
          )}

          <div className="grid grid-cols-2 gap-4">
            {gameState.options.map((breed) => (
              <Button
                key={breed}
                onClick={() => handleGuess(breed)}
                disabled={gameState.gameOver || answeredBreed !== null}
                className={cn(
                  // Base styles that apply to all states
                  "p-6 text-lg uppercase transition-all duration-200 rounded-xl shadow-lg shadow-emerald-900/10 disabled:opacity-50 bg-zinc-900/50 text-zinc-100 border border-zinc-800",
                  {
                    // Default state - only add hover effect
                    "hover:border-emerald-500/50": 
                      !answeredBreed,
                    // Correct answer
                    "border-green-500 text-green-500": 
                      answeredBreed && breed === gameState.currentBreed?.breed,
                    // Wrong answer selected
                    "border-red-500 text-red-500 !text-red-500": // Added !text-red-500 to force text color
                      answeredBreed === breed && breed !== gameState.currentBreed?.breed,
                    // Other options when answer is selected
                    "opacity-0": 
                      answeredBreed && answeredBreed !== breed && breed !== gameState.currentBreed?.breed,
                  }
                )}
                variant="outline"
              >
                {breed.replace('-', ' ')}
              </Button>
            ))}
          </div>
        </div>
      ) : (
        <>
          <GameFinishedDialog 
            isOpen={gameState.gameOver || (!!tempId && !!session?.user) || (!canPlayQuery.data?.canPlay)}
            score={!canPlayQuery.data?.canPlay ? (todayScoreQuery.data?.score ?? 0) : gameState.score}
            questionResults={!canPlayQuery.data?.canPlay 
              ? (typeof todayScoreQuery.data?.results === 'string' 
                  ? todayScoreQuery.data.results.split(',').map(r => r === '1') 
                  : [])
              : questionResults}
            onClose={!canPlayQuery.data?.canPlay ? () => router.push('/') : handleGameFinishedClose}
          />
          <div className="opacity-0">placeholder</div>
        </>
      )}

      <DailyInstructions
        isOpen={showInstructions}
        onClose={() => setShowInstructions(false)}
      />

      {showUsernameDialog && (
        <UsernameDialog 
          isOpen={showUsernameDialog}
          onClose={() => setShowUsernameDialog(false)}
          onSubmit={onUsernameSubmit}
        />
      )}
    </div>
  );
}
