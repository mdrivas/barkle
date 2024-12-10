"use client";

import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { useToast } from "~/hooks/use-toast";
import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { useSession, signIn } from "next-auth/react";
import { cn } from "~/lib/utils";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { api } from "~/trpc/react";
import { PawsistenceFinishedDialog } from "./components/PawsistenceFinishedDialog";
import { IncorrectGuessDialog } from "./components/IncorrectGuessDialog";
import { getUserLocalDate } from "~/lib/dates";


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
}

interface BreedsResponse {
  message: Record<string, string[]>;
  status: string;
}

const STORAGE_KEY = 'pawsistence_guest_plays';
const STORAGE_DATE_KEY = 'pawsistence_guest_date';

const getGuestPlaysRemaining = () => {
  if (typeof window === 'undefined') return 3;
  
  const today = getUserLocalDate();
  const lastPlayDate = localStorage.getItem(STORAGE_DATE_KEY);
  const plays = Number(localStorage.getItem(STORAGE_KEY) ?? 0);

  if (lastPlayDate !== today) {
    localStorage.setItem(STORAGE_DATE_KEY, today);
    localStorage.setItem(STORAGE_KEY, '0');
    return 3;
  }

  return Math.max(0, 3 - plays);
};

const incrementGuestPlays = () => {
  const plays = Number(localStorage.getItem(STORAGE_KEY) ?? 0);
  localStorage.setItem(STORAGE_KEY, String(plays + 1));
  localStorage.setItem(STORAGE_DATE_KEY, getUserLocalDate());
};

