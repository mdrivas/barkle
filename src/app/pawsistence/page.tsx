"use client";

import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { useToast } from "~/hooks/use-toast";
import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { cn } from "~/lib/utils";
import Link from "next/link";
import { ArrowLeft, Timer, AlertCircle } from "lucide-react";
import { api } from "~/trpc/react";
import { PawsistenceFinishedDialog } from "./components/PawsistenceFinishedDialog";
import { IncorrectGuessDialog } from "./components/IncorrectGuessDialog";
import { UsernameDialog } from "~/app/daily/components/UsernameDialog";
import { useProfileContext } from "~/app/components/ProfileProvider";
import { useSignIn } from "~/hooks/useSignIn";
interface DogBreed {
  breed: string;
  imageUrl: string;
}

interface GameState {
  currentBreed: DogBreed | null;
  options: string[];
  isLoading: boolean;
  currentStreak: number;
  gameOver: boolean;
  playsRemaining: number;
  highestStreak: number;
  timeRemaining: number;
}

interface BreedsResponse {
  message: Record<string, string[]>;
  status: string;
}

const TOTAL_TIME = 30;
const WARNING_TIME = 5;

export default function PawsistenceGame() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const { tempId } = useProfileContext();
  const [answeredBreed, setAnsweredBreed] = useState<string | null>(null);
  const { handleGoogleSignIn } = useSignIn();

  const { data: gameData, refetch: refetchGameData } =
    api.pawsistence.getInitialState.useQuery(
      {
        tempId,
      },
      {
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        enabled: !!tempId || !!session?.user,
      },
    );

  const { mutate: saveGameResult } = api.pawsistence.saveGame.useMutation({
    onSuccess: () => {
      void refetchGameData();
    },
  });

  const { mutate: incrementPlays } = api.pawsistence.incrementPlays.useMutation(
    {
      onSuccess: (data) => {
        setGameState((prev) => ({
          ...prev,
          playsRemaining: data.playsRemaining ?? 0,
          gameOver: (data.playsRemaining ?? 0) <= 0,
        }));

        if ((data.playsRemaining ?? 0) <= 0) {
          setShowNoPlaysDialog(true);
        } else {
          setShowIncorrectDialog(true);
        }
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      },
    },
  );

  const [gameState, setGameState] = useState<GameState>({
    currentBreed: null,
    options: [],
    isLoading: true,
    currentStreak: 0,
    gameOver: false,
    playsRemaining: gameData?.playsRemaining ?? 3,
    highestStreak: gameData?.highestStreak ?? 0,
    timeRemaining: TOTAL_TIME,
  });

  const happyBarkRef = useRef<HTMLAudioElement | null>(null);
  const angryBarkRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    happyBarkRef.current = new Audio("/happy_bark.mp3");
    angryBarkRef.current = new Audio("/angry_bark.mp3");
  }, []);

  const fetchNewRound = useCallback(async () => {
    setGameState((prev) => ({ ...prev, isLoading: true }));

    try {
      // Get all possible breeds
      const breedsResponse = await fetch("https://dog.ceo/api/breeds/list/all");
      const breedsData: BreedsResponse = await breedsResponse.json();
      const allBreeds = Object.keys(breedsData.message);

      // Get random breed
      const correctBreed =
        allBreeds[Math.floor(Math.random() * allBreeds.length)]!;

      // Get random image for the breed
      const breedImagesResponse = await fetch(
        `https://dog.ceo/api/breed/${correctBreed}/images`,
      );
      const breedImagesData = await breedImagesResponse.json();
      const images = breedImagesData.message as string[];
      const selectedImage = images[Math.floor(Math.random() * images.length)]!;

      // Get wrong options
      const wrongOptions = allBreeds
        .filter((breed) => breed !== correctBreed)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

      // Combine and shuffle options
      const options = [correctBreed, ...wrongOptions].sort(
        () => Math.random() - 0.5,
      );

      setGameState((prev) => ({
        ...prev,
        currentBreed: {
          breed: correctBreed,
          imageUrl: selectedImage,
        },
        options: options,
        isLoading: false,
      }));
    } catch (error) {
      console.error("Error fetching new round:", error);
      toast({
        title: "Error",
        description: "Failed to fetch new round. Please try again.",
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    void fetchNewRound();
  }, [fetchNewRound]);

  // Add a ref to track if we've already saved this game
  const hasGameBeenSaved = useRef(false);

  const handleGameOver = useCallback(() => {
    // Prevent multiple saves of the same game
    if (hasGameBeenSaved.current) return;
    hasGameBeenSaved.current = true;

    if (gameState.currentStreak > (gameData?.highestStreak ?? 0)) {
      saveGameResult({
        streak: gameState.currentStreak,
        isNewHighScore: true,
        tempId,
      });
    } else {
      saveGameResult({
        streak: gameState.currentStreak,
        isNewHighScore: false,
        tempId,
      });
    }
  }, [
    gameState.currentStreak,
    gameData?.highestStreak,
    saveGameResult,
    tempId,
  ]);

  const [showIncorrectDialog, setShowIncorrectDialog] = useState(false);

  const handleSignIn = async () => {
    if (tempId) {
      await handleGoogleSignIn();
    }
  };

  const handleGuess = async (breed: string) => {
    // Check for no plays remaining first
    if (gameState.playsRemaining <= 0) {
      setShowNoPlaysDialog(true);
      return;
    }

    if (gameState.isLoading || gameState.gameOver) return;

    const isCorrect = breed === gameState.currentBreed?.breed;
    setAnsweredBreed(breed);

    if (isCorrect) {
      void happyBarkRef.current?.play();
      const newStreak = gameState.currentStreak + 1;
      const isNewHighScore = newStreak > (gameData?.highestStreak ?? 0);

      // Save game for both logged-in and temporary users
      saveGameResult({
        streak: newStreak,
        isNewHighScore,
        tempId,
      });

      setTimeout(() => {
        setAnsweredBreed(null);
        setGameState((prev) => ({
          ...prev,
          currentStreak: newStreak,
        }));
        void fetchNewRound();
      }, 1500);
    } else {
      void angryBarkRef.current?.play();

      // Increment plays for both logged-in and temporary users
      incrementPlays({
        tempId,
      });

      if (!session?.user) {
        // Show sign-in toast for temporary users
        toast({
          title: "Want to secure your progress?",
          description:
            "Sign in to protect your stats, submit dog photos, and unlock more features!",
          action: (
            <Button
              onClick={handleSignIn}
              variant="outline"
              className="bg-white text-black hover:bg-gray-100"
            >
              Sign In
            </Button>
          ),
        });
      }
    }
  };

  const handlePlayAgain = () => {
    hasGameBeenSaved.current = false;
    setShowIncorrectDialog(false);
    setAnsweredBreed(null);
    setShowTimeWarning(false);

    // Reset game state and fetch new round
    setGameState((prev) => ({
      ...prev,
      currentBreed: null,
      options: [],
      isLoading: true,
      currentStreak: 0,
      gameOver: false,
      timeRemaining: TOTAL_TIME,
    }));

    void fetchNewRound();
  };

  // Add this state to handle no plays remaining
  const [showNoPlaysDialog, setShowNoPlaysDialog] = useState(false);

  // Update the initial effect to properly handle game state
  useEffect(() => {
    if (!gameData) return;

    setGameState((prev) => ({
      ...prev,
      playsRemaining: gameData.playsRemaining ?? 0,
      highestStreak: gameData.highestStreak ?? 0,
      gameOver: !gameData.canPlay,
    }));

    if (!gameData.canPlay) {
      setShowNoPlaysDialog(true);
    }
  }, [gameData]);

  // Update gameState when session/gameData changes
  useEffect(() => {
    if (session?.user) {
      setGameState((prev) => ({
        ...prev,
        playsRemaining: gameData?.playsRemaining ?? 3,
        highestStreak: gameData?.highestStreak ?? 0,
      }));
    }
  }, [session, gameData]);

  // Add effect to check guest plays on mount
  useEffect(() => {
    if (!session?.user) {
      setGameState((prev) => ({
        ...prev,
        playsRemaining: gameData?.playsRemaining ?? 3,
        gameOver: !(gameData?.canPlay ?? true),
      }));

      if (!(gameData?.canPlay ?? true)) {
        setShowNoPlaysDialog(true);
      }
    }
  }, [session?.user, gameData]);

  // Add profileQuery near other queries
  const profileQuery = api.profile.getProfile.useQuery(
    {
      tempId,
    },
    {
      enabled: !!tempId || !!session?.user,
    },
  );

  const createProfileMutation = api.profile.createTempProfile.useMutation();

  // Add state for username dialog
  const [showUsernameDialog, setShowUsernameDialog] = useState(false);

  // Add username submit handler
  const onUsernameSubmit = async (username: string) => {
    try {
      if (!session?.user && tempId) {
        await createProfileMutation.mutateAsync({
          username,
          tempId,
        });
        void profileQuery.refetch();
      }
    } catch (error) {
      throw error;
    }
  };

  // Add effect to check for username
  useEffect(() => {
    if (!session?.user && tempId && !profileQuery.isLoading) {
      if (!profileQuery.data?.username) {
        setShowUsernameDialog(true);
      }
    }
  }, [
    session?.user,
    tempId,
    profileQuery.data?.username,
    profileQuery.isLoading,
  ]);

  const [showTimeWarning, setShowTimeWarning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (gameState.currentBreed && !answeredBreed && !gameState.gameOver) {
      // Always show timer at start of new round
      setGameState(prev => ({ ...prev, timeRemaining: TOTAL_TIME }));
      
      const timer = setInterval(() => {
        setGameState(prev => {
          const newTime = prev.timeRemaining - 1;
          
          if (newTime === WARNING_TIME) {
            setShowTimeWarning(true);
          }
          
          if (newTime <= 0) {
            clearInterval(timer);
            void angryBarkRef.current?.play();
            incrementPlays({ tempId });
            setShowIncorrectDialog(true);
            return { ...prev, timeRemaining: 0 };
          }
          
          return { ...prev, timeRemaining: newTime };
        });
      }, 1000);
      
      timerRef.current = timer;
      
      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        setShowTimeWarning(false);
      };
    }
  }, [gameState.currentBreed, answeredBreed, gameState.gameOver]);

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-8 text-zinc-50">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-6 flex flex-col items-center space-y-2">
          <div className="mb-2 flex w-full items-center justify-between">
            <Link href="/">
              <Button
                variant="ghost"
                className="text-zinc-400 hover:text-zinc-200"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </Link>
          </div>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-[#FFA500]">
            Pawsistence
          </h1>

          {/* Streak Display */}
          <div className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800/50 p-1 backdrop-blur-sm">
            <div className="text-lg font-bold text-[#FFD700]">
              Current Streak: {gameState.currentStreak}
            </div>
          </div>

          {/* Timer Display - Floating Overlay */}
          {!answeredBreed && gameState.currentBreed && !gameState.gameOver && (
            <div
              className={cn(
                "fixed left-1/2 top-18 z-50 -translate-x-1/2 transform",
                "pointer-events-none transition-all duration-300",
                {
                  "translate-y-0 opacity-100": 
                    gameState.timeRemaining >= 28 || // Show for 30-28 seconds
                    gameState.timeRemaining <= WARNING_TIME, // Show for 5-0 seconds
                  "translate-y-[-1rem] opacity-0": 
                    gameState.timeRemaining < 28 && gameState.timeRemaining > WARNING_TIME,
                }
              )}
            >
              <div
                className={cn(
                  "flex items-center gap-2 rounded-lg px-4 py-2",
                  "text-sm font-medium shadow-lg backdrop-blur-sm",
                  {
                    "bg-zinc-900/90 text-zinc-100": gameState.timeRemaining >= 28,
                    "bg-red-900/80 text-red-100": gameState.timeRemaining <= WARNING_TIME,
                  }
                )}
              >
                {gameState.timeRemaining === TOTAL_TIME ? (
                  <>
                    <Timer className="h-4 w-4" />
                    <span>{TOTAL_TIME}s to answer</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4" />
                    <span className="tabular-nums">{gameState.timeRemaining}s left!</span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Game Board */}
        <div className="rounded-xl p-4">
          {gameState.isLoading && !gameState.currentBreed ? (
            <div className="relative">
              <Card className="mb-6 overflow-hidden rounded-xl border border-gray-500 bg-zinc-900/50 shadow-xl shadow-emerald-900/10 backdrop-blur-sm">
                <div className="h-[300px] w-full animate-pulse bg-zinc-800/50 md:h-[350px] lg:h-[400px]" />
              </Card>
            </div>
          ) : gameState.currentBreed ? (
            <div className="relative">
              <Card className="mb-6 overflow-hidden rounded-xl border border-gray-500 bg-zinc-900/50 shadow-xl shadow-emerald-900/10 backdrop-blur-sm">
                <div className="relative h-[300px] w-full bg-zinc-900 md:h-[350px] lg:h-[400px]">
                  <Image
                    src={gameState.currentBreed.imageUrl}
                    alt="Mystery dog"
                    fill
                    unoptimized
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className={cn(
                      "rounded-xl transition-transform duration-500",
                      "object-cover md:object-contain md:scale-105 md:p-2"
                    )}
                    priority
                    quality={90}
                  />
                </div>
              </Card>
            </div>
          ) : null}

          <div className="grid grid-cols-2 gap-4">
            {gameState.options.map((breed) => (
              <Button
                key={breed}
                onClick={() => handleGuess(breed)}
                disabled={
                  gameState.gameOver ||
                  answeredBreed !== null ||
                  gameState.playsRemaining <= 0
                }
                className={cn(
                  // Base styles
                  "text-md rounded-xl p-4 uppercase shadow-lg shadow-emerald-900/10 transition-all duration-200",
                  "border border-gray-500 bg-zinc-900/50 text-zinc-100 disabled:opacity-50",
                  "touch-none select-none",
                  // Hover state only on devices that support hover
                  {
                    "[@media(hover:hover)]:hover:border-emerald-500/50":
                      !answeredBreed && gameState.playsRemaining > 0,
                    // Correct answer
                    "!border-green-500 !bg-green-500/10 !text-green-500":
                      answeredBreed && breed === gameState.currentBreed?.breed,
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

        <IncorrectGuessDialog
          isOpen={showIncorrectDialog}
          onClose={() => setShowIncorrectDialog(false)}
          playsRemaining={gameState.playsRemaining}
          onPlayAgain={handlePlayAgain}
        />
      </div>

      {/* Add this dialog for no plays remaining */}
      <PawsistenceFinishedDialog
        isOpen={showNoPlaysDialog}
        onClose={() => {
          if (gameState.playsRemaining > 0) {
            setShowNoPlaysDialog(false);
          }
        }}
        currentStreak={gameState.currentStreak}
        isHighScore={gameState.currentStreak > (gameData?.highestStreak ?? 0)}
        playsRemaining={gameState.playsRemaining}
        highestStreak={gameData?.highestStreak ?? 0}
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
