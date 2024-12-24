"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import Image from "next/image";
import { cn } from "~/lib/utils";

interface AvatarSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAvatar: number;
  onSelect: (avatarNumber: number) => void;
}

export function AvatarSelector({ isOpen, onClose, selectedAvatar, onSelect }: AvatarSelectorProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 text-zinc-50 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">Choose Your Pup</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-6 p-6">
          {[1, 2, 3, 4, 5, 6].map((number) => (
            <button
              key={number}
              onClick={() => onSelect(number)}
              className={cn(
                "relative aspect-square overflow-hidden rounded-2xl transition-all duration-200",
                "hover:ring-4 hover:ring-emerald-500/50 hover:scale-105",
                "bg-zinc-800/50 backdrop-blur-sm",
                selectedAvatar === number && "ring-4 ring-emerald-500 scale-105"
              )}
            >
              <Image
                src={`/avatars/dogav${number}.png`}
                alt={`Dog avatar ${number}`}
                fill
                className="object-cover p-4"
              />
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
} 