export default function PawsistenceGame() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [answeredBreed, setAnsweredBreed] = useState<string | null>(null);

  const { data: gameData } = api.pawsistence.getInitialState.useQuery(
    undefined, 
    {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      enabled: !!session?.user,
    }
  );

  const utils = api.useUtils();

  const { mutate: saveGameResult } = api.pawsistence.saveGame.useMutation({
    onSuccess: () => {
      void utils.pawsistence.getInitialState.invalidate();
    },
  });

  const { mutate: incrementPlays } = api.pawsistence.incrementPlays.useMutation({
    onSuccess: (data) => {
      setGameState(prev => ({
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
  });

  const [gameState, setGameState] = useState<GameState>({
    currentBreed: null,
    options: [],
    isLoading: true,
    currentStreak: 0,
    gameOver: false,
    playsRemaining: session?.user ? (gameData?.playsRemaining ?? 3) : 3,
    highestStreak: session?.user ? (gameData?.highestStreak ?? 0) : 0,
  });

  const happyBarkRef = useRef<HTMLAudioElement | null>(null);
  const angryBarkRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    happyBarkRef.current = new Audio("/happy_bark.mp3");
    angryBarkRef.current = new Audio("/angry_bark.mp3");
  }, []);

  const fetchNewRound = useCallback(async () => {
    setGameState(prev => ({ ...prev, isLoading: true }));

    try {
      // Get all possible breeds
      const breedsResponse = await fetch("https://dog.ceo/api/breeds/list/all");
      const breedsData: BreedsResponse = await breedsResponse.json();
      const allBreeds = Object.keys(breedsData.message);

      // Get random breed
      const correctBreed = allBreeds[Math.floor(Math.random() * allBreeds.length)]!;

      // Get random image for the breed
      const breedImagesResponse = await fetch(
        `https://dog.ceo/api/breed/${correctBreed}/images`
      );
      const breedImagesData = await breedImagesResponse.json();
      const images = breedImagesData.message as string[];
      const selectedImage = images[Math.floor(Math.random() * images.length)]!;

      // Get wrong options
      const wrongOptions = allBreeds
        .filter(breed => breed !== correctBreed)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

      // Combine and shuffle options
      const options = [correctBreed, ...wrongOptions].sort(() => Math.random() - 0.5);

      setGameState(prev => ({
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
      });
    } else {
      saveGameResult({
        streak: gameState.currentStreak,
        isNewHighScore: false,
      });
    }
  }, [gameState.currentStreak, gameData?.highestStreak, saveGameResult]);

  const [showIncorrectDialog, setShowIncorrectDialog] = useState(false);

  const handleGuess = async (breed: string) => {
    if (gameState.isLoading || gameState.gameOver) return;

    // Check if non-logged in user has reached play limit
    if (!session?.user && getGuestPlaysRemaining() <= 0) {
      setShowNoPlaysDialog(true);
      return;
    }

    const isCorrect = breed === gameState.currentBreed?.breed;
    setAnsweredBreed(breed);

    if (isCorrect) {
      void happyBarkRef.current?.play();
      setTimeout(() => {
        setAnsweredBreed(null);
        setGameState(prev => ({
          ...prev,
          currentStreak: prev.currentStreak + 1,
        }));
        if (!session?.user) {
          incrementGuestPlays();
        }
        void fetchNewRound();
      }, 1500);
    } else {
      void angryBarkRef.current?.play();
      
      if (session?.user) {
        // Let the mutation's onSuccess handle all state updates
        incrementPlays();
      } else {
        // For guest users
        incrementGuestPlays();
        const remainingPlays = getGuestPlaysRemaining();
        
        setGameState(prev => ({
          ...prev,
          gameOver: remainingPlays <= 0,
          playsRemaining: remainingPlays
        }));

        if (remainingPlays <= 0) {
          setShowNoPlaysDialog(true);
        } else {
          setShowIncorrectDialog(true);
        }

        toast({
          title: "Sign in to save your streak!",
          description: "Create an account to track your progress and compete on the leaderboard.",
          action: (
            <Button 
              onClick={() => void signIn("google")}
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
    
    setGameState(prev => ({
      ...prev,
      currentBreed: null,
      options: [],
      isLoading: true,
      currentStreak: 0,
      gameOver: false,
    }));
    setAnsweredBreed(null);
    void fetchNewRound();
  };

  // Add this state to handle no plays remaining
  const [showNoPlaysDialog, setShowNoPlaysDialog] = useState(false);

  // Modify the initial effect to be more comprehensive
  useEffect(() => {
    const checkPlaysRemaining = () => {
      if (session?.user) {
        // For logged in users, check gameData
        if (gameData && gameData.playsRemaining <= 0) {
          setShowNoPlaysDialog(true);
          setGameState(prev => ({
            ...prev,
            gameOver: true,
            playsRemaining: 0,
          }));
        }
      } else {
        // For guest users, check localStorage
        const guestPlaysRemaining = getGuestPlaysRemaining();
        if (guestPlaysRemaining <= 0) {
          setShowNoPlaysDialog(true);
          setGameState(prev => ({
            ...prev,
            gameOver: true,
            playsRemaining: 0,
          }));
        }
      }
    };

    checkPlaysRemaining();
  }, [session?.user, gameData?.playsRemaining]); // Add gameData.playsRemaining as dependency

  // Update gameState when session/gameData changes
  useEffect(() => {
    if (session?.user) {
      setGameState(prev => ({
        ...prev,
        playsRemaining: gameData?.playsRemaining ?? 3,
        highestStreak: gameData?.highestStreak ?? 0,
      }));
    }
  }, [session, gameData]);
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 py-8 px-4">
      <div className="container max-w-4xl mx-auto">
        <div className="flex flex-col items-center mb-6 space-y-2">
          <div className="flex items-center justify-between w-full mb-2">
            <Link href="/">
              <Button variant="ghost" className="text-zinc-400 hover:text-zinc-200">
                <ArrowLeft className="mr-1.5 h-5 w-5" />
                Back
              </Button>
            </Link>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white-500 mt-0.5 drop-shadow-lg">
            Pawsistence
          </h1>
          {/* Streak Display */}
          <div className="inline-flex items-center justify-center gap-2 rounded-xl p-2 mt-2 shadow-lg">
            <div className="text-lg font-bold text-amber-400">
              Current Streak: {gameState.currentStreak}
            </div>
          </div>
        </div>

        {/* Game Board */}
        {gameState.isLoading && !gameState.currentBreed ? (
          <Card className="overflow-hidden mb-6 border-0 rounded-xl bg-zinc-900/50 backdrop-blur-sm shadow-xl shadow-emerald-900/10">
            <div className="w-full h-[400px] bg-zinc-800/50 animate-pulse" />
          </Card>
        ) : gameState.currentBreed ? (
          <Card className="overflow-hidden mb-6 border-0 rounded-xl bg-zinc-900/50 backdrop-blur-sm shadow-xl shadow-emerald-900/10">
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
              disabled={
                gameState.gameOver || 
                answeredBreed !== null || 
                gameState.playsRemaining <= 0
              }
              className={cn(
                "p-6 text-lg uppercase transition-all duration-200 rounded-xl shadow-lg shadow-emerald-900/10 disabled:opacity-50 bg-zinc-900/50 text-zinc-100 border border-zinc-800",
                {
                  "hover:border-emerald-500/50": !answeredBreed && gameState.playsRemaining > 0,
                  "border-green-500 text-green-500":
                    answeredBreed && breed === gameState.currentBreed?.breed,
                  "border-red-500 text-red-500":
                    answeredBreed === breed && breed !== gameState.currentBreed?.breed,
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
        onClose={() => setShowNoPlaysDialog(false)}
        currentStreak={gameState.currentStreak}
        isHighScore={gameState.currentStreak > (gameData?.highestStreak ?? 0)}
        playsRemaining={gameState.playsRemaining}
        highestStreak={gameData?.highestStreak ?? 0}
      />
    </div>
  );
} 