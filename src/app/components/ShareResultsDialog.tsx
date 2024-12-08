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
  questionResults?: boolean[];
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ShareResultsDialog({ 
  score, 
  questionResults = Array(5).fill(false),
  isOpen,
  onOpenChange 
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
      <DialogTrigger asChild>
        <Button 
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-zinc-100 transition-all duration-200 py-6 text-lg font-medium rounded-xl flex items-center justify-center gap-2"
        >
          Share Results
          <Share2 className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] sm:w-full sm:max-w-[400px] bg-zinc-900/95 text-zinc-50 border border-zinc-800 rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Share Your Score! 🎯
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 px-4 sm:px-6">
          <div className="flex justify-center gap-2">
            {safeResults.map((result, i) => (
              <div
                key={i}
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center text-lg",
                  result ? "bg-green-500" : "bg-zinc-700"
                )}
              >
                {result ? "🐕" : "😢"}
              </div>
            ))}
          </div>

          <pre className="font-mono text-sm text-center text-zinc-300 whitespace-pre">
            {getDogAscii(score)}
          </pre>

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