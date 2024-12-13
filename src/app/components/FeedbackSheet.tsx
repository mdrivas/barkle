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
import { Textarea } from "~/components/ui/textarea";
import { useToast } from "~/hooks/use-toast";

export function FeedbackSheet() {
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const { toast } = useToast();
  const maxLength = 500;

  const handleSubmit = async () => {
    if (!feedback.trim()) return;

    toast({
      title: "Pawsome! 🐾",
      description:
        "Your feedback has been received. Thank you for helping us improve!",
      duration: 3000,
    });

    setFeedback("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="text-green-500 transition-colors hover:text-green-400">
        Feedback
      </DialogTrigger>
      <DialogContent className="border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 shadow-xl shadow-emerald-900/20 sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-bold text-zinc-50">
            <span className="text-3xl">🐾</span>
            Send us Feedback
          </DialogTitle>
        </DialogHeader>

        <div className="mt-6 space-y-4">
          <div className="relative">
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Tell us what you think about Barkle..."
              className="min-h-[200px] rounded-xl border-zinc-700 bg-zinc-800/50 text-zinc-100 backdrop-blur-sm transition-all placeholder:text-zinc-500 focus:ring-2 focus:ring-green-500/20"
              maxLength={maxLength}
            />
            <div className="absolute -bottom-2 -right-2 flex h-8 w-8 rotate-45 transform items-center justify-center rounded-full bg-[#4A6741]">
              <span className="text-xs">🐾</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4">
            <span className="flex items-center gap-2 text-sm text-zinc-400">
              <span className="h-2 w-2 animate-pulse rounded-full bg-green-500"></span>
              {feedback.length}/{maxLength}
            </span>
            <Button
              onClick={handleSubmit}
              disabled={!feedback.trim()}
              className="group relative overflow-hidden rounded-xl bg-[#4A6741] px-6 py-2 text-white hover:bg-[#3d5635]"
            >
              <span className="relative z-10">Submit Feedback</span>
              <span className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100"></span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
