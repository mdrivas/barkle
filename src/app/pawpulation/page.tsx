"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useToast } from "~/hooks/use-toast";
import { useProfileContext } from "~/app/components/ProfileProvider";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";
import { motion, AnimatePresence } from "framer-motion";
import type { InferSelectModel } from "drizzle-orm";
import type { breedPopulations } from "~/server/db/schema";
import { PawpulationFinishedDialog } from "./components/PawpulationFinishedDialog";

type Breed = InferSelectModel<typeof breedPopulations>;

interface GameState {
  currentBreed: Breed | null;
  nextBreed: Breed | null;
  score: number;
  isGameOver: boolean;
  hasSavedScore: boolean;
}

export default function PawpulationGame() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const { tempId } = useProfileContext();
  const [gameState, setGameState] = useState<GameState>({
    currentBreed: null,
    nextBreed: null,
    score: 0,
    isGameOver: false,
    hasSavedScore: false,
  });

  // Sound effects
  const correctSoundRef = useRef<HTMLAudioElement | null>(null);
  const wrongSoundRef = useRef<HTMLAudioElement | null>(null);

  // Add these queries
  const { data: breedPair, refetch: refetchBreeds } = api.pawpulation.getBreedPair.useQuery(
    {
      currentBreedId: gameState.currentBreed?.id,
    },
    {
      enabled: true,
    }
  );

  const saveMutation = api.pawpulation.saveGame.useMutation();

  // Add profile query
  const { data: userProfile } = api.profile.getProfile.useQuery(
    {
      tempId,
    },
    {
      enabled: !!tempId || !!session?.user,
    },
  );

  // Update fetchNewRound to pass current breed ID
  const fetchNewRound = useCallback(() => {
    void refetchBreeds();
  }, [refetchBreeds]);

  // Initialize the game
  useEffect(() => {
    void fetchNewRound();
  }, [fetchNewRound]);

  // Update when new breeds are fetched
  useEffect(() => {
    if (breedPair) {
      setSelectedGuess(null); // Reset guess state when new breeds arrive
      setGameState(prev => ({
        ...prev,
        currentBreed: breedPair.currentBreed ?? null,
        nextBreed: breedPair.nextBreed ?? null,
      }));
    }
  }, [breedPair]);

  // Add state for the selected guess
  const [selectedGuess, setSelectedGuess] = useState<'higher' | 'lower' | null>(null);

  // Add state for dialog
  const [showGameOverDialog, setShowGameOverDialog] = useState(false);

  // Update handleGuess to properly save game
  const handleGuess = (isHigher: boolean) => {
    if (!gameState.currentBreed || !gameState.nextBreed) return;
    
    const guess = isHigher ? 'higher' : 'lower';
    setSelectedGuess(guess);

    const isCorrect = isHigher 
      ? gameState.nextBreed.population > gameState.currentBreed.population
      : gameState.nextBreed.population < gameState.currentBreed.population;

    if (isCorrect) {
      void correctSoundRef.current?.play();
      setTimeout(() => {
        setSelectedGuess(null);
        setGameState(prev => ({
          ...prev,
          score: prev.score + 1,
          currentBreed: prev.nextBreed,
          nextBreed: null,
        }));
        void fetchNewRound();
      }, 1000);
    } else {
      void wrongSoundRef.current?.play();
      handleGameOver();
    }
  };

  // Add handlePlayAgain function
  const handlePlayAgain = useCallback(() => {
    setShowGameOverDialog(false);
    setSelectedGuess(null);
    setGameState({
      currentBreed: null,
      nextBreed: null,
      score: 0,
      isGameOver: false,
      hasSavedScore: false,
    });
    void fetchNewRound();
  }, [fetchNewRound]);

  // Update the save game call
  const handleGameOver = useCallback(() => {
    if (gameState.hasSavedScore) return;
    
    setGameState(prev => ({
      ...prev,
      hasSavedScore: true
    }));

    void saveMutation.mutate({
      score: gameState.score,
      tempId: !session?.user ? tempId : null,
    });

    setShowGameOverDialog(true);
  }, [gameState.score, gameState.hasSavedScore, saveMutation, session?.user, tempId]);

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-8 text-zinc-50">
      <div className="container mx-auto max-w-6xl">
        {/* Header - More compact layout */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-zinc-400 hover:text-zinc-200">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-3xl font-bold text-purple-400">
              Pawpulation
            </h1>
          </div>
          <div className="rounded-xl border border-zinc-700 bg-zinc-800/50 px-3 py-1.5">
            <span className="text-lg font-bold text-purple-300">
              Score: {gameState.score}
            </span>
          </div>
        </div>

        {/* Game Board - Different layouts for mobile/desktop */}
        <div className="relative flex flex-col-reverse sm:flex-row sm:items-center sm:gap-8 gap-4">
          {/* Current Breed Card (Bottom on mobile, Left on desktop) */}
          <AnimatePresence mode="popLayout">
            {gameState.currentBreed && (
              <motion.div
                key={`current-${gameState.currentBreed.breed}`}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="w-full sm:w-1/2"
              >
                <Card className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50">
                  <div className="relative aspect-[16/9] w-full overflow-hidden">
                    <Image
                      src={gameState.currentBreed?.imageUrl ?? "/breeds/placeholder.jpg"}
                      alt={gameState.currentBreed?.breed ?? ""}
                      fill
                      className="object-cover"
                      priority
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent" />
                  </div>
                  
                  <div className="relative p-3 sm:p-4">
                    <h3 className="mb-1 text-lg font-bold text-zinc-50">
                      {gameState.currentBreed.breed}
                    </h3>
                    <div className="mb-1 text-base font-bold text-purple-400">
                      Population: {gameState.currentBreed.population.toLocaleString()}
                    </div>
                    <p className="text-xs text-zinc-400">
                      {gameState.currentBreed.funFact}
                    </p>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* VS Indicator */}
          <div className="flex items-center justify-center -my-2 sm:my-0 z-10">
            <span className="px-3 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30">
              VS
            </span>
          </div>

          {/* New Breed Card (Top on mobile, Right on desktop) */}
          <AnimatePresence mode="popLayout">
            {gameState.nextBreed && (
              <motion.div
                key={`next-${gameState.nextBreed.breed}`}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="w-full sm:w-1/2"
              >
                <Card className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50">
                  <div className="relative aspect-[16/9] w-full overflow-hidden">
                    <Image
                      src={gameState.nextBreed?.imageUrl ?? "/breeds/placeholder.jpg"}
                      alt={gameState.nextBreed?.breed ?? ""}
                      fill
                      className="object-cover"
                      priority
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent" />
                  </div>
                  
                  <div className="relative p-3 sm:p-4">
                    <h3 className="mb-1 text-lg font-bold text-zinc-50">
                      {gameState.nextBreed.breed}
                    </h3>
                    <div className="mb-1 text-base font-bold text-purple-400">
                      Population: ???
                    </div>
                    <p className="text-xs text-zinc-400">
                      Does this breed have a higher or lower population?
                    </p>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Comparison Buttons */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-zinc-950 via-zinc-950/95 to-transparent sm:relative sm:bg-transparent sm:mt-6">
          <div className="grid grid-cols-2 gap-4 max-w-4xl mx-auto">
            <Button
              onClick={() => handleGuess(false)}
              disabled={gameState.isGameOver || selectedGuess !== null}
              className={cn(
                // Base styles
                "text-md rounded-xl p-4 uppercase shadow-lg shadow-emerald-900/10 transition-all duration-200",
                "border border-gray-500 bg-zinc-900/50 text-zinc-100 disabled:opacity-50",
                "touch-none select-none",
                // Hover state only on devices that support hover
                {
                  "[@media(hover:hover)]:hover:border-red-500/50": !selectedGuess,
                  // Correct/wrong states
                  "!border-red-500 !bg-red-500/10 !text-red-500": 
                    selectedGuess === 'lower' && (gameState.nextBreed?.population ?? 0) > (gameState.currentBreed?.population ?? 0),
                  "!border-green-500 !bg-green-500/10 !text-green-500":
                    selectedGuess === 'lower' && (gameState.nextBreed?.population ?? 0) < (gameState.currentBreed?.population ?? 0),
                  "pointer-events-none": selectedGuess !== null,
                }
              )}
              variant="outline"
            >
              Lower
            </Button>
            <Button
              onClick={() => handleGuess(true)}
              disabled={gameState.isGameOver || selectedGuess !== null}
              className={cn(
                // Base styles
                "text-md rounded-xl p-4 uppercase shadow-lg shadow-emerald-900/10 transition-all duration-200",
                "border border-gray-500 bg-zinc-900/50 text-zinc-100 disabled:opacity-50",
                "touch-none select-none",
                // Hover state only on devices that support hover
                {
                  "[@media(hover:hover)]:hover:border-green-500/50": !selectedGuess,
                  // Correct/wrong states
                  "!border-red-500 !bg-red-500/10 !text-red-500":
                    selectedGuess === 'higher' && (gameState.nextBreed?.population ?? 0) < (gameState.currentBreed?.population ?? 0),
                  "!border-green-500 !bg-green-500/10 !text-green-500":
                    selectedGuess === 'higher' && (gameState.nextBreed?.population ?? 0) > (gameState.currentBreed?.population ?? 0),
                  "pointer-events-none": selectedGuess !== null,
                }
              )}
              variant="outline"
            >
              Higher
            </Button>
          </div>
        </div>

        {/* Reduced bottom padding on desktop */}
        <div className="h-24 sm:h-8" />
      </div>

      {/* Sound Effects */}
      <audio ref={correctSoundRef} src="/happy_bark.mp3" />
      <audio ref={wrongSoundRef} src="/angry_bark.mp3" />

      <PawpulationFinishedDialog
        isOpen={showGameOverDialog}
        score={gameState.score}
        onPlayAgain={handlePlayAgain}
        onClose={() => setShowGameOverDialog(false)}
      />
    </div>
  );
} 