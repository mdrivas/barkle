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
import { ChevronRight } from "lucide-react";
import { BoneIcon, DogFaceIcon, PawBubbleIcon, PawPairIcon } from "./GameModeIcons";
import { instrumentSerif } from "~/lib/fonts";

const defaultTriggerClass =
  "w-full transform rounded-2xl border border-green-600/20 bg-[#58A84D] py-7 text-xl font-bold text-white shadow-lg transition-all hover:bg-[#4A9341] active:scale-95";

interface GameMode {
  href: string;
  title: string;
  description: string;
  Icon: React.ComponentType<{ className?: string }>;
  /** Icon tile color (from the logo palette), and the NEW badge's text + tint. */
  color: string;
  badgeText: string;
  tint: string;
  isNew?: boolean;
}

const gameModes: GameMode[] = [
  {
    href: "/daily",
    title: "Today's Barkle",
    description: "5 chances to guess today's dog breeds",
    Icon: DogFaceIcon,
    color: "#557a5c",
    badgeText: "#3f5f45",
    tint: "#e7efe8",
  },
  {
    href: "/pawsts",
    title: "Pup Posts",
    description: "Share your dog stories, photos, and get advice from our community",
    Icon: PawBubbleIcon,
    color: "#9a7650",
    badgeText: "#6f5133",
    tint: "#f3ece3",
    isNew: true,
  },
  {
    href: "/pawsistence",
    title: "Pawsistence",
    description: "Keep playing until you miss! How far can you go?",
    Icon: BoneIcon,
    color: "#26443d",
    badgeText: "#26443d",
    tint: "#e3ebe8",
  },
  {
    href: "/pawpulation",
    title: "Pawpulation",
    description: "Higher or lower? Test your knowledge of global breed populations!",
    Icon: PawPairIcon,
    color: "#1f3b5c",
    badgeText: "#1f3b5c",
    tint: "#e6edf5",
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
          {gameModes.map(({ href, title, description, Icon, color, badgeText, tint, isNew }) => (
            <li key={href}>
              <Link
                href={href}
                onClick={() => setOpen(false)}
                className="group flex items-center gap-4 rounded-[18px] border-2 border-[#dfe4ea] bg-white p-4 shadow-[0_3px_0_#dfe4ea] transition-all hover:border-[#c9d1da] hover:shadow-[0_3px_0_#c9d1da] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f3b5c] focus-visible:ring-offset-2 active:translate-y-[3px] active:shadow-none"
              >
                <span
                  className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-[14px] text-[#f6efdf] shadow-[inset_0_-3px_0_rgba(0,0,0,0.18)]"
                  style={{ backgroundColor: color }}
                >
                  <Icon className="h-9 w-9" />
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="flex items-center gap-2">
                    <span className="text-base font-semibold">{title}</span>
                    {isNew && (
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider"
                        style={{ backgroundColor: tint, color: badgeText }}
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
