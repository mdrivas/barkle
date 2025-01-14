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
        <Button className="w-full transform rounded-2xl border border-green-600/20 bg-[#58A84D] py-7 text-xl font-bold text-white shadow-lg transition-all hover:bg-[#4A9341] active:scale-95">
          PLAY
        </Button>
      </DialogTrigger>
      <DialogContent className="fixed left-1/2 top-1/2 w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-zinc-800 bg-zinc-950/95 text-zinc-50 sm:w-full sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            Choose Game Mode
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 px-4 sm:px-6">
          <Link href="/daily" className="block">
            <div className="group relative rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 transition-all hover:bg-zinc-800/50">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-lg font-bold text-emerald-400 group-hover:text-emerald-300">
                  Today&apos;s Barkle
                </span>
                <span className="ml-2 flex-shrink-0 text-2xl">🐕</span>
              </div>
              <p className="text-sm text-zinc-400 group-hover:text-zinc-300">
                5 chances to guess today&apos;s dog breeds
              </p>
              <div className="absolute right-0 top-0 h-full w-1 bg-gradient-to-b from-emerald-500/0 via-emerald-500/50 to-emerald-500/0 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Pawsistence Mode */}
          <Link href="/pawsistence" className="block">
            <div className="group relative rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 transition-all hover:bg-zinc-800/50">
              <div className="mb-3 flex items-center justify-between">
                <span className="mr-2 truncate text-lg font-bold text-orange-400 group-hover:text-orange-300">
                  Pawsistence
                </span>
                <span className="flex-shrink-0 text-2xl">🎯</span>
              </div>
              <p className="text-sm text-zinc-400 group-hover:text-zinc-300">
                Keep playing until you miss! How far can you go?
              </p>
              <div className="absolute right-0 top-0 h-full w-1 bg-gradient-to-b from-orange-500/0 via-orange-500/50 to-orange-500/0 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Pawpulation Mode */}
          <Link href="/pawpulation" className="block">
            <div className="group relative rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 transition-all hover:bg-zinc-800/50">
              <div className="relative mb-3 flex items-center justify-between">
                <span className="mr-2 truncate text-lg font-bold text-purple-400 group-hover:text-purple-300">
                  Pawpulation
                </span>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-purple-300 border border-purple-500/20">
                    NEW
                  </span>
                  <span className="flex-shrink-0 text-2xl">🎲</span>
                </div>
              </div>
              <p className="text-sm text-zinc-400 group-hover:text-zinc-300">
                Higher or lower? Test your knowledge of global breed populations!
              </p>
              <div className="absolute right-0 top-0 h-full w-1 bg-gradient-to-b from-purple-500/0 via-purple-500/50 to-purple-500/0 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Breed Origins Mode */}
          <Link href="/origins" className="block">
            <div className="group relative rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 transition-all hover:bg-zinc-800/50">
              <div className="mb-3 flex items-center justify-between">
                <span className="mr-2 truncate text-lg font-bold text-indigo-400 group-hover:text-indigo-300">
                  Global Tails
                </span>
                <span className="flex-shrink-0 text-2xl">🌍</span>
              </div>
              <p className="text-sm text-zinc-400 group-hover:text-zinc-300">
                Match breeds to their countries of origin on a world map
              </p>
            </div>
          </Link>

       
          

          {/* Breed Characteristics */}
          <Link href="/traits" className="block">
            <div className="group relative rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 transition-all hover:bg-zinc-800/50">
              <div className="mb-3 flex items-center justify-between">
                <span className="mr-2 truncate text-lg font-bold text-amber-400 group-hover:text-amber-300">
                  Trait Detective
                </span>
                <span className="flex-shrink-0 text-2xl">🔍</span>
              </div>
              <p className="text-sm text-zinc-400 group-hover:text-zinc-300">
                Match breeds based on their characteristics and traits
              </p>
            </div>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}
