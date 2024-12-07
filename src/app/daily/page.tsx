import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

interface DogBreed {
  breed: string;
  imageUrl: string;
}

interface GameState {
  currentBreed: DogBreed | null;
  options: string[];
  isLoading: boolean;
  score: number;
  totalGuesses: number;
}

export default function DailyGame() {
  const [gameState, setGameState] = useState<GameState>({
    currentBreed: null,
    options: [],
    isLoading: true,
    score: 0,
    totalGuesses: 0
  });

  const { toast } = useToast();

  useEffect(() => {
    fetchNewRound();
  }, []);

  const fetchNewRound = async () => {
    try {
      setGameState(prev => ({ ...prev, isLoading: true }));

      // Fetch list of all breeds
      const breedsResponse = await fetch('https://dog.ceo/api/breeds/list/all');
      const breedsData = await breedsResponse.json();
      const allBreeds = Object.keys(breedsData.message);

      // Select random breed for correct answer
      const correctBreed = allBreeds[Math.floor(Math.random() * allBreeds.length)];

      // Fetch random image for correct breed
      const imageResponse = await fetch(`https://dog.ceo/api/breed/${correctBreed}/images/random`);
      const imageData = await imageResponse.json();

      // Generate 3 wrong options
      const wrongOptions = new Set<string>();
      while (wrongOptions.size < 3) {
        const wrongBreed = allBreeds[Math.floor(Math.random() * allBreeds.length)];
        if (wrongBreed !== correctBreed) {
          wrongOptions.add(wrongBreed);
        }
      }

      // Combine and shuffle options
      const options = [...wrongOptions, correctBreed].sort(() => Math.random() - 0.5);

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
  };

  const handleGuess = (selectedBreed: string) => {
    if (!gameState.currentBreed) return;

    const isCorrect = selectedBreed === gameState.currentBreed.breed;
    
    setGameState(prev => ({
      ...prev,
      score: isCorrect ? prev.score + 1 : prev.score,
      totalGuesses: prev.totalGuesses + 1
    }));

    toast({
      title: isCorrect ? "Correct!" : "Wrong!",
      description: isCorrect 
        ? "Good job! That's the right breed!"
        : `Sorry, it was a ${gameState.currentBreed.breed}`,
      variant: isCorrect ? "default" : "destructive"
    });

    // Fetch next round after short delay
    setTimeout((fetchNewRound, 1500);
  };

  if (gameState.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">Guess the Dog Breed!</h1>
        <p className="text-xl text-gray-600">
          Score: {gameState.score} / {gameState.totalGuesses}
        </p>
      </div>

      {gameState.currentBreed && (
        <Card className="overflow-hidden mb-8">
          <img
            src={gameState.currentBreed.imageUrl}
            alt="Mystery dog"
            className="w-full h-[400px] object-cover"
          />
        </Card>
      )}

      <div className="grid grid-cols-2 gap-4">
        {gameState.options.map((breed) => (
          <Button
            key={breed}
            onClick={() => handleGuess(breed)}
            className="p-4 text-lg capitalize"
            variant="outline"
          >
            {breed.replace('-', ' ')}
          </Button>
        ))}
      </div>
    </div>
  );
}
