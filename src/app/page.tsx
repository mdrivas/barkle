import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { NavigationBar } from "./components/NavigationBar";
import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-black text-white">
      <NavigationBar />

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center gap-6 px-4 py-8 max-w-md mx-auto w-full">
        {/* Logo */}
        <div className="w-72 h-72 relative">
          <Image
            src="/barklelogo.png"
            alt="Barkle Logo"
            width={384}  // 24 * 4 to ensure high quality
            height={384}
            priority
            className="rounded-full"
          />
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold tracking-wider">BARKLE</h1>

        {/* Description */}
        <p className="text-center text-lg px-6">
          5 chances to guess different dog breeds from their photos. A new set of pups every day!
        </p>

        {/* Buttons */}
        <div className="flex flex-col gap-4 w-full px-6">
          <Button 
            className="w-full py-6 text-xl font-semibold bg-[#4A6741] hover:bg-[#3d5635] text-white rounded-md"
          >
            PLAY
          </Button>
          
          <Button 
            variant="secondary"
            className="w-full py-6 text-xl font-semibold bg-gray-700 hover:bg-gray-600 text-white rounded-md"
          >
            LEADERBOARD
          </Button>
        </div>

        {/* Games Counter */}
        <Card className="bg-[#C4A484] text-black px-6 py-3 rounded-full mt-4">
          <p className="text-sm font-medium">
            🎮 163232 Games Played Today 🎮
          </p>
        </Card>
      </div>
    </main>
  );
}
