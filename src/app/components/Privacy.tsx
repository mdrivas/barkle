"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "~/components/ui/sheet";
import { X } from "lucide-react";

export function Privacy() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="text-xs text-green-500 transition-colors hover:text-green-400">
        Privacy
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="h-[90vh] overflow-hidden border-zinc-800 bg-zinc-900"
      >
        <SheetClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none data-[state=open]:bg-secondary">
          <X className="h-4 w-4 text-white" />
          <span className="sr-only">Close</span>
        </SheetClose>

        <SheetHeader>
          <SheetTitle className="pt-1 text-lg font-bold text-zinc-50">
            Privacy Policy
          </SheetTitle>
        </SheetHeader>

        <div className="mt-4 max-h-[calc(90vh-80px)] overflow-y-auto pr-6 text-xs">
          <section className="space-y-4">
            {/* Introduction */}
            <div className="space-y-1.5">
              <h2 className="text-base font-semibold text-green-500">
                1. Introduction
              </h2>
              <p className="text-zinc-300">
                Welcome to Barkle ("we," "our," or "us"). We respect your
                privacy and are committed to protecting your personal data.
              </p>
            </div>

            {/* Data We Collect */}
            <div className="space-y-1.5">
              <h2 className="text-base font-semibold text-green-500">
                2. Data We Collect
              </h2>
              <p className="text-zinc-300">
                We collect and process the following data:
              </p>
              <ul className="ml-4 list-inside list-disc space-y-1 text-zinc-300">
                <li>
                  Game progress and scores (stored locally on your device)
                </li>
                <li>Usage data through Google Analytics</li>
                <li>Ad-related data through Google AdSense</li>
              </ul>
            </div>

            {/* How We Use Your Data */}
            <div className="space-y-1.5">
              <h2 className="text-base font-semibold text-green-500">
                3. How We Use Your Data
              </h2>
              <p className="text-zinc-300">We use your data to:</p>
              <ul className="ml-4 list-inside list-disc space-y-1 text-zinc-300">
                <li>Save your game progress</li>
                <li>Improve our game experience</li>
                <li>Provide relevant advertisements</li>
                <li>Analyze game usage patterns</li>
              </ul>
            </div>

            {/* Cookies */}
            <div className="space-y-1.5">
              <h2 className="text-base font-semibold text-green-500">
                4. Cookies
              </h2>
              <p className="text-zinc-300">We use cookies for:</p>
              <ul className="ml-4 list-inside list-disc space-y-1 text-zinc-300">
                <li>Saving game progress</li>
                <li>Analytics tracking</li>
                <li>Ad personalization</li>
              </ul>
            </div>

            {/* Third-Party Services */}
            <div className="space-y-1.5">
              <h2 className="text-base font-semibold text-green-500">
                5. Third-Party Services
              </h2>
              <p className="text-zinc-300">
                We use the following third-party services:
              </p>
              <ul className="ml-4 list-inside list-disc space-y-1 text-zinc-300">
                <li>Google Analytics for usage tracking</li>
                <li>Google AdSense for advertisements</li>
                <li>Dog API for breed images</li>
              </ul>
            </div>

            {/* Your Rights */}
            <div className="space-y-1.5">
              <h2 className="text-base font-semibold text-green-500">
                6. Your Rights
              </h2>
              <p className="text-zinc-300">You have the right to:</p>
              <ul className="ml-4 list-inside list-disc space-y-1 text-zinc-300">
                <li>Clear your local game data</li>
                <li>Opt out of analytics tracking</li>
                <li>Control ad personalization</li>
              </ul>
            </div>

            {/* Contact */}
            <div className="space-y-1.5">
              <h2 className="text-base font-semibold text-green-500">
                7. Contact
              </h2>
              <p className="text-zinc-300">
                For any privacy-related questions, please contact us at{" "}
                <a
                  href="mailto:barkledaily@gmail.com"
                  className="text-green-500 hover:text-green-400"
                >
                  barkledaily@gmail.com
                </a>
              </p>
            </div>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}
