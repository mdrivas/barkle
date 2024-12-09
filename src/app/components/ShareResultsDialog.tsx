"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { cn } from "~/lib/utils";
import { Check, Share2, Home } from "lucide-react";

interface ShareResultsDialogProps {
  score: number;
  questionResults: boolean[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: "daily" | "pawsistence";
}

export function ShareResultsDialog({ 
  score, 
  questionResults = Array(5).fill(false),
  isOpen,
  onOpenChange,
  mode
}: ShareResultsDialogProps) {
  const [copied, setCopied] = useState(false);

  const safeResults = questionResults ?? Array(5).fill(false);
  const correctCount = safeResults.filter(r => r).length;

  const getDogAscii = (score: number) => {
    if (score >= 4) {
      return `  ∩＿∩
( ˆωˆ )
/    ♥ﾉ
(    )
｜｜Ｊ`;
    } else if (score >= 3) {
      return `  ∩＿∩
( ´•ω•)
/    ⊂ﾉ
(    )
｜｜Ｊ`;
    } else {
      return `  ∩＿∩
( ´•︵•)
/    ⊂ﾉ
(    )
｜｜Ｊ`;
    }
  };

  const getShareText = () => {
    if (mode === "pawsistence") {
      return `Pawsistence is Key! 🔑
My Highest Streak: ${score} ${Array(score).fill('🐶').join('')}

Can you beat my streak? https://barkle.vercel.app/pawsistence`;
    }

    // Original daily mode text
    const date = new Date();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = days[date.getDay()];
    const month = months[date.getMonth()];
    const dateNum = date.getDate().toString().padStart(2, '0');
    const dateString = `${day} ${month} ${dateNum} ${date.getFullYear()}`;
    
    const attemptsText = safeResults.map(r => r ? '🟩' : '⬜').join('');
    const dogArt = getDogAscii(score);
    
    return `Barkle (${dateString})\n\n${attemptsText}\n${score}/5 correct\n\n${dogArt}\n\nFetch your own pups at https://barkle.vercel.app`;
  };

  const handleShare = async () => {
    const text = getShareText();
    
    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] sm:w-full sm:max-w-[400px] bg-zinc-900/95 text-zinc-50 border border-zinc-800 rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Share Your Score! {mode === "pawsistence" ? "🔥" : "🎯"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 px-4 sm:px-6">
          {mode === "pawsistence" ? (
            <div className="text-center py-4">
              <div className="text-3xl font-bold mb-2">
                {score} 🐶
              </div>
              <div className="text-zinc-400 text-sm">
                Highest Streak
              </div>
            </div>
          ) : (
            <>
              <div className="flex justify-center gap-2">
                {safeResults.map((result, i) => (
                  <div
                    key={i}
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300",
                      result 
                        ? "bg-gradient-to-b from-[#58A84D] to-[#4A9341] shadow-lg shadow-[#58A84D]/20"
                        : "bg-zinc-800"
                    )}
                  >
                    <span className="text-[10px] text-white/90">
                      🐾
                    </span>
                  </div>
                ))}
              </div>
              <pre className="font-mono text-sm text-center text-zinc-300 whitespace-pre">
                {getDogAscii(score)}
              </pre>
            </>
          )}

          <div className="flex flex-col gap-2 pt-2 border-t border-zinc-800">
            <Button
              className="w-full bg-emerald-600 hover:bg-emerald-700"
              onClick={handleShare}
            >
              {copied ? (
                <span className="flex items-center gap-2">
                  <Check className="w-4 h-4" /> Copied!
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Share2 className="w-4 h-4" /> Share
                </span>
              )}
            </Button>
            <Button
              variant="outline"
              className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border-none"
              onClick={() => window.location.href = '/'}
            >
              <span className="flex items-center gap-2">
                <Home className="w-4 h-4" /> Return Home
              </span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 