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
      <DialogContent className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] sm:w-full sm:max-w-[400px] bg-zinc-950/95 text-zinc-50 border border-zinc-800 rounded-xl">
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
                <span className="text-2xl">🐕</span>
              </div>
              <p className="text-zinc-400 text-sm group-hover:text-zinc-300">
                5 chances to guess today&apos;s dog breeds
              </p>
              <div className="absolute top-0 right-0 h-full w-1 bg-gradient-to-b from-emerald-500/0 via-emerald-500/50 to-emerald-500/0 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
          
          {/* Coming Soon Mode */}
          <div className="relative p-6 rounded-xl bg-zinc-900/20 border border-zinc-800/50">
            <div className="flex items-center justify-between mb-3">
              <span className="text-zinc-500 font-bold text-lg">Pawsistence</span>
              <span className="text-2xl">🎯</span>
            </div>
            <p className="text-zinc-600 text-sm">
              Keep playing until you miss! Coming soon...
            </p>
            <div className="absolute top-3 right-3">
              <span className="text-xs font-medium text-zinc-500 bg-zinc-800/50 px-2.5 py-1 rounded-full">
                Coming Soon
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 