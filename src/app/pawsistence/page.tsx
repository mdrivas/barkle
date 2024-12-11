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
const STORAGE_LAST_PLAYED_KEY = 'pawsistence_last_played';

const getGuestPlaysRemaining = () => {
  if (typeof window === 'undefined') return 3;
  
  const lastPlayedStr = localStorage.getItem(STORAGE_LAST_PLAYED_KEY);
  const lastPlayed = lastPlayedStr ? new Date(lastPlayedStr) : null;
  
  // Check if it's a new day in PST
  const now = new Date();
  const isNewDay = !lastPlayed || 
    now.toLocaleDateString('en-US', { timeZone: 'America/Los_Angeles' }) !== 
    new Date(lastPlayed).toLocaleDateString('en-US', { timeZone: 'America/Los_Angeles' });

  if (isNewDay) {
    localStorage.setItem(STORAGE_KEY, '0');
    return 3;
  }
  
  const plays = Number(localStorage.getItem(STORAGE_KEY) ?? 0);
  return Math.max(0, 3 - plays);
};

const incrementGuestPlays = () => {
  const plays = Number(localStorage.getItem(STORAGE_KEY) ?? 0);
  localStorage.setItem(STORAGE_KEY, String(plays + 1));
  localStorage.setItem(STORAGE_LAST_PLAYED_KEY, new Date().toISOString());
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
    playsRemaining: session?.user 
      ? (gameData?.playsRemaining ?? 3) 
      : getGuestPlaysRemaining(),
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
    // Check for no plays remaining first
    if (gameState.playsRemaining <= 0) {
      setShowNoPlaysDialog(true);
      return;
    }

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
      const newStreak = gameState.currentStreak + 1;
      
      // If user is logged in, check and save new high score
      if (session?.user) {
        const isNewHighScore = newStreak > (gameData?.highestStreak ?? 0);
        saveGameResult({
          streak: newStreak,
          isNewHighScore,
        });
      }

      setTimeout(() => {
        setAnsweredBreed(null);
        setGameState(prev => ({
          ...prev,
          currentStreak: newStreak,
        }));
        void fetchNewRound();
      }, 1500);
    } else {
      void angryBarkRef.current?.play();
      
      if (session?.user) {
        // Let the mutation's onSuccess handle all state updates
        incrementPlays();
        // Show the dialog and wait for user interaction
        setShowIncorrectDialog(true);
      } else {
        // Only increment guest plays on incorrect answers
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

        // Toast remains the same
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
    setAnsweredBreed(null);
    
    // Reset game state and fetch new round
    setGameState(prev => ({
      ...prev,
      currentBreed: null,
      options: [],
      isLoading: true,
      currentStreak: 0,
      gameOver: false,
    }));
    
    void fetchNewRound();
  };

  // Add this state to handle no plays remaining
  const [showNoPlaysDialog, setShowNoPlaysDialog] = useState(false);

  // Add nextGameTime to component state
  const [nextGameTime, setNextGameTime] = useState<Date | null>(null);

  // Update the initial effect to properly handle game state
  useEffect(() => {
    if (!gameData) return;
    
    setGameState(prev => ({
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
      setGameState(prev => ({
        ...prev,
        playsRemaining: gameData?.playsRemaining ?? 3,
        highestStreak: gameData?.highestStreak ?? 0,
      }));
    }
  }, [session, gameData]);

  // Add effect to check guest plays on mount
  useEffect(() => {
    if (!session?.user) {
      const remainingPlays = getGuestPlaysRemaining();
      
      setGameState(prev => ({
        ...prev,
        playsRemaining: remainingPlays,
        gameOver: remainingPlays <= 0
      }));

      // If no plays remaining, show the finished dialog
      if (remainingPlays <= 0) {
        // Calculate next game time in PST
        const now = new Date();
        const pstDate = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
        const tomorrow = new Date(pstDate);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        
        setNextGameTime(tomorrow);
        setShowNoPlaysDialog(true);
      }
    }
  }, [session?.user]);

  // Add effect to check for midnight PST reset
  useEffect(() => {
    if (session?.user) return; // Only for non-logged in users

    // Function to check if it's a new day in PST
    const checkAndResetPlays = () => {
      const lastPlayedStr = localStorage.getItem(STORAGE_LAST_PLAYED_KEY);
      if (!lastPlayedStr) return;

      const lastPlayed = new Date(lastPlayedStr);
      const now = new Date();
      
      const isNewDay = 
        now.toLocaleDateString('en-US', { timeZone: 'America/Los_Angeles' }) !== 
        lastPlayed.toLocaleDateString('en-US', { timeZone: 'America/Los_Angeles' });

      if (isNewDay) {
        // Reset plays and update state
        localStorage.setItem(STORAGE_KEY, '0');
        setGameState(prev => ({
          ...prev,
          playsRemaining: 3,
          gameOver: false
        }));
        setShowNoPlaysDialog(false);
      }
    };

    // Check immediately
    checkAndResetPlays();

    // Set up interval to check every minute
    const interval = setInterval(checkAndResetPlays, 60000);

    // Cleanup
    return () => clearInterval(interval);
  }, [session?.user]);

  // Update PawsistenceFinishedDialog to include stored streak
  

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 py-8 px-4">
      <div className="container max-w-4xl mx-auto">
        <div className="flex flex-col items-center mb-6 space-y-2">
          <div className="flex items-center justify-between w-full mb-2">
            <Link href="/">
              <Button variant="ghost" className="text-zinc-400 hover:text-zinc-200">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </Link>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-[#FFA500] mt-2">
            Pawsistence
          </h1>

          {/* Smaller Centered Streak Display */}
          <div className="inline-flex items-center justify-center gap-2 bg-zinc-800/50 backdrop-blur-sm rounded-xl p-1 border border-zinc-700 mt-2">
            <div className="text-lg font-bold text-[#FFD700]">
              Current Streak: {gameState.currentStreak}
            </div>
          </div>
        </div>

        {/* Game Board */}
        <div className="rounded-xl p-4">
          {gameState.isLoading && !gameState.currentBreed ? (
            <Card className="overflow-hidden mb-6 border-0 rounded-xl bg-zinc-900/50 backdrop-blur-sm shadow-xl">
              <div className="w-full h-[300px] bg-zinc-800/50 animate-pulse" />
            </Card>
          ) : gameState.currentBreed ? (
            <Card className="overflow-hidden mb-6 border-0 rounded-xl bg-zinc-900/50 backdrop-blur-sm shadow-xl">
              <Image
                src={gameState.currentBreed.imageUrl}
                alt="Mystery dog"
                width={600}
                height={300}
                className="w-full h-[300px] object-cover hover:scale-105 transition-transform duration-500"
                priority
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
                  "p-4 text-md uppercase transition-all duration-300 rounded-xl shadow-lg",
                  "bg-zinc-900/50 backdrop-blur-sm hover:bg-zinc-800/50",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  {
                    "hover:scale-105": !answeredBreed && gameState.playsRemaining > 0,
                    "border-2 border-green-500/50 text-green-400 bg-green-950/20":
                      answeredBreed && breed === gameState.currentBreed?.breed,
                    "border-2 border-red-500/50 text-red-400 bg-red-950/20":
                      answeredBreed === breed && breed !== gameState.currentBreed?.breed,
                    "opacity-0 pointer-events-none":
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
          // Only allow closing if there are plays remaining
          if (gameState.playsRemaining > 0) {
            setShowNoPlaysDialog(false);
          }
        }}
        currentStreak={gameState.currentStreak}
        isHighScore={gameState.currentStreak > (gameData?.highestStreak ?? 0)}
        playsRemaining={gameState.playsRemaining}
        highestStreak={gameData?.highestStreak ?? 0}
        nextGameTime={nextGameTime}
      />
    </div>
  );
} 