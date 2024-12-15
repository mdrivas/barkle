"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { useToast } from "~/hooks/use-toast";

interface UsernameDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (username: string) => Promise<void>;
}

export function UsernameDialog({
  isOpen,
  onClose,
  onSubmit,
}: UsernameDialogProps) {
  const [username, setUsername] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username.length < 3) {
      toast({
        title: "Username too short",
        description: "Please use at least 3 characters",
        variant: "destructive",
      });
      return;
    }

    try {
      await onSubmit?.(username);
      toast({
        title: "Username set!",
        description: "Welcome to Barkle! 🐾",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to set username",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {
      // Intentionally empty to prevent dialog from closing
    }} modal={true}>
      <DialogContent 
        className="fixed left-1/2 top-1/2 w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-zinc-800 bg-zinc-900/95 text-zinc-50 sm:w-full sm:max-w-[400px] [&>button]:hidden"
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold">
            What should we call you?
            <span className="ml-1 inline-block">🐕</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 px-4 sm:px-6">
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              className="border-zinc-700 bg-zinc-800 text-zinc-100"
              maxLength={30}
              pattern="[a-zA-Z0-9_-]+"
              title="Letters, numbers, underscores, and hyphens only"
              required
              autoFocus
            />
            <p className="text-xs text-zinc-400">
              Letters, numbers, underscores, and hyphens only
            </p>
          </div>

          <Button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700"
          >
            Set Username
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
