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
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { DogSubmissionModal } from "./components/DogSubmissionModal";
import { api } from "~/trpc/react";
import { NewUserDialog } from "./components/NewUserDialog";
import { FeatureAnnouncementModal } from "./components/FeatureAnnouncementModal";
import { TrophyIcon } from "@heroicons/react/24/outline";

import { useSignIn } from "~/hooks/useSignIn";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-roboto",
});

export default function Home() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showNewUserDialog, setShowNewUserDialog] = useState(false);
  const { handleGoogleSignIn } = useSignIn();
  const [tempId, setTempId] = useState<string | null>(null);
  const [showAchievements, setShowAchievements] = useState(true);

  useEffect(() => {
    const storedTempId = localStorage.getItem("barkle_temp_id");   
    setTempId(storedTempId);
  }, []);

  const { data: tempProfile } = api.profile.getProfile.useQuery(
    { tempId },
    {
      enabled: !session?.user && !!tempId,
    }
  );

  useEffect(() => {
    if (searchParams.get("showLeaderboard") === "true") {
      setShowLeaderboard(true);
      window.history.replaceState({}, "", "/");
    }
  }, [searchParams]);

  const { data: gamesCount } = api.score.getTodayGames.useQuery();

  const { data: usernameCheck } = api.profile.needsUsername.useQuery(
    undefined,
    {
      enabled: !!session?.user,
    },
  );

  useEffect(() => {
    if (usernameCheck?.needsUsername && usernameCheck?.isNewUser) {
      setShowNewUserDialog(true);
    }
  }, [usernameCheck]);

  const handleSignIn = () => {
    void handleGoogleSignIn();
  };

  const { data: userProfile } = api.profile.getProfile.useQuery(
    { tempId: null },
    {
      enabled: !!session?.user,
    }
  );

  return (
    <div>
      <NavigationBar />
      <main
        className={`flex flex-col items-center bg-[#121213] font-sans text-zinc-50 ${roboto.variable}`}
      >
        {/* Account Area - Moved inside main content area */}
        <div className="w-full max-w-4xl px-4 py-2">
          <div className="flex flex-col gap-1">
            {/* Top row - Playing as and Sign in */}
            <div className="flex items-center justify-between">
              {/* Left side */}
              <div className="flex items-center">
                {session?.user ? (
                  <Button
                    onClick={() => setShowAchievements(true)}
                    variant="ghost"
                    className="flex items-center gap-1 text-sm text-amber-500/80 hover:text-amber-400"
                  >
                    <TrophyIcon className="h-4 w-4" />
                    Achievements
                  </Button>
                ) : (
                  tempProfile?.username && (
                    <span className="text-sm font-medium text-emerald-400">
                      Playing as: <span className="text-emerald-300">{tempProfile.username}</span>
                    </span>
                  )
                )}
              </div>
              
              {/* Right side - Sign In/Account */}
              {session?.user ? (
                <Link href="/account">
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 text-base text-zinc-400 hover:text-zinc-200"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base font-medium">
                        {userProfile?.username ?? "Loading..."}
                      </span>
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
                            {userProfile?.username?.[0]?.toUpperCase() ?? "?"}
                          </span>
                        )}
                      </div>
                    </div>
                  </Button>
                </Link>
              ) : (
                <Button
                  onClick={handleSignIn}
                  variant="ghost"
                  className="flex items-center gap-2 py-1 text-sm font-medium text-zinc-400 hover:text-zinc-200"
                >
                  Sign in with Google
                </Button>
              )}
            </div>

            {/* Bottom row - Achievements for non-auth users */}
            {!session?.user && (
              <div className="flex justify-end">
                <Button
                  onClick={() => setShowAchievements(true)}
                  variant="ghost"
                  className="flex items-center gap-1 py-1 text-xs text-amber-500/80 hover:text-amber-400"
                >
                  <TrophyIcon className="h-4 w-4" />
                  Achievements
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Main Content - Centered in the available space */}
        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="flex w-full max-w-2xl flex-col items-center gap-4 px-4">
            {/* Logo - Updated for better circular fit */}
            <div className="relative aspect-square h-52 sm:h-72">
              <Image
                src="/barklelogo.webp"
                alt="Barkle Logo"
                fill
                priority
                className="rounded-full object-cover"
              />
            </div>

            {/* Title */}
            <h1 className="font-roboto text-4xl font-bold tracking-[0.15em] text-zinc-50 sm:text-5xl">
              BARKLE
            </h1>

            {/* Description */}
            <p className="font-roboto max-w-[400px] px-6 text-center text-base text-zinc-300 sm:text-lg">
              5 chances to guess different dog breeds from their photos. A new set
              of pups every day!
            </p>

            {/* Games Counter */}
            <Card className="mt-4 rounded-full bg-[#C4A484] px-6 py-2 text-sm text-black">
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
        </div>

        <NewUserDialog
          isOpen={showNewUserDialog}
          onClose={() => setShowNewUserDialog(false)}
        />
        <FeatureAnnouncementModal 
          open={showAchievements} 
          onOpenChange={setShowAchievements}
        />
      </main>
    </div>
  );
}
