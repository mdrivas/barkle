"use client";

import { Button } from "~/components/ui/button";
import { Terms } from "./components/Terms";
import { FAQSheet } from "./components/FAQSheet";
import { FeedbackSheet } from "./components/FeedbackSheet";
import { Instagram, TiktokIcon } from "./components/icons";
import { getCurrentMonthYear } from "~/lib/dates";
import { LeaderboardModal } from "./components/LeaderboardModal";
import Image from "next/image";
import Link from "next/link";
import { GameModeModal } from "./components/GameModeModal";
import { useSession } from "next-auth/react";
import { instrumentSerif } from "~/lib/fonts";
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

  const { month: currentMonth, year: currentYear } = getCurrentMonthYear();
  const { data: isAdmin } = api.profile.isAdmin.useQuery(undefined, {
    enabled: !!session?.user,
  });

  const gamesToday = gamesCount === undefined ? undefined : gamesCount + 4;
  const gamesLabel =
    gamesToday === undefined
      ? "… games played today"
      : `${gamesToday} ${gamesToday === 1 ? "game" : "games"} played today`;

  return (
    <div className="relative min-h-screen text-[#1a1d24]">
      <div
        aria-hidden="true"
        className="fixed inset-0 bg-[#f5f7f9] bg-[radial-gradient(rgba(31,59,92,0.09)_1.5px,transparent_1.5px)] [background-size:24px_24px] sm:[background-size:28px_28px]"
      />

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-8 sm:py-5">
        <Link href="/" className="flex items-center gap-2 sm:gap-2.5">
          <Image
            src="/barklelogo-tight.png"
            alt=""
            width={36}
            height={36}
            className="h-8 w-8 rounded-full object-cover sm:h-9 sm:w-9"
          />
          <span className="text-base font-semibold sm:text-[17px]">Barkle</span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-6">
          <SiteLinks isAdmin={!!isAdmin} className="hidden sm:flex" />

          {session?.user ? (
            <div className="flex items-center gap-1 sm:gap-2">
              <Button
                onClick={() => setShowLevelSystem(true)}
                variant="ghost"
                className="h-11 gap-1.5 rounded-[14px] px-3 text-sm font-semibold text-[#1f3b5c] hover:bg-white hover:text-[#1a1d24]"
              >
                <span aria-hidden="true">🎖️</span>
                My Level
              </Button>
              <Link
                href="/account"
                aria-label="Your account"
                className="flex h-11 items-center gap-2 rounded-[14px] border-2 border-[#dfe4ea] bg-white pl-1 pr-1 shadow-[0_3px_0_#dfe4ea] sm:pl-3"
              >
                <span className="hidden text-sm font-semibold sm:inline">
                  {userProfile?.username ?? "Loading..."}
                </span>
                <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-[#eef1f4]">
                  <DogAvatar size="sm" imageUrl={userProfile?.profileImageUrl} />
                </span>
              </Link>
            </div>
          ) : (
            <Button
              onClick={handleSignIn}
              className="h-11 rounded-[14px] border-2 border-[#dfe4ea] bg-white px-4 text-sm font-semibold text-[#1a1d24] shadow-[0_3px_0_#dfe4ea] hover:bg-[#f8fafb] active:translate-y-[3px] active:shadow-none"
            >
              Sign in with Google
            </Button>
          )}
        </div>
      </header>

      <main className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-10 px-5 pb-8 pt-2 sm:px-8 lg:grid-cols-2 lg:gap-16 lg:px-24 lg:pt-12">
        <div className="flex flex-col gap-4 lg:gap-6">
          <div className="flex items-end justify-between gap-4">
            <div className="flex flex-col gap-2 lg:gap-5">
              <p
                className="text-xs font-semibold tracking-[0.18em] text-[#1f3b5c] sm:text-[13px]"
                suppressHydrationWarning
              >
                {currentMonth} {currentYear}
              </p>
              <h1
                className={`${instrumentSerif.className} text-[76px] font-normal leading-[0.9] tracking-[-0.02em] lg:text-[120px]`}
              >
                Barkle<span className="italic text-[#2f7d32]">.</span>
              </h1>
            </div>
            <Image
              src="/barklelogo-tight.png"
              alt="Barkle logo"
              width={96}
              height={96}
              priority
              className="h-24 w-24 rounded-full border-4 border-white object-cover shadow-[0_10px_24px_-14px_rgba(31,59,92,0.5)] lg:hidden"
            />
          </div>

          <p className="max-w-[420px] text-base leading-relaxed text-[#4a5465] lg:text-[19px]">
            5 chances to guess different dog breeds from their photos. A new set
            of pups every day!
          </p>

          <div className="flex items-center justify-between rounded-[18px] border-2 border-[#e6eaef] bg-white px-4 py-3.5 lg:hidden">
            <span className="text-sm font-semibold">{gamesLabel}</span>
            <ChanceDots size="sm" />
          </div>

          {!session?.user && tempProfile?.username && (
            <p className="text-sm text-[#4a5465]">
              Playing as{" "}
              <span className="font-semibold text-[#2f7d32]">{tempProfile.username}</span>
            </p>
          )}

          <div className="mt-1 flex w-full max-w-[460px] flex-col gap-3 lg:mt-2">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <GameModeModal className="h-[60px] w-full rounded-2xl border-0 bg-[#2f7d32] text-lg font-bold tracking-[0.08em] text-white shadow-[0_4px_0_#1f5a22] transition-all hover:bg-[#2a7030] active:translate-y-1 active:shadow-none" />
              <Button
                onClick={() => setShowLeaderboard(true)}
                className="h-[60px] w-full rounded-2xl border-0 bg-[#1f3b5c] text-lg font-bold tracking-[0.08em] text-white shadow-[0_4px_0_#122539] transition-all hover:bg-[#1a3350] active:translate-y-1 active:shadow-none"
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
              className="h-[50px] w-full rounded-[14px] border-2 border-[#dfe4ea] bg-white text-[15px] font-semibold text-[#1a1d24] shadow-[0_3px_0_#dfe4ea] transition-all hover:bg-[#f8fafb] active:translate-y-[3px] active:shadow-none"
              variant="default"
            />
          </div>
        </div>

        <div className="hidden justify-center lg:flex">
          <div className="flex w-[420px] flex-col items-center gap-6 rounded-[32px] border-2 border-[#e6eaef] bg-white p-9 shadow-[0_30px_60px_-36px_rgba(31,59,92,0.35)]">
            <Image
              src="/barklelogo-tight.png"
              alt="Barkle logo"
              width={260}
              height={260}
              priority
              className="h-[260px] w-[260px] rounded-full object-cover"
            />
            <div className="h-0.5 w-full bg-[#eef1f4]" />
            <div className="flex w-full items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold tracking-[0.14em] text-[#5f6b7d]">TODAY</span>
                <span className="text-[15px] font-semibold">
                  <span className="text-[#2f7d32]">{gamesToday ?? "…"}</span>{" "}
                  {gamesToday === 1 ? "game" : "games"} played
                </span>
              </div>
              <ChanceDots size="md" />
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

      <footer className="relative z-10 flex justify-center px-2 pb-6 sm:hidden">
        <SiteLinks isAdmin={!!isAdmin} className="flex" />
      </footer>

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

const siteLinkClass =
  "flex h-11 items-center px-2 text-[13px] text-[#4a5465] transition-colors hover:text-[#1a1d24] sm:h-auto sm:px-0 sm:text-sm";

function SiteLinks({ isAdmin, className = "" }: { isAdmin: boolean; className?: string }) {
  return (
    <nav aria-label="Site" className={`items-center sm:gap-6 ${className}`}>
      {isAdmin && (
        <>
          <Link href="/admin" className={siteLinkClass}>
            Admin
          </Link>
          <Link href="/preview" className={siteLinkClass}>
            QR Code
          </Link>
        </>
      )}
      {[Terms, FAQSheet, FeedbackSheet].map((Component, i) => (
        <div
          key={i}
          className="[&>button]:!flex [&>button]:!h-11 [&>button]:!items-center [&>button]:!px-2 [&>button]:!text-[13px] [&>button]:!font-normal [&>button]:!text-[#4a5465] [&>button:hover]:!text-[#1a1d24] sm:[&>button]:!h-auto sm:[&>button]:!px-0 sm:[&>button]:!text-sm"
        >
          <Component />
        </div>
      ))}
      <div className="flex items-center sm:gap-1">
        <a
          href="https://www.instagram.com/barkledailyy"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Barkle on Instagram"
          className="flex h-11 w-11 items-center justify-center text-[#4a5465] transition-colors hover:text-[#1a1d24] sm:h-10 sm:w-10"
        >
          <Instagram className="h-[18px] w-[18px]" />
        </a>
        <a
          href="https://www.tiktok.com/@barkleapp"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Barkle on TikTok"
          className="flex h-11 w-11 items-center justify-center text-[#4a5465] transition-colors hover:text-[#1a1d24] sm:h-10 sm:w-10"
        >
          <TiktokIcon className="h-[18px] w-[18px]" />
        </a>
      </div>
    </nav>
  );
}

function ChanceDots({ size }: { size: "sm" | "md" }) {
  const dot = size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5";
  return (
    <div role="img" aria-label="5 chances" className={`flex ${size === "sm" ? "gap-[5px]" : "gap-1.5"}`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <span key={i} className={`${dot} rounded-full bg-[#1f3b5c]`} />
      ))}
    </div>
  );
}
