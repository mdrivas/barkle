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
import { api } from "~/trpc/react";
import { useToast } from "~/hooks/use-toast";

interface UsernameDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: () => Promise<void>;
}

export function UsernameDialog({ isOpen, onClose, onSubmit }: UsernameDialogProps) {
  const [username, setUsername] = useState("");
  const { toast } = useToast();
  const setUsernameMutation = api.user.setUsername.useMutation({
    onSuccess: async () => {
      toast({
        title: "Username set!",
        description: "Welcome to Barkle! 🐾",
      });
      onClose();
      await onSubmit?.();
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] sm:w-full sm:max-w-[400px] bg-zinc-900/95 text-zinc-50 border border-zinc-800 rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Choose Your Username 🐕
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 px-4 sm:px-6">
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              className="bg-zinc-800 border-zinc-700 text-zinc-100"
              maxLength={30}
              pattern="[a-zA-Z0-9_-]+"
              title="Letters, numbers, underscores, and hyphens only"
            />
            <p className="text-xs text-zinc-400">
              Letters, numbers, underscores, and hyphens only
            </p>
          </div>

          <Button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700"
            disabled={setUsernameMutation.isLoading}
          >
            {setUsernameMutation.isLoading ? "Setting..." : "Set Username"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
} 