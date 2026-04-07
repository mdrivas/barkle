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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { DogAvatar } from "~/components/DogAvatar/DogAvatar";

import { useSignIn } from "~/hooks/useSignIn";
import { LevelSystemModal } from "./components/LevelSystemModal";

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
  const [showEndOfMonth, setShowEndOfMonth] = useState(false);
  const [showLevelSystem, setShowLevelSystem] = useState(false);
  const [showCreatorNote, setShowCreatorNote] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const submitFeedback = api.feedback.submit.useMutation({
    onSuccess: () => {
      setFeedbackSubmitted(true);
      setFeedbackText("");
    },
  });

  // useEffect(() => {
  //   const hasSeenCreatorNote = localStorage.getItem("barkle_seen_creator_note_dec2025");
  //   if (!hasSeenCreatorNote) {
  //     setShowCreatorNote(true);
  //   }
  // }, []);

  const dismissCreatorNote = () => {
    localStorage.setItem("barkle_seen_creator_note_dec2025", "true");
    setShowCreatorNote(false);
    setFeedbackSubmitted(false);
    setFeedbackText("");
  };

  const handleSubmitFeedback = () => {
    if (feedbackText.trim()) {
      submitFeedback.mutate({
        message: feedbackText,
        userId: session?.user?.id,
        tempId: tempId,
      });
    }
  };

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
      <div className="fixed inset-0 bg-gradient-to-b from-[#0369a1] to-[#075985]" />

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {(Array.from({ length: 20 }) as undefined[]).map((_, i) => (
          <div
            key={i}
            className="absolute text-white/40"
            style={{
              left: `${Math.random() * 100}%`,
              animation: `float ${Math.random() * 3 + 8}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`,
              fontSize: `${Math.random() * 15 + 15}px`,
              transform: 'translateZ(0)'
            }}
          >
            {['🐕', '❄️', '🎄', '🐾', '⛄', '🐶', '🎁', '🌟', '☃️', '🎅', '💙'][Math.floor(Math.random() * 11)]}
          </div>
        ))}
      </div>

      <div className="fixed inset-0 bg-gradient-to-t from-transparent via-sky-100/5 to-transparent animate-aurora pointer-events-none" />

      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(56,189,248,0.15),transparent_50%)] pointer-events-none" />
      
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
                    onClick={() => setShowLevelSystem(true)}
                    variant="ghost"
                    className="flex items-center gap-1 text-sm text-yellow-500/80 hover:text-yellow-400"
                  >
                    <span className="text-xl">🎖️</span>
                    My Level
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
                  className="flex items-center gap-2 py-1 text-sm font-medium text-zinc-400 hover:text-zinc-200 -ml-4 sm:-ml-4"
                >
                  Sign in with Google
                </Button>
              )}
            </div>

            {/* Remove the entire block for non-signed in users */}
            {/* {!session?.user && (
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
            )} */}
          </div>
        </div>

        <div className="relative z-10 flex flex-1 flex-col items-center justify-center">
          <div className="flex w-full max-w-2xl flex-col items-center gap-4 px-4">
            <div className="absolute top-0 right-4 sm:right-8">
              <div className="flex flex-col items-end">
                <div className="text-lg font-light tracking-widest text-sky-100/90 relative">
                  APRIL
                  <span className="absolute -right-6 top-0"></span>
                </div>
                <div className="text-4xl font-bold tracking-[0.2em] text-sky-100/40">
                  2026
                </div>
              </div>
            </div>

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

            <Card className="mt-4 rounded-full backdrop-blur-md bg-sky-900/10 border border-sky-200/10 px-6 py-2 text-sm text-white/90 shadow-xl">
              <p className="font-medium">
                🐾{" "}
                {gamesCount === undefined
                  ? "..."
                  : `${gamesCount + 4} ${gamesCount + 4 === 1 ? "Game" : "Games"}`}{" "}
                Played Today 🐾
              </p>
            </Card>

            <div className="mt-2 flex w-full max-w-lg flex-col items-center gap-2 px-4">
              <div className="flex w-full gap-4">
                <GameModeModal />
                <Button
                  onClick={() => setShowLeaderboard(true)}
                  className="w-full transform rounded-2xl border border-sky-400/10 bg-[#0369a1]/90 py-7 text-xl font-bold text-white shadow-lg transition-all hover:bg-[#075985] active:scale-95"
                >
                  LEADERBOARD
                </Button>
                <LeaderboardModal
                  open={showLeaderboard}
                  onOpenChange={setShowLeaderboard}
                  defaultMode="daily"
                  showMonthlyIntro={showMonthlyIntro}
                  onMonthlyIntroClose={() => {
                    setShowMonthlyIntro(false);
                    setShowLeaderboard(true);
                  }}
                />
              </div>
              <DogSubmissionModal
                className="mt-2 flex w-full transform items-center justify-center gap-2 rounded-xl border border-sky-400/10 bg-[#0369a1]/90 py-4 text-lg font-medium text-white shadow-lg transition-all hover:bg-[#075985] active:scale-95"
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
              <span>🌟 End of Month Celebration! 🌟</span>
            </DialogTitle>
            <div className="mt-4 space-y-4 text-lg text-zinc-300">
              <div>
                Woof! What an amazing first month of Barkle! 
                Time to celebrate {new Date().toLocaleString('default', { month: 'long' })}&apos;s top pups! 🌟
              </div>
              <div className="text-green-400">
                Stay on top - our champions get exclusive rewards! 🎁
              </div>
            </div>
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

      <LevelSystemModal
        open={showLevelSystem}
        onOpenChange={setShowLevelSystem}
      />

      <Dialog open={showCreatorNote} onOpenChange={setShowCreatorNote}>
        <DialogContent className="border-sky-800/50 bg-gradient-to-br from-sky-950 to-zinc-950 p-6 sm:p-8">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-zinc-50">
              Hey from the creator!
            </DialogTitle>
          </DialogHeader>
          {feedbackSubmitted ? (
            <div className="mt-2 space-y-4 text-center">
              <p className="text-lg text-emerald-400">Thanks for the feedback!</p>
              <p className="text-sm text-zinc-400">I&apos;ll check it out when I get a chance.</p>
              <Button
                onClick={dismissCreatorNote}
                className="mt-4 bg-sky-600 hover:bg-sky-700 text-white"
              >
                Close
              </Button>
            </div>
          ) : (
            <>
              <div className="mt-2 space-y-3 text-sm sm:text-base text-zinc-300">
                <p>
                  Super cool to see a few of you still playing every day! I&apos;ve been busy with other projects lately, but I love that Barkle still has its loyal pup fans.
                </p>
                <p>
                  Got any feature requests or things you&apos;d like to see? Drop a note below!
                </p>
                <p className="text-zinc-500 text-sm">
                  - Matt
                </p>
              </div>
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Any suggestions or requests? (optional)"
                className="mt-3 w-full rounded-lg border border-zinc-700 bg-zinc-900/50 p-3 text-sm text-zinc-200 placeholder-zinc-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                rows={3}
                maxLength={500}
              />
              <div className="mt-4 flex gap-3">
                {feedbackText.trim() ? (
                  <Button
                    onClick={handleSubmitFeedback}
                    disabled={submitFeedback.isPending}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    {submitFeedback.isPending ? "Sending..." : "Send Feedback"}
                  </Button>
                ) : (
                  <Button
                    onClick={dismissCreatorNote}
                    className="flex-1 bg-sky-600 hover:bg-sky-700 text-white"
                  >
                    Got it!
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={dismissCreatorNote}
                  className="border-zinc-700 text-zinc-400 hover:text-zinc-200"
                >
                  Later
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        @keyframes float {
          0% {
            transform: translateY(-50px) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.6;
          }
          100% {
            transform: translateY(100vh) rotate(360deg) translateX(${Math.random() * 200 - 100}px);
            opacity: 0;
          }
        }
        @keyframes aurora {
          0% { opacity: 0.1; }
          50% { opacity: 0.3; }
          100% { opacity: 0.1; }
        }
        .animate-aurora {
          animation: aurora 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
