"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { api } from "~/trpc/react";
import { useToast } from "~/hooks/use-toast";

export function NewUserDialog({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [username, setUsername] = useState("");
  const { toast } = useToast();
  const utils = api.useUtils();

  const setUsernameMutation = api.profile.setUsername.useMutation({
    onSuccess: async () => {
      toast({
        title: "Welcome to Barkle! 🐾",
        description: "Your username has been set. Time to start playing!",
      });
      await utils.profile.getProfile.refetch();
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.length < 3) {
      toast({
        title: "Username too short",
        description: "Please use at least 3 characters",
        variant: "destructive",
      });
      return;
    }
    setUsernameMutation.mutate({ username });
  };

  // Prevent closing if it's the first time
  const handleOpenChange = (open: boolean) => {
    if (open) return; // Don't do anything when opening
    if (!username) return; // Don't allow closing if no username set
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="fixed left-1/2 top-1/2 w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-zinc-800 bg-zinc-900/95 text-zinc-50 sm:w-full sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            Welcome to Barkle! 🐕
          </DialogTitle>
          <DialogDescription className="text-center text-zinc-400">
            Choose a username to start your Barkle journey
          </DialogDescription>
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
              autoFocus
            />
            <p className="text-xs text-zinc-400">
              Letters, numbers, underscores, and hyphens only
            </p>
          </div>

          <Button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700"
            disabled={setUsernameMutation.isPending}
          >
            {setUsernameMutation.isPending ? "Setting..." : "Start Playing!"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
