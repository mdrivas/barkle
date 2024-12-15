"use client";

import { useState, useEffect } from "react";
import { api } from "~/trpc/react";
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
import { useSession } from "next-auth/react";

export function FeedbackSheet() {
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [tempId, setTempId] = useState<string | null>(null);
  const { data: session } = useSession();
  const { toast } = useToast();
  const maxLength = 500;

  useEffect(() => {
    const storedTempId = localStorage.getItem("barkle_temp_id");
    setTempId(storedTempId);
  }, []);

  const { data: tempProfile } = api.profile.getProfile.useQuery(
    { tempId },
    {
      enabled: !!tempId && !session?.user,
    }
  );

  const submitFeedback = api.feedback.submit.useMutation({
    onSuccess: () => {
      toast({
        title: "Pawsome! 🐾",
        description: "Your feedback has been received. Thank you for helping us improve!",
        duration: 3000,
      });
      setFeedback("");
      setOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Uh oh! 🐾",
        description: error.message || "Something went wrong. Please try again later.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!feedback.trim() || submitFeedback.isPending) return;

    const identificationData = session?.user?.id
      ? { userId: session.user.id }
      : tempProfile && tempId
      ? { tempId }
      : {};

    console.log('Submitting feedback with:', { ...identificationData });

    submitFeedback.mutate({
      message: feedback,
      ...identificationData,
    });
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
              disabled={!feedback.trim() || submitFeedback.isPending}
              className="group relative overflow-hidden rounded-xl bg-[#4A6741] px-6 py-2 text-white hover:bg-[#3d5635]"
            >
              <span className="relative z-10">
                {submitFeedback.isPending ? "Submitting..." : "Submit Feedback"}
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100"></span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
