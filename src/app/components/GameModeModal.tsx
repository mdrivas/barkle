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
          className="w-full py-7 text-xl font-bold bg-[#58A84D] hover:bg-[#4A9341] text-white rounded-2xl shadow-lg transform transition-all active:scale-95 border border-green-600/20"
        >
          PLAY
        </Button>
      </DialogTrigger>
      <DialogContent className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] sm:w-full sm:max-w-[425px] bg-zinc-950/95 text-zinc-50 border border-zinc-800 rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Choose Game Mode
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 px-4 sm:px-6">
          <Link href="/daily" className="block">
            <div className="relative p-6 rounded-xl bg-zinc-900/50 border border-zinc-800 group hover:bg-zinc-800/50 transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-emerald-400 font-bold text-lg group-hover:text-emerald-300">Today&apos;s Barkle</span>
                <span className="text-2xl ml-2 flex-shrink-0">🐕</span>
              </div>
              <p className="text-zinc-400 text-sm group-hover:text-zinc-300">
                5 chances to guess today&apos;s dog breeds
              </p>
              <div className="absolute top-0 right-0 h-full w-1 bg-gradient-to-b from-emerald-500/0 via-emerald-500/50 to-emerald-500/0 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
          
          {/* Pawsistence Mode */}
          <Link href="/pawsistence" className="block">
            <div className="relative p-6 rounded-xl bg-zinc-900/50 border border-zinc-800 group hover:bg-zinc-800/50 transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-orange-400 font-bold text-lg group-hover:text-orange-300 truncate mr-2">Pawsistence</span>
                <span className="text-2xl flex-shrink-0">🎯</span>
              </div>
              <p className="text-zinc-400 text-sm group-hover:text-zinc-300">
                Keep playing until you miss! How far can you go?
              </p>
              <div className="absolute top-0 right-0 h-full w-1 bg-gradient-to-b from-orange-500/0 via-orange-500/50 to-orange-500/0 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
} 