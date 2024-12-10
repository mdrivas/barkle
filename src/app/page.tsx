"use client";

import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { NavigationBar } from "./components/NavigationBar";
import { LeaderboardModal } from "./components/LeaderboardModal";
import Image from "next/image";
import Link from "next/link";
import { GameModeModal } from "./components/GameModeModal";
import { useSession, signIn } from "next-auth/react";
import { Roboto } from "next/font/google";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { DogSubmissionModal } from "./components/DogSubmissionModal";
import { api } from "~/trpc/react";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-roboto",
});

export default function Home() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  
  useEffect(() => {
    if (searchParams.get('showLeaderboard') === 'true') {
      setShowLeaderboard(true);
      window.history.replaceState({}, '', '/');
    }
  }, [searchParams]);

  const { data: gamesCount } = api.score.getTodayGames.useQuery({
    timezone: new Date().getTimezoneOffset()
  });

  return (
    <main className={`flex min-h-screen flex-col items-center bg-[#121213] text-zinc-50 font-sans ${roboto.variable}`}>
      <NavigationBar />

      {/* Account Area */}
      {session?.user ? (
        <div className="w-full max-w-4xl mx-auto px-4 py-2">
          <div className="flex items-center justify-end gap-3">
            <Link href="/account">
              <Button 
                variant="ghost" 
                className="flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200"
              >
                <div className="flex flex-col items-end">
                  <span className="font-medium">{session.user.name}</span>
                  <span className="text-xs text-zinc-500">{session.user.email}</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                  {session.user.image ? (
                    <Image
                      src={session.user.image}
                      alt="Profile"
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  ) : (
                    <span className="text-sm">
                      {session.user.name?.[0]?.toUpperCase() ?? "?"}
                    </span>
                  )}
                </div>
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-4xl mx-auto px-4 py-2">
          <div className="flex justify-end">
            <Button
              onClick={() => void signIn("google")}
              variant="ghost"
              className="text-zinc-400 hover:text-zinc-200"
            >
              Sign In
            </Button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center gap-4 px-4 py-8 max-w-2xl mx-auto w-full">
        {/* Logo */}
        <div className="w-64 h-64 relative flex items-center justify-center">
          <Image
            src="/barklelogo.png"
            alt="Barkle Logo"
            width={256}
            height={256}
            priority
            className="rounded-full"
          />
        </div>

        {/* Title */}
        <h1 className="text-5xl font-bold tracking-[0.15em] text-zinc-50 font-roboto mt-2">
          BARKLE
        </h1>

        {/* Description */}
        <p className="text-center text-zinc-300 text-lg px-6 max-w-[400px] font-roboto">
          5 chances to guess different dog breeds from their photos. A new set of pups every day!
        </p>

        {/* Games Counter */}
        <Card className="bg-[#C4A484] text-black px-6 py-2 rounded-full text-sm">
          <p className="font-medium">
            🐾 {gamesCount ?? 0} {(gamesCount ?? 0) === 1 ? 'Game' : 'Games'} Played Today 🐾
          </p>
        </Card>

        {/* Game Buttons and Submit Link */}
        <div className="flex flex-col items-center gap-2 w-full max-w-lg px-4 mt-2">
          <div className="flex gap-4 w-full">
            <GameModeModal />
            <Button 
              onClick={() => setShowLeaderboard(true)}
              className="w-full py-7 text-xl font-bold bg-gradient-to-br from-zinc-700 to-zinc-800 hover:from-zinc-600 hover:to-zinc-700 text-white rounded-2xl shadow-lg transform transition-all active:scale-95 border border-zinc-600/20"
            >
              LEADERBOARD
            </Button>
            <LeaderboardModal 
              open={showLeaderboard} 
              onOpenChange={setShowLeaderboard}
            />
          </div>
          <DogSubmissionModal 
            className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
            variant="link"
          />
        </div>
      </div>
    </main>
  );
}
