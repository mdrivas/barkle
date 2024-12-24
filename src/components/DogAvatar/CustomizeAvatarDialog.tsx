"use client";

import { Dialog, DialogContent } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Dog, Crown, Pencil } from "lucide-react";

interface CustomizeAvatarDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAvatar: () => void;
  onSelectAccessory: () => void;
}

export function CustomizeAvatarDialog({
  isOpen,
  onClose,
  onSelectAvatar,
  onSelectAccessory,
}: CustomizeAvatarDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm bg-zinc-900 p-6 text-zinc-50">
        <h2 className="mb-4 text-xl font-bold">Customize Your Avatar</h2>
        <div className="flex flex-col gap-3">
          <Button
            onClick={() => {
              onClose();
              onSelectAvatar();
            }}
            variant="outline"
            className="flex w-full items-center justify-start gap-3 border-zinc-700 bg-zinc-800/50 py-6 text-left text-lg hover:bg-zinc-800"
          >
            <Dog className="h-5 w-5" />
            Change Avatar
          </Button>
          <Button
            disabled
            variant="outline"
            className="flex w-full items-center justify-between gap-3 border-zinc-700 bg-zinc-800/50 py-6 text-left text-lg opacity-50"
          >
            <div className="flex items-center gap-3">
              <Crown className="h-5 w-5" />
              Change Accessories
            </div>
            <span className="text-sm text-zinc-400">Coming Soon!</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 