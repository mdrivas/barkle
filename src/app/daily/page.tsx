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

  const [gameState, setGameState] = useState<GameState>({
    currentBreed: null,
    options: [],
    isLoading: true,
    score: 0,
    guessesRemaining: 5,
    gameOver: false
  });

  const { toast } = useToast();

  const [answeredBreed, setAnsweredBreed] = useState<string | null>(null);

  //TODO: call trpc method to check if user can play today, if user cannot play today, pop up modal saying you cannot play any more today

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

  const handleGuess = (selectedBreed: string) => {
    if (!gameState.currentBreed || gameState.gameOver) return;

    const isCorrect = selectedBreed === gameState.currentBreed.breed;
    setAnsweredBreed(selectedBreed);

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

    // Fetch next round after delay if not game over
    if (!isGameOver) {
      setTimeout(() => {
        setAnsweredBreed(null);
        void fetchNewRound();
      }, 1500);
    }
  };

  const handleGameFinishedClose = () => {
    // Only reset the game if the user is authenticated
    if (session?.user) {
      setGameState(prev => ({
        ...prev,
        currentBreed: null,
        options: [],
        isLoading: true,
        score: 0,
        guessesRemaining: 5,
        gameOver: false
      }));
      void fetchNewRound();
    }
  };

  if (gameState.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-emerald-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 py-12 px-4">
      <div className="container max-w-4xl mx-auto">
        <Button
          onClick={() => {
            setGameState(prev => ({
              ...prev,
              gameOver: true,
              guessesRemaining: 0
            }));
          }}
          className="mb-4 bg-red-500 hover:bg-red-600"
        >
          Test Game Over
        </Button>

        <div className="text-center mb-8 space-y-4">
          <h1 className="text-5xl font-bold tracking-tight text-[#F9F8E4]">
            Barkle<span className="text-[#538D4E]">?</span>
          </h1>
          <div className="inline-flex items-center justify-center gap-4">
            <div className="px-4 py-2 rounded-full bg-zinc-900/50 backdrop-blur-sm border border-zinc-800">
              <p className="text-xl text-[#538D4E] font-medium">
                Score: <span className="text-zinc-100 ">{gameState.score}</span>
              </p>
            </div>
            <div className="px-4 py-2 rounded-full bg-zinc-900/50 backdrop-blur-sm border border-zinc-800">
              <p className="text-xl text-amber-400 font-medium">
                Guesses: <span className="text-zinc-100">{gameState.guessesRemaining}</span>
              </p>
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

      <GameFinishedDialog 
        isOpen={gameState.gameOver}
        score={gameState.score}
        onClose={handleGameFinishedClose}
      />
    </div>
  );
}
