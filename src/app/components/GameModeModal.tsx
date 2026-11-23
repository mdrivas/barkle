"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import {
  ArrowUpDown,
  CalendarDays,
  ChevronRight,
  MessagesSquare,
  Target,
  type LucideIcon,
} from "lucide-react";
import { instrumentSerif } from "~/lib/fonts";

const defaultTriggerClass =
  "w-full transform rounded-2xl border border-green-600/20 bg-[#58A84D] py-7 text-xl font-bold text-white shadow-lg transition-all hover:bg-[#4A9341] active:scale-95";

interface GameMode {
  href: string;
  title: string;
  description: string;
  Icon: LucideIcon;
  /** Icon/badge color and its light tint (Fresh Snow palette). */
  color: string;
  tint: string;
  isNew?: boolean;
}

const gameModes: GameMode[] = [
  {
    href: "/daily",
    title: "Today's Barkle",
    description: "5 chances to guess today's dog breeds",
    Icon: CalendarDays,
    color: "#2f7d32",
    tint: "#e8f3e8",
  },
  {
    href: "/pawsts",
    title: "Pup Posts",
    description: "Share your dog stories, photos, and get advice from our community",
    Icon: MessagesSquare,
    color: "#1f3b5c",
    tint: "#e6edf5",
    isNew: true,
  },
  {
    href: "/pawsistence",
    title: "Pawsistence",
    description: "Keep playing until you miss! How far can you go?",
    Icon: Target,
    color: "#b45309",
    tint: "#fdf0e1",
  },
  {
    href: "/pawpulation",
    title: "Pawpulation",
    description: "Higher or lower? Test your knowledge of global breed populations!",
    Icon: ArrowUpDown,
    color: "#5b52e0",
    tint: "#eeedff",
    isNew: true,
  },
];

export function GameModeModal({ className = defaultTriggerClass }: { className?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={className}>PLAY</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] w-[calc(100%-2rem)] gap-5 overflow-y-auto rounded-[28px] border-2 border-[#e6eaef] bg-[#f5f7f9] p-5 text-[#1a1d24] shadow-[0_30px_60px_-30px_rgba(31,59,92,0.45)] sm:max-w-[460px] sm:rounded-[28px] sm:p-7">
        <DialogHeader className="space-y-1 text-left">
          <DialogTitle
            className={`${instrumentSerif.className} text-[40px] font-normal leading-none tracking-[-0.01em]`}
          >
            Choose Game Mode
          </DialogTitle>
          <DialogDescription className="text-sm text-[#4a5465]">
            Pick how you want to play today.
          </DialogDescription>
        </DialogHeader>

        <ul className="flex flex-col gap-3">
          {gameModes.map(({ href, title, description, Icon, color, tint, isNew }) => (
            <li key={href}>
              <Link
                href={href}
                onClick={() => setOpen(false)}
                className="group flex items-center gap-4 rounded-[18px] border-2 border-[#dfe4ea] bg-white p-4 shadow-[0_3px_0_#dfe4ea] transition-all hover:border-[#c9d1da] hover:shadow-[0_3px_0_#c9d1da] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f3b5c] focus-visible:ring-offset-2 active:translate-y-[3px] active:shadow-none"
              >
                <span
                  className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-[14px]"
                  style={{ backgroundColor: tint, color }}
                >
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="flex items-center gap-2">
                    <span className="text-base font-semibold">{title}</span>
                    {isNew && (
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider"
                        style={{ backgroundColor: tint, color }}
                      >
                        NEW
                      </span>
                    )}
                  </span>
                  <span className="text-sm leading-snug text-[#4a5465]">{description}</span>
                </span>
                <ChevronRight
                  className="h-5 w-5 flex-shrink-0 text-[#5f6b7d] transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
