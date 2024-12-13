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
import { NewUserDialog } from "./components/NewUserDialog";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-roboto",
});

export default function Home() {
  const { data: session, status: sessionStatus } = useSession();
  const searchParams = useSearchParams();
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showNewUserDialog, setShowNewUserDialog] = useState(false);

  useEffect(() => {
    if (searchParams.get("showLeaderboard") === "true") {
      setShowLeaderboard(true);
      window.history.replaceState({}, "", "/");
    }
  }, [searchParams]);

  const { data: gamesCount } = api.score.getTodayGames.useQuery();
  const { data: profile, isLoading: isProfileLoading } =
    api.user.getProfile.useQuery(undefined, {
      enabled: !!session?.user,
      retry: false,
      staleTime: 0,
    });

  const { data: usernameCheck } = api.user.needsUsername.useQuery(undefined, {
    enabled: !!session?.user,
  });

  useEffect(() => {
    if (usernameCheck?.needsUsername && usernameCheck?.isNewUser) {
      setShowNewUserDialog(true);
    }
  }, [usernameCheck]);

  // Generic sign-in function you can use throughout your app
  const handleSignIn = () => {
    let tempId = localStorage.getItem("barkle_temp_id");

    if (!tempId) {
      tempId = crypto.randomUUID();
      localStorage.setItem("barkle_temp_id", tempId);
    }

    void signIn("google", {
      prompt: "select_account",
      callbackUrl: window.location.href,
      tempId: tempId,
    });
  };

  return (
    <main
      className={`flex min-h-screen flex-col items-center bg-[#121213] font-sans text-zinc-50 ${roboto.variable}`}
    >
      <NavigationBar />

      {/* Account Area */}
      {session?.user ? (
        <div className="mx-auto w-full max-w-4xl px-4 py-2">
          <div className="flex items-center justify-end gap-3">
            <Link href="/account">
              <Button
                variant="ghost"
                className="flex items-center gap-2 text-base text-zinc-400 hover:text-zinc-200"
              >
                <div className="flex flex-col items-end">
                  <span className="text-base font-medium">
                    {session.user.name}
                  </span>
                  <span className="text-sm text-zinc-500">
                    {session.user.email}
                  </span>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800">
                  {session.user.image ? (
                    <Image
                      src={session.user.image}
                      alt="Profile"
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  ) : (
                    <span className="text-base">
                      {session.user.name?.[0]?.toUpperCase() ?? "?"}
                    </span>
                  )}
                </div>
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="mx-auto w-full max-w-4xl px-4 py-2">
          <div className="flex justify-end">
            <Button
              onClick={handleSignIn}
              variant="ghost"
              className="text-lg font-medium text-zinc-400 hover:text-zinc-200"
            >
              Sign In
            </Button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center justify-center gap-1 px-4 py-2">
        {/* Logo */}
        <div className="relative flex h-56 w-56 items-center justify-center">
          <Image
            src="/barklelogo.png"
            alt="Barkle Logo"
            width={320}
            height={320}
            priority
            className="rounded-full object-contain"
          />
        </div>

        {/* Title */}
        <h1 className="font-roboto text-5xl font-bold tracking-[0.15em] text-zinc-50">
          BARKLE
        </h1>

        {/* Description */}
        <p className="font-roboto max-w-[400px] px-6 text-center text-lg text-zinc-300">
          5 chances to guess different dog breeds from their photos. A new set
          of pups every day!
        </p>

        {/* Games Counter */}
        <Card className="mt-8 rounded-full bg-[#C4A484] px-6 py-2 text-sm text-black">
          <p className="font-medium">
            🐾{" "}
            {gamesCount === undefined
              ? "..."
              : `${gamesCount} ${gamesCount === 1 ? "Game" : "Games"}`}{" "}
            Played Today 🐾
          </p>
        </Card>

        {/* Game Buttons and Submit Link */}
        <div className="mt-2 flex w-full max-w-lg flex-col items-center gap-2 px-4">
          <div className="flex w-full gap-4">
            <GameModeModal />
            <Button
              onClick={() => setShowLeaderboard(true)}
              className="w-full transform rounded-2xl border border-zinc-600/20 bg-amber-700 py-7 text-xl font-bold text-zinc-50 shadow-lg transition-all hover:bg-amber-800 active:scale-95"
            >
              LEADERBOARD
            </Button>
            <LeaderboardModal
              open={showLeaderboard}
              onOpenChange={setShowLeaderboard}
            />
          </div>
          <DogSubmissionModal
            className="mt-2 flex w-full transform items-center justify-center gap-2 rounded-xl border border-zinc-700/50 bg-zinc-800 py-4 text-lg font-medium text-zinc-100 shadow-lg transition-all hover:bg-zinc-700 active:scale-95"
            variant="default"
          />
        </div>
      </div>

      <NewUserDialog
        isOpen={showNewUserDialog}
        onClose={() => setShowNewUserDialog(false)}
      />
    </main>
  );
}
