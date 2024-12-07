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
      description: "Your feedback has been received. Thank you for helping us improve!",
      duration: 3000,
    });
    
    setFeedback("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="text-green-500 hover:text-green-400 transition-colors">
        Feedback
      </DialogTrigger>
      <DialogContent className="bg-gradient-to-br from-zinc-900 to-zinc-950 border-zinc-800 sm:max-w-[500px] shadow-xl shadow-emerald-900/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-zinc-50 flex items-center gap-2">
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
              className="min-h-[200px] bg-zinc-800/50 backdrop-blur-sm border-zinc-700 text-zinc-100 placeholder:text-zinc-500 rounded-xl focus:ring-2 focus:ring-green-500/20 transition-all"
              maxLength={maxLength}
            />
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#4A6741] rounded-full flex items-center justify-center transform rotate-45">
              <span className="text-xs">🐾</span>
            </div>
          </div>
          
          <div className="flex justify-between items-center pt-4">
            <span className="text-sm text-zinc-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              {feedback.length}/{maxLength}
            </span>
            <Button 
              onClick={handleSubmit}
              disabled={!feedback.trim()}
              className="bg-[#4A6741] hover:bg-[#3d5635] text-white px-6 py-2 rounded-xl relative overflow-hidden group"
            >
              <span className="relative z-10">Submit Feedback</span>
              <span className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></span>
              
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 