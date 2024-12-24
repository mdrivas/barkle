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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "~/components/ui/dialog";
import { DogAvatar } from "~/components/DogAvatar/DogAvatar";

import { useSignIn } from "~/hooks/useSignIn";
import { Snowflake } from "lucide-react";

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
  const [showAchievements, setShowAchievements] = useState(false);
  const [showMonthlyIntro, setShowMonthlyIntro] = useState(false);
  const [showEndOfMonth, setShowEndOfMonth] = useState(true);

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

  useEffect(() => {
    setShowMonthlyIntro(true);
  }, []);

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {(Array.from({ length: 20 }) as undefined[]).map((_, i) => (
          <Snowflake
            key={i}
            className="absolute text-white"
            style={{
              left: `${Math.random() * 100}%`,
              animation: `fall ${Math.random() * 3 + 5}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`,
              fontSize: `${Math.random() * 15 + 15}px`,
              transform: 'translateZ(0)'
            }}
          />
        ))}
      </div>
      
      <div className="fixed inset-0 bg-gradient-to-b from-[#1e2c3d]/90 to-[#141c2a]/90" />
      
      <div className="fixed inset-0 bg-gradient-to-t from-transparent via-emerald-500/5 to-transparent animate-aurora pointer-events-none" />
      
      <NavigationBar />
      <main
        className={`relative flex flex-col items-center font-sans text-zinc-50 ${roboto.variable}`}
      >
        <div className="fixed bottom-0 w-full h-20 bg-gradient-to-t from-white/10 to-transparent pointer-events-none" />
        <div className="relative w-full max-w-4xl px-4 py-2 z-10">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
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
                        <DogAvatar 
                          size="sm"
                          imageUrl={userProfile?.profileImageUrl}
                        />
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

        <div className="relative z-10 flex flex-1 flex-col items-center justify-center">
          <div className="flex w-full max-w-2xl flex-col items-center gap-4 px-4">
            <div className="relative aspect-square h-52 sm:h-72">
              <Image
                src="/barklelogo.png"
                alt="Barkle Logo"
                fill
                priority
                className="rounded-full object-cover"
              />
            </div>

            <div className="relative">
              <h1 className="font-roboto text-4xl font-bold tracking-[0.15em] text-zinc-50 sm:text-5xl">
                BARKLE
              </h1>
            </div>

            <p className="font-roboto max-w-[400px] px-6 text-center text-base text-zinc-300 sm:text-lg">
              5 chances to guess different dog breeds from their photos. A new set
              of pups every day!
            </p>

            <Card className="mt-4 rounded-full backdrop-blur-md bg-white/10 border border-white/20 px-6 py-2 text-sm text-white shadow-xl">
              <p className="font-medium">
                🐾{" "}
                {gamesCount === undefined
                  ? "..."
                  : `${gamesCount} ${gamesCount === 1 ? "Game" : "Games"}`}{" "}
                Played Today 🐾
              </p>
            </Card>

            <div className="mt-2 flex w-full max-w-lg flex-col items-center gap-2 px-4">
              <div className="flex w-full gap-4">
                <GameModeModal />
                <Button
                  onClick={() => setShowLeaderboard(true)}
                  className="w-full transform rounded-2xl border border-zinc-600/20 bg-[#2d4c6a] py-7 text-xl font-bold text-zinc-50 shadow-lg transition-all hover:bg-[#1d3b59] active:scale-95"
                >
                  LEADERBOARD
                </Button>
                <LeaderboardModal
                  open={showLeaderboard}
                  onOpenChange={setShowLeaderboard}
                  defaultMode="monthly"
                  showMonthlyIntro={showMonthlyIntro}
                  onMonthlyIntroClose={() => {
                    setShowMonthlyIntro(false);
                    setShowLeaderboard(true);
                  }}
                />
              </div>
              <DogSubmissionModal
                className="mt-2 flex w-full transform items-center justify-center gap-2 rounded-xl border border-[#4c6c8a]/50 bg-[#2d4c6a] py-4 text-lg font-medium text-zinc-100 shadow-lg transition-all hover:bg-[#1d3b59] active:scale-95"
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

      <Dialog open={showEndOfMonth} onOpenChange={setShowEndOfMonth}>
        <DialogContent className="border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 p-8 text-center">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-zinc-50">
              🌟 End of Month Celebration! 🌟
            </DialogTitle>
            <DialogDescription className="mt-4 space-y-4 text-lg text-zinc-300">
              <p>
                Woof! What an amazing first month of Barkle! 
                Time to celebrate {new Date().toLocaleString('default', { month: 'long' })}&apos;s top pups! 🌟
              </p>
              <p className="text-green-400">
                Stay on top - our champions get exclusive rewards! 🎁
              </p>
            </DialogDescription>
          </DialogHeader>
          <Button 
            onClick={() => {
              setShowEndOfMonth(false);
              setShowLeaderboard(true);
            }}
            className="mt-6 w-full bg-green-500 hover:bg-green-600 text-lg font-semibold"
          >
            Show Monthly Champions 🎉
          </Button>
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        @keyframes fall {
          0% {
            transform: translateY(-50px) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 1;
          }
        }
        @keyframes aurora {
          0% { opacity: 0.3; }
          50% { opacity: 0.5; }
          100% { opacity: 0.3; }
        }
        .animate-aurora {
          animation: aurora 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
