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
import seedrandom from "seedrandom";
import { getUserLocalDate } from "~/lib/dates";

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
  hasSavedScore: boolean;
  currentGuessStreak: number;
}

interface BreedsResponse {
  message: Record<string, string[]>;
  status: string;
}

interface ImageResponse {
  message: string;
  status: string;
}

interface DailyBreeds {
  breeds: DogBreed[];
  date: string;
}

function generateDailySeededRandom(seed: string) {
  return seedrandom(seed);
}

export default function DailyGame() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tempId = searchParams.get("tempId");
  const isReturningFromAuth = !!tempId;

  // Get or create tempId for non-signed in users
  const [localTempId, setLocalTempId] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.user) {
      const storedTempId = localStorage.getItem("barkle_temp_id");
      if (storedTempId) {
        setLocalTempId(storedTempId);
      } else {
        const newTempId = crypto.randomUUID();
        localStorage.setItem("barkle_temp_id", newTempId);
        setLocalTempId(newTempId);
      }
    }
  }, [session?.user]);

  // Single canPlayQuery
  const canPlayQuery = api.score.canPlayToday.useQuery(
    {
      tempId: !session?.user ? tempId ?? localTempId ?? undefined : undefined,
    },
    {
      enabled: !!localTempId || !!session?.user,
    }
  );

  const [showInstructions, setShowInstructions] = useState(false);
  const [showUsernameDialog, setShowUsernameDialog] = useState(false);
  const [showGameResults, setShowGameResults] = useState(false);

  // Add at the top with other state declarations
  const [hasShownToast, setHasShownToast] = useState(false);

  // Update the toast effect
  useEffect(() => {
    if (
      !isReturningFromAuth &&
      !hasShownToast &&
      canPlayQuery.data &&
      !canPlayQuery.data.canPlay
    ) {
      const tomorrow = new Date();
      tomorrow.setHours(24, 0, 0, 0);

      toast({
        title: "You've already played today!",
        description: `Next game available at ${tomorrow.toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })} your local time`,
        variant: "destructive",
        duration: 3000,
      });

      setHasShownToast(true);
    }
  }, [
    canPlayQuery.data,
    toast,
    isReturningFromAuth,
    hasShownToast,
  ]);

  const [gameState, setGameState] = useState<GameState>({
    currentBreed: null,
    options: [],
    isLoading: true,
    score: 0,
    guessesRemaining: 5,
    gameOver: false,
    hasSavedScore: false,
    currentGuessStreak: 0,
  });

  const [answeredBreed, setAnsweredBreed] = useState<string | null>(null);

  // New state to track the current round index
  const [currentRoundIndex, setCurrentRoundIndex] = useState<number>(0);

  const happyBarkRef = useRef<HTMLAudioElement | null>(null);
  const angryBarkRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    happyBarkRef.current = new Audio("/happy_bark.mp3");
    angryBarkRef.current = new Audio("/angry_bark.mp3");
  }, []);

  // Add this query to fetch daily breeds
  const dailyBreedsQuery = api.game.getDailyBreeds.useQuery(
    { timezone: new Date().getTimezoneOffset() },
    { enabled: canPlayQuery.data?.canPlay }
  );

  // Replace the fetchNewRound function with this version
  const fetchNewRound = useCallback(async () => {
    if (!dailyBreedsQuery.data) return;

    const parsedBreeds: DogBreed[] = JSON.parse(dailyBreedsQuery.data.breeds);
    if (currentRoundIndex >= parsedBreeds.length) return;

    const currentBreed = parsedBreeds[currentRoundIndex];
    if (!currentBreed) return;

    // Get all possible breeds from the API
    const breedsResponse = await fetch("https://dog.ceo/api/breeds/list/all");
    const breedsData: BreedsResponse = await breedsResponse.json();

    // Use round-specific seed for consistent randomization
    const roundSeed = `${getUserLocalDate()}-${currentRoundIndex}`;
    const roundRng = generateDailySeededRandom(roundSeed);

    // First, get all images for this breed
    const breedImagesResponse = await fetch(
      `https://dog.ceo/api/breed/${currentBreed.breed}/images`
    );
    const breedImagesData = await breedImagesResponse.json();
    const images = breedImagesData.message as string[];

    // Use seeded random to select consistent image
    const imageIndex = Math.floor(roundRng() * images.length);
    const selectedImage = images[imageIndex] ?? images[0] ?? "https://dog.ceo/api/breeds/image/random";

    // Rest of the function (wrong answers, options, etc.)
    const dailyBreedNames = parsedBreeds.map((b) => b.breed);
    const possibleWrongBreeds = Object.keys(breedsData.message).filter(
      (breed) => !dailyBreedNames.includes(breed)
    );

    const shuffledWrongBreeds = [...possibleWrongBreeds].sort(
      () => roundRng() - 0.5
    );

    const wrongOptions = shuffledWrongBreeds.slice(0, 3);
    const options = [currentBreed.breed, ...wrongOptions].sort(
      () => roundRng() - 0.5
    );

    setGameState((prev) => ({
      ...prev,
      currentBreed: {
        breed: currentBreed.breed,
        imageUrl: selectedImage,
      },
      options,
      isLoading: false,
    }));
  }, [dailyBreedsQuery.data, currentRoundIndex]);

  // Update the useEffect to fetch the current round when currentRoundIndex changes
  useEffect(() => {
    if (dailyBreedsQuery.data) {
      void fetchNewRound();
    }
  }, [fetchNewRound, dailyBreedsQuery.data, currentRoundIndex]);

  // Add state to track correct/incorrect answers
  const [questionResults, setQuestionResults] = useState<Array<boolean>>([]);

  // Add the mutation hook at component level
  const saveScoreMutation = api.score.saveScore.useMutation();

  const handleGuess = async (breed: string) => {
    if (gameState.isLoading || gameState.gameOver) return;

    const isCorrect = breed === gameState.currentBreed?.breed;
    const newScore = isCorrect ? gameState.score + 1 : gameState.score;
    const newGuessesRemaining = gameState.guessesRemaining - 1;
    const newGameOver = newGuessesRemaining === 0;

    // Update guess streak
    const newGuessStreak = isCorrect
      ? gameState.currentGuessStreak + 1
      : 0;

    // Update game state
    setGameState((prev) => ({
      ...prev,
      score: newScore,
      guessesRemaining: newGuessesRemaining,
      gameOver: newGameOver,
      currentGuessStreak: newGuessStreak,
    }));

    setAnsweredBreed(breed);
    setQuestionResults((prev) => [...prev, isCorrect]);

    // Play sound effects
    if (isCorrect) {
      happyBarkRef.current?.play().catch(console.error);
    } else {
      angryBarkRef.current?.play().catch(console.error);
    }

    // Show feedback toast
    toast({
      title: isCorrect ? "Correct!" : "Wrong!",
      description: isCorrect
        ? "Good job! That's the right breed!"
        : `Sorry, it was a ${gameState.currentBreed?.breed ?? "unknown breed"}. ${newGuessesRemaining} guesses remaining`,
      variant: isCorrect ? "default" : "destructive",
      duration: 2000,
    });

    // If game is over, save the score and show dialog
    if (newGameOver) {
      try {
        await saveScoreMutation.mutateAsync({
          score: newScore,
          results: [...questionResults, isCorrect]
            .map((r) => (r ? "1" : "0"))
            .join(","),
          tempId: !session?.user ? localTempId ?? undefined : undefined,
          currentGuessStreak: newGuessStreak,
          playDate: getUserLocalDate(),
        });
        setShowGameResults(true);
      } catch (error) {
        console.error("Failed to save score:", error);
        toast({
          title: "Error",
          description: "Failed to save score. Please try again later.",
          variant: "destructive",
        });
      }
    } else {
      // Fetch next round after delay
      setTimeout(() => {
        setAnsweredBreed(null);
        setGameState(prev => ({
          ...prev,
          isLoading: true
        }));
        setCurrentRoundIndex((prev) => prev + 1);
      }, 1500);
    }
  };

  const handleGameFinishedClose = () => {
    setGameState((prev) => ({
      ...prev,
      gameOver: false,
    }));
  };

  // Show username dialog when user returns from auth with tempId
  useEffect(() => {
    if (session?.user && tempId) {
      setShowUsernameDialog(true);
      // Get the score from URL if available
      const urlScore = searchParams.get("score");
      const urlResults = searchParams.get("results");

      if (urlScore && urlResults) {
        // Just update game state, don't show results yet
        setGameState(prev => ({
          ...prev,
          score: parseInt(urlScore),
          gameOver: true,
        }));
        setQuestionResults(urlResults.split(",").map(r => r === "1"));
      }
    }
  }, [session?.user, tempId, searchParams]);

  // Handle username submission
  const onUsernameSubmit = async () => {
    const urlScore = searchParams.get("score");
    const urlResults = searchParams.get("results");

    if (urlScore && urlResults && tempId) {
      await saveScoreMutation.mutateAsync({
        score: parseInt(urlScore),
        tempId,
        results: urlResults,
        currentGuessStreak: 0,
        playDate: getUserLocalDate(),
      });
      
      // Clean up URL and localStorage
      window.history.replaceState({}, '', window.location.pathname);
      localStorage.removeItem('barkle_temp_id');
    }

    setShowUsernameDialog(false);
    setShowGameResults(true);
  };

  // Update the instructions effect to check isReturningFromAuth
  useEffect(() => {
    if (canPlayQuery.data?.canPlay && !isReturningFromAuth && !showGameResults) {
      setShowInstructions(true);
    }
  }, [canPlayQuery.data?.canPlay, isReturningFromAuth, showGameResults]);

  // Single todayScoreQuery
  const todayScoreQuery = api.score.getTodayScore.useQuery(
    {
      tempId: !session?.user ? tempId ?? localTempId ?? undefined : undefined,
    },
    {
      enabled:
        !canPlayQuery.data?.canPlay && (!!localTempId || !!session?.user),
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
                          questionResults[i] === undefined,
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

          {gameState.isLoading && !gameState.currentBreed ? (
            <Card className="overflow-hidden mb-8 border-0 rounded-xl bg-zinc-900/50 backdrop-blur-sm shadow-xl shadow-emerald-900/10">
              <div className="w-full h-[400px] bg-zinc-800/50 animate-pulse" />
            </Card>
          ) : gameState.currentBreed ? (
            <Card className="overflow-hidden mb-8 border-0 rounded-xl bg-zinc-900/50 backdrop-blur-sm shadow-xl shadow-emerald-900/10">
              <Image
                src={gameState.currentBreed.imageUrl}
                alt="Mystery dog"
                width={800}
                height={400}
                className="w-full h-[400px] object-cover hover:scale-105 transition-transform duration-500"
              />
            </Card>
          ) : null}

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
                    "hover:border-emerald-500/50": !answeredBreed,
                    // Correct answer
                    "border-green-500 text-green-500":
                      answeredBreed && breed === gameState.currentBreed?.breed,
                    // Wrong answer selected
                    "border-red-500 text-red-500 !text-red-500":
                      answeredBreed === breed && breed !== gameState.currentBreed?.breed,
                    // Other options when answer is selected
                    "opacity-0":
                      answeredBreed && answeredBreed !== breed && breed !== gameState.currentBreed?.breed,
                  }
                )}
                variant="outline"
              >
                {breed.replace("-", " ")}
              </Button>
            ))}
          </div>
        </div>
      ) : (
        <>
          <GameFinishedDialog
            isOpen={true}
            score={todayScoreQuery.data?.score ?? 0}
            questionResults={
              todayScoreQuery.data?.results
                ? todayScoreQuery.data.results.split(",").map((r) => r === "1")
                : []
            }
            onClose={() => router.push("/")}
          />
          <div className="opacity-0">placeholder</div>
        </>
      )}

      <GameFinishedDialog
        isOpen={showGameResults || (!canPlayQuery.data?.canPlay && !!todayScoreQuery.data)}
        score={gameState.score}
        questionResults={questionResults}
        onClose={() => {
          setShowGameResults(false);
          router.push("/");
        }}
      />

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
