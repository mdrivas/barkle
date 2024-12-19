"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { useSignIn } from "~/hooks/useSignIn";
import { TrophyIcon } from "@heroicons/react/24/outline";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface FeatureAnnouncementModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function FeatureAnnouncementModal({ 
  open, 
  onOpenChange 
}: FeatureAnnouncementModalProps) {
  const [isLocalOpen, setIsLocalOpen] = useState(false);
  const { handleGoogleSignIn } = useSignIn();
  const { data: session } = useSession();
  
  const handleClose = () => {
    setIsLocalOpen(false);
    onOpenChange?.(false);
  };

  const isModalOpen = open ?? isLocalOpen;

  const handleSignIn = async () => {
    handleClose();
    await handleGoogleSignIn();
  };

  const handleCheckAchievements = () => {
    handleClose();
  };

  return (
    <Dialog 
      open={isModalOpen} 
      onOpenChange={(value) => {
        onOpenChange?.(value);
        if (!value) handleClose();
      }}
    >
      <DialogContent className="fixed left-1/2 top-1/2 w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 rounded-xl border-2 border-white/10 bg-zinc-950/95 text-zinc-50 shadow-[0_0_0_1px_rgba(255,255,255,0.05)] sm:w-full sm:max-w-[400px] [&>button]:hidden">
        <DialogHeader>
          <DialogTitle className="text-center">
            <h2 className="mb-4 text-3xl font-bold text-zinc-100">
              New Feature!
            </h2>
            <div className="flex items-center justify-center gap-2 text-2xl text-amber-500">
              <TrophyIcon className="h-6 w-6" />
              Achievements
              <TrophyIcon className="h-6 w-6" />
            </div>
          </DialogTitle>
          <DialogDescription className="text-center text-sm text-zinc-300 sm:text-base">
            Track your progress and earn special badges for your Barkle accomplishments!
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 flex flex-col gap-4">
          {/* Achievement Cards */}
          <div className="space-y-3">
            {/* Pawfect Streak Achievement */}
            <div className="relative overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/50">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-transparent" />
              <div className="relative flex items-start gap-3 p-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/10">
                  <span className="text-lg">⚡</span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-zinc-200">Pawfect Streak</span>
                    <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-500">
                      RARE
                    </span>
                  </div>
                  <span className="text-sm text-zinc-400">Get a 10-guess streak</span>
                </div>
              </div>
            </div>

            {/* Furry Regular Achievement */}
            <div className="relative overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/50">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent" />
              <div className="relative flex items-start gap-3 p-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10">
                  <span className="text-lg">⭐</span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-zinc-200">Furry Regular</span>
                    <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-500">
                      RARE
                    </span>
                  </div>
                  <span className="text-sm text-zinc-400">Play 4 days in a row</span>
                </div>
              </div>
            </div>

            {/* Social Sharer Achievement */}
            <div className="relative overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/50">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent" />
              <div className="relative flex items-start gap-3 p-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10">
                  <span className="text-lg">📢</span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-zinc-200">Top Dog Influencer</span>
                    <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-500">
                      COMMON
                    </span>
                  </div>
                  <span className="text-sm text-zinc-400">Share your account stats with friends</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            {session ? (
              <Link href="/account" className="w-full" onClick={handleCheckAchievements}>
                <Button
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  Check My Achievements
                </Button>
              </Link>
            ) : (
              <Button
                onClick={() => void handleSignIn()}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Sign in to Track Achievements
              </Button>
            )}
            <Button
              variant="ghost"
              onClick={handleClose}
              className="text-zinc-400 hover:text-zinc-300"
            >
              Maybe Later
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 