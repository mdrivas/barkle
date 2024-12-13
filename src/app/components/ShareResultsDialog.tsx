"use client";

import { useState, useRef } from "react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { cn } from "~/lib/utils";
import { Check, Share2, Home, Instagram } from "lucide-react";
import domtoimage from 'dom-to-image-more';
import { ShareableCard } from "./ShareableCard";
import { useToast } from "~/hooks/use-toast";

interface ShareResultsDialogProps {
  score: number;
  questionResults: boolean[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: "daily" | "pawsistence";
}

interface UploadResponse {
  imageUrl?: string;
  error?: string;
  details?: string;
}

export function ShareResultsDialog({
  score,
  questionResults = Array(5).fill(false) as boolean[],
  isOpen,
  onOpenChange,
  mode,
}: ShareResultsDialogProps) {
  const [copied, setCopied] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const shareableCardRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const safeResults = questionResults ?? Array(5).fill(false);

  const isMobile = /iPhone|iPad|iPod|Android/i.test(
    typeof window !== 'undefined' ? window.navigator.userAgent : ''
  );
  
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
My Highest Streak: ${score} ${Array(score).fill("🐶").join("")}

Can you beat my streak? https://barkle.vercel.app/pawsistence`;
    }

    // Original daily mode text
    const date = new Date();
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const day = days[date.getDay()];
    const month = months[date.getMonth()];
    const dateNum = date.getDate().toString().padStart(2, "0");
    const dateString = `${day} ${month} ${dateNum} ${date.getFullYear()}`;

    const attemptsText = safeResults.map((r) => (r ? "🟩" : "⬜")).join("");
    const dogArt = getDogAscii(score);

    return `Barkle (${dateString})\n\n${attemptsText}\n${score}/5 correct\n\n${dogArt}\n\nFetch your own pups at https://barkle.vercel.app`;
  };

  const handleShare = async () => {
    const text = getShareText();

    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleInstagramShare = async () => {
    if (!shareableCardRef.current) return;
    
    setIsGeneratingImage(true);
    try {
      const dataUrl = await domtoimage.toPng(shareableCardRef.current, {
        width: 500,
        height: 500,
        bgcolor: '#18181B'
      });

      const blobResponse = await fetch(dataUrl);
      const blob = await blobResponse.blob();
      
      const formData = new FormData();
      formData.append('file', blob, 'share.png');

      const response = await fetch('/api/share/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json() as UploadResponse;
      if (!response.ok) throw new Error(data.error || "Upload failed");
      
      if (!data.imageUrl) throw new Error("No image URL received");
      window.location.href = `instagram://story-camera?media=${encodeURIComponent(data.imageUrl)}`;
      
    } catch (error) {
      console.error("Error:", error);
      toast({
        variant: "destructive",
        description: error instanceof Error ? error.message : "Share failed",
      });
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="fixed left-1/2 top-1/2 w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-zinc-800 bg-zinc-900/95 text-zinc-50 sm:w-full sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            Share Your Score! {mode === "pawsistence" ? "🔥" : ""}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 px-4 sm:px-6">
          {mode === "pawsistence" ? (
            <div className="py-4 text-center">
              <div className="mb-2 text-3xl font-bold">{score} 🐶</div>
              <div className="text-sm text-zinc-400">Highest Streak</div>
            </div>
          ) : (
            <>
              <div className="flex justify-center gap-2">
                {safeResults.map((result, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300",
                      result
                        ? "bg-gradient-to-b from-[#58A84D] to-[#4A9341] shadow-lg shadow-[#58A84D]/20"
                        : "bg-zinc-800",
                    )}
                  >
                    <span className="text-[10px] text-white/90">🐾</span>
                  </div>
                ))}
              </div>
              <pre className="whitespace-pre text-center font-mono text-sm text-zinc-300">
                {getDogAscii(score)}
              </pre>
            </>
          )}

          <div className="flex flex-col gap-2 border-t border-zinc-800 pt-2">
            <Button
              className="w-full bg-emerald-600 hover:bg-emerald-700"
              onClick={handleShare}
            >
              {copied ? (
                <span className="flex items-center gap-2">
                  <Check className="h-4 w-4" /> Copied!
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Share2 className="h-4 w-4" /> Share
                </span>
              )}
            </Button>
            <Button
              variant="outline"
              className="w-full border-none bg-zinc-800 text-zinc-100 hover:bg-zinc-700"
              onClick={() => (window.location.href = "/")}
            >
              <span className="flex items-center gap-2">
                <Home className="h-4 w-4" /> Return Home
              </span>
            </Button>
            {isMobile && (
              <Button
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                onClick={handleInstagramShare}
                disabled={isGeneratingImage}
              >
                <span className="flex items-center gap-2">
                  <Instagram className="h-4 w-4" />
                  {isGeneratingImage ? "Generating..." : "Share to Instagram"}
                </span>
              </Button>
            )}
          </div>

          <div className="hidden">
            <div ref={shareableCardRef}>
              <ShareableCard
                score={score}
                questionResults={questionResults}
                mode={mode}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
