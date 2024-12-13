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
import { useTempId } from "~/hooks/useTempId";

interface DogBreed {
  breed: string;
  imageUrl: string;
  type: "api" | "community";
  submittedBy?: string;
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

function generateDailySeededRandom(seed: string) {
  return seedrandom(seed);
}

export default function DailyGame() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  const tempId = useTempId();

  // Single canPlayQuery
  const canPlayQuery = api.score.canPlayToday.useQuery(
    {
      tempId,
    },
    {
      enabled: !!tempId || !!session?.user,
    },
  );

  const [showInstructions, setShowInstructions] = useState(false);
  const [showUsernameDialog, setShowUsernameDialog] = useState(false);
  const [showGameResults, setShowGameResults] = useState(false);

  // Add at the top with other state declarations
  const [hasShownToast, setHasShownToast] = useState(false);

  // Update the toast effect
  useEffect(() => {
    if (
      !canPlayQuery.data?.canPlay &&
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
        })} PST`,
        variant: "destructive",
        duration: 3000,
      });

      setHasShownToast(true);
    }
  }, [canPlayQuery.data, toast, canPlayQuery.data?.canPlay, hasShownToast]);

  // Add the new query
  const currentStreakQuery = api.score.getCurrentStreak.useQuery(undefined, {
    enabled: !!session?.user,
  });

  // Update the initial game state
  const [gameState, setGameState] = useState<GameState>({
    currentBreed: null,
    options: [],
    isLoading: true,
    score: 0,
    guessesRemaining: 5,
    gameOver: false,
    hasSavedScore: false,
    currentGuessStreak: currentStreakQuery.data ?? 0, // Initialize with the user's current streak
  });

  // Add an effect to update the streak when the query loads
  useEffect(() => {
    if (currentStreakQuery.data !== undefined) {
      setGameState((prev) => ({
        ...prev,
        currentGuessStreak: currentStreakQuery.data,
      }));
    }
  }, [currentStreakQuery.data]);

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
    {
      timezone: new Date().getTimezoneOffset(),
    },
    { enabled: canPlayQuery.data?.canPlay },
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
    const roundSeed = `${currentRoundIndex}`;
    const roundRng = generateDailySeededRandom(roundSeed);

    // Use the stored image URL directly for community dogs
    let selectedImage = currentBreed.imageUrl;

    // Only fetch new image from API if it's not a community dog
    if (currentBreed.type === "api") {
      const breedImagesResponse = await fetch(
        `https://dog.ceo/api/breed/${currentBreed.breed}/images`,
      );
      const breedImagesData = await breedImagesResponse.json();
      const images = breedImagesData.message as string[];

      const imageIndex = Math.floor(roundRng() * images.length);
      selectedImage =
        images[imageIndex] ??
        images[0] ??
        "https://dog.ceo/api/breeds/image/random";
    }

    // Rest of the function remains the same...
    const dailyBreedNames = parsedBreeds.map((b) => b.breed);
    const possibleWrongBreeds = Object.keys(breedsData.message).filter(
      (breed) => !dailyBreedNames.includes(breed),
    );

    const shuffledWrongBreeds = [...possibleWrongBreeds].sort(
      () => roundRng() - 0.5,
    );

    const wrongOptions = shuffledWrongBreeds.slice(0, 3);
    const options = [currentBreed.breed, ...wrongOptions].sort(
      () => roundRng() - 0.5,
    );

    setGameState((prev) => ({
      ...prev,
      currentBreed: {
        breed: currentBreed.breed,
        imageUrl: selectedImage,
        type: currentBreed.type,
        submittedBy: currentBreed.submittedBy,
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
    if (gameState.isLoading || gameState.gameOver || answeredBreed !== null)
      return;

    const isCorrect = breed === gameState.currentBreed?.breed;
    const newScore = isCorrect ? gameState.score + 1 : gameState.score;
    const newGuessesRemaining = gameState.guessesRemaining - 1;
    const newGameOver = newGuessesRemaining === 0;

    // Update guess streak - increment if correct, reset if wrong
    const newGuessStreak = isCorrect ? gameState.currentGuessStreak + 1 : 0;

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
          tempId,
          currentGuessStreak: newGuessStreak,
        });

        // Invalidate the queries to force a refresh
        void todayScoreQuery.refetch();
        void canPlayQuery.refetch();

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
        setGameState((prev) => ({
          ...prev,
          isLoading: true,
        }));
        setCurrentRoundIndex((prev) => prev + 1);
      }, 1500);
    }
  };

  useEffect(() => {
    if (session?.user && tempId) {
      // Get the score from URL if available
      const urlScore = searchParams.get("score");
      const urlResults = searchParams.get("results");

      if (urlScore && urlResults) {
        // Just update game state, don't show results yet
        setGameState((prev) => ({
          ...prev,
          score: parseInt(urlScore),
          gameOver: true,
        }));
        setQuestionResults(urlResults.split(",").map((r) => r === "1"));
      }
    }
  }, [session?.user, tempId, searchParams]);

  // Add new profile query and mutation
  const profileQuery = api.profile.getProfile.useQuery(
    {
      tempId,
    },
    {
      enabled: !!tempId || !!session?.user,
    },
  );

  const createProfileMutation = api.profile.createTempProfile.useMutation();

  // Update the instructions effect to check migration status
  useEffect(() => {
    if (
      canPlayQuery.data?.canPlay &&
      !canPlayQuery.data.canPlay &&
      !showGameResults
    ) {
      if (!profileQuery.data && !session?.user) {
        setShowInstructions(true);
      } else {
        setShowInstructions(true);
      }
    }
  }, [
    canPlayQuery.data?.canPlay,
    showGameResults,
    profileQuery.data,
    session?.user,
  ]);

  // Update handleInstructionsClose to check migration status
  const handleInstructionsClose = () => {
    setShowInstructions(false);
    if (!profileQuery.data && !session?.user) {
      setTimeout(() => {
        setShowUsernameDialog(true);
      }, 100);
    }
  };

  // Update username submit handler
  const onUsernameSubmit = async (username: string) => {
    try {
      if (!session?.user && tempId) {
        await createProfileMutation.mutateAsync({
          username,
          tempId,
        });

        // Refetch profile data
        void profileQuery.refetch();
      }
      setShowUsernameDialog(false);
    } catch (error) {
      throw error; // Let the dialog component handle the error toast
    }
  };

  // Single todayScoreQuery
  const todayScoreQuery = api.score.getTodayScore.useQuery(
    {
      tempId,
    },
    {
      enabled:
        (!canPlayQuery.data?.canPlay && (!!tempId || !!session?.user)) ||
        gameState.gameOver,
    },
  );

  // Show loading until canPlayQuery is settled
  if (canPlayQuery.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="h-32 w-32 animate-spin rounded-full border-t-2 border-emerald-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-12 text-zinc-50">
      {canPlayQuery.data?.canPlay ? (
        <div className="container mx-auto max-w-3xl">
          <div className="mb-8 space-y-4 text-center">
            <Link href="/">
              <h1 className="cursor-pointer text-5xl font-bold tracking-tight text-[#F9F8E4] transition-colors hover:text-[#538D4E]">
                Barkle
              </h1>
            </Link>

            {/* Modern Score Display */}
            <div className="inline-flex items-center justify-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-4">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "relative flex h-10 w-8 items-center justify-center rounded-full transition-all duration-300",
                      {
                        "bg-gradient-to-b from-[#58A84D] to-[#4A9341] shadow-lg shadow-[#58A84D]/20":
                          questionResults[i] === true,
                        "bg-gradient-to-b from-red-500 to-red-600 shadow-lg shadow-red-500/20":
                          questionResults[i] === false,
                        "bg-zinc-800": questionResults[i] === undefined,
                      },
                    )}
                  >
                    <span className="text-[12px] text-white/90">
                      {questionResults[i] === true && "🐾"}
                      {questionResults[i] === false && "🐾"}
                      {questionResults[i] === undefined && "🐾"}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-l border-zinc-800 pl-6 text-2xl font-bold text-zinc-400">
                {gameState.score}/5
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {gameState.isLoading && !gameState.currentBreed ? (
              <Card className="mb-8 overflow-hidden rounded-xl border border-gray-500 bg-zinc-900/50 shadow-xl shadow-emerald-900/10 backdrop-blur-sm">
                <div className="h-[300px] w-full animate-pulse rounded-xl bg-zinc-800/50 md:h-[350px] lg:h-[400px]" />
              </Card>
            ) : gameState.currentBreed ? (
              <Card className="mb-8 overflow-hidden rounded-xl border border-gray-500 bg-zinc-900/50 shadow-xl shadow-emerald-900/10 backdrop-blur-sm">
                <div className="relative h-[300px] w-full md:h-[350px] lg:h-[400px]">
                  <Image
                    src={gameState.currentBreed.imageUrl}
                    alt="Mystery dog"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="rounded-xl bg-zinc-900/50 object-cover transition-transform duration-500 hover:scale-105"
                    priority
                    quality={90}
                  />
                  {/* Show community badge immediately if it's a community submission */}
                  {gameState.currentBreed.type === "community" && (
                    <div className="absolute right-4 top-4 rounded-full bg-emerald-500/80 px-3 py-1 text-sm text-white backdrop-blur-sm">
                      Community Pup
                    </div>
                  )}
                </div>
              </Card>
            ) : null}

            {/* Show submitter after answering if it's the community dog */}
            {answeredBreed &&
              currentRoundIndex === 4 &&
              gameState.currentBreed?.type === "community" &&
              gameState.currentBreed.submittedBy && (
                <p className="mt-2 text-center text-sm text-emerald-500">
                  Submitted by: @{gameState.currentBreed.submittedBy}
                </p>
              )}

            <div className="grid grid-cols-2 gap-4" key={currentRoundIndex}>
              {gameState.options.map((breed) => (
                <Button
                  key={breed}
                  onClick={() => handleGuess(breed)}
                  disabled={gameState.gameOver || answeredBreed !== null}
                  className={cn(
                    // Base styles
                    "text-md rounded-xl p-4 uppercase shadow-lg shadow-emerald-900/10 transition-all duration-200",
                    "border border-gray-500 bg-zinc-900/50 text-zinc-100 disabled:opacity-50",
                    "touch-none select-none",
                    // Hover state only on devices that support hover
                    {
                      "[@media(hover:hover)]:hover:border-emerald-500/50":
                        !answeredBreed,
                      // Correct answer
                      "!border-green-500 !bg-green-500/10 !text-green-500":
                        answeredBreed &&
                        breed === gameState.currentBreed?.breed,
                      // Wrong answer selected
                      "!border-red-500 !bg-red-500/10 !text-red-500":
                        answeredBreed === breed &&
                        breed !== gameState.currentBreed?.breed,
                      // Other options when answer is selected
                      "pointer-events-none opacity-0":
                        answeredBreed &&
                        answeredBreed !== breed &&
                        breed !== gameState.currentBreed?.breed,
                    },
                  )}
                  variant="outline"
                >
                  {breed.replace("-", " ")}
                </Button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          <GameFinishedDialog
            isOpen={true}
            score={todayScoreQuery.data?.score ?? gameState.score}
            questionResults={
              todayScoreQuery.data?.results
                ? todayScoreQuery.data.results.split(",").map((r) => r === "1")
                : questionResults
            }
            onClose={() => router.push("/")}
          />
          <div className="opacity-0">placeholder</div>
        </>
      )}

      <GameFinishedDialog
        isOpen={showGameResults}
        score={gameState.score}
        questionResults={questionResults}
        onClose={() => {
          setShowGameResults(false);
          router.push("/");
        }}
      />

      <DailyInstructions
        isOpen={showInstructions}
        onClose={handleInstructionsClose}
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
