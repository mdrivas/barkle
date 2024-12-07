"use client";

import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { NavigationBar } from "./components/NavigationBar";
import { LeaderboardModal } from "./components/LeaderboardModal";
import Image from "next/image";
import Link from "next/link";
import { GameModeModal } from "./components/GameModeModal";
import { useSession } from "next-auth/react";
import { Roboto } from "next/font/google";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-roboto",
});

export default function Home() {
  const { data: session } = useSession();

  return (
    <main className={`flex min-h-screen flex-col items-center bg-[#121213] text-zinc-50 font-sans ${roboto.variable}`}>
      <NavigationBar />

      {/* Account Area */}
      {session?.user && (
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
      )}

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center gap-6 px-4 py-12 max-w-2xl mx-auto w-full">
        {/* Logo */}
        <div className="w-72 h-72 relative flex items-center justify-center">
          <Image
            src="/barklelogo.png"
            alt="Barkle Logo"
            width={288}
            height={288}
            priority
            className="rounded-full"
          />
        </div>

        {/* Title */}
        <h1 className="text-6xl font-bold tracking-[0.15em] text-zinc-50 font-roboto">
          BARKLE
        </h1>

        {/* Description */}
        <p className="text-center text-zinc-300 text-lg px-6 max-w-[400px] mb-4 font-roboto">
          5 chances to guess different dog breeds from their photos. A new set of pups every day!
        </p>

        {/* Buttons */}
        <div className="flex gap-4 w-full max-w-lg mb-6">
          <GameModeModal />
          <LeaderboardModal />
        </div>

        {/* Games Counter */}
        <Card className="bg-[#C4A484] text-black px-8 py-3 rounded-full">
          <p className="text-sm font-medium">
            🐾 16 Games Played Today 🐾
          </p>
        </Card>
      </div>
    </main>
  );
}
