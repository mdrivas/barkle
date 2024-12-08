"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

interface DailyInstructionsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DailyInstructions({ isOpen, onClose }: DailyInstructionsProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-zinc-900 text-zinc-50">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center mb-4">
            How To Play
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Objective Section */}
          <div>
            <h3 className="text-lg font-semibold text-green-400 mb-2">
              🎯 Objective
            </h3>
            <p className="text-zinc-300">
              Identify the dog breed shown in the image.
            </p>
          </div>

          {/* How to Play Section */}
          <div>
            <h3 className="text-lg font-semibold text-blue-400 mb-2">
              🎮 How to Play
            </h3>
            <ul className="list-disc list-inside space-y-1 text-zinc-300">
              <li>Look at the dog image</li>
              <li>Select from one of four breed options</li>
              <li>Try to get as many correct as you can</li>
            </ul>
          </div>

          {/* Hints Section */}
          <div>
            <h3 className="text-lg font-semibold text-yellow-400 mb-2">
              💡 Scoring
            </h3>
            <ul className="list-disc list-inside space-y-1 text-zinc-300">
              <li>Get 1 point for each correct guess</li>
              <li>Try to get all 5 points!</li>
              <li>Come back tomorrow for a new challenge</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 