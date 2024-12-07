"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import Link from "next/link";

export function GameModeModal() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          className="w-full py-7 text-xl font-bold bg-gradient-to-br from-[#4A6741] to-[#3d5635] hover:from-[#3d5635] hover:to-[#2f422a] text-white rounded-2xl shadow-lg transform transition-all active:scale-95 border border-green-800/20"
        >
          PLAY
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#1a1a1b] border-zinc-800/50 sm:max-w-[400px] rounded-2xl shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-zinc-50 text-center pb-2">
            Choose Your Mode
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3 mt-2">
          <Link href="/daily" onClick={() => setOpen(false)}>
            <div className="group relative overflow-hidden bg-gradient-to-br from-green-900/20 to-green-900/10 hover:from-green-900/30 hover:to-green-900/20 rounded-xl p-5 border border-green-900/20 cursor-pointer transition-all duration-300 shadow-lg hover:shadow-green-900/20 hover:-translate-y-0.5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-green-400 font-bold text-lg group-hover:text-green-300">Today&apos;s Barkle</span>
                <span className="text-2xl">🐕</span>
              </div>
              <p className="text-zinc-400 text-sm group-hover:text-zinc-300">
                5 chances to guess today&apos;s dog breeds
              </p>
              <div className="absolute top-0 right-0 h-full w-1 bg-gradient-to-b from-green-500/0 via-green-500/50 to-green-500/0 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <div className="relative">
            <div className="bg-gradient-to-br from-green-900/20 to-green-900/10 rounded-xl p-5 border border-green-900/20 opacity-50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-green-400 font-bold text-lg">Pawsistence Mode</span>
                <span className="text-2xl">🔥</span>
              </div>
              <p className="text-zinc-400 text-sm">
                How many breeds can you guess in a row? 3 Plays per day
              </p>
            </div>
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[1px] rounded-xl">
              <span className="text-white font-bold px-4 py-1.5 bg-green-500/20 rounded-full border border-green-500/30">Coming Soon!</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 