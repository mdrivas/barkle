import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { NavigationBar } from "./components/NavigationBar";
import { LeaderboardModal } from "./components/LeaderboardModal";
import Image from "next/image";
import Link from "next/link";
import { GameModeModal } from "./components/GameModeModal";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-gradient-to-br from-[#1a1a1b] to-[#121213] text-zinc-50">
      <NavigationBar />

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center gap-4 px-4 py-8 max-w-md mx-auto w-full">
        {/* Logo */}
        <div className="w-72 h-72 relative mb-2">
          <Image
            src="/barklelogo.png"
            alt="Barkle Logo"
            width={384}
            height={384}
            priority
            className="rounded-full"
          />
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold tracking-wider -mt-2">BARKLE</h1>

        {/* Description */}
        <p className="text-center text-lg px-6">
          5 chances to guess different dog breeds from their photos. A new set of pups every day!
        </p>

        {/* Buttons */}
        <div className="flex flex-col gap-4 w-full px-6">
          <GameModeModal />
          <LeaderboardModal />
        </div>

        {/* Games Counter */}
        <Card className="bg-gradient-to-r from-[#C4A484] to-[#B08968] text-black px-6 py-3 rounded-full mt-4">
          <p className="text-sm font-medium">
            🐾 163232 Games Played Today 🐾
          </p>
        </Card>
      </div>
    </main>
  );
}
