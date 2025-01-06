"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "~/components/ui/sheet";
import { X } from "lucide-react";

export function Terms() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger 
        aria-label="Terms & Privacy"
        className="text-green-500 transition-colors hover:text-green-400"
      >
        Terms & Privacy
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
          <SheetTitle className="text-lg font-bold text-zinc-50">
            Terms of Service & Privacy Policy
          </SheetTitle>
        </SheetHeader>

        <div className="mt-4 max-h-[calc(90vh-80px)] overflow-y-auto pr-6 text-xs">
          <section className="space-y-4">
            {/* Purpose */}
            <div className="space-y-1.5">
              <h2 className="text-base font-semibold text-green-500">
                1. Purpose of Barkle
              </h2>
              <p className="text-zinc-300">
                Barkle is a free educational game platform focused on dog breed identification and learning. Our services include daily puzzles, endless mode (Pawsistence), and population guessing games (Pawpulation). All content is provided free of charge and is intended for entertainment and educational purposes.
              </p>
            </div>

            {/* Privacy & Data Collection */}
            <div className="space-y-1.5">
              <h2 className="text-base font-semibold text-green-500">
                2. Privacy & Data Collection
              </h2>
              <p className="text-zinc-300">
                We collect minimal user data necessary for game functionality:
              </p>
              <ul className="ml-4 list-inside list-disc space-y-1 text-zinc-300">
                <li>Authentication data (if you choose to sign in)</li>
                <li>Game scores and progress</li>
                <li>Basic usage statistics</li>
              </ul>
              
              <div className="mt-4 space-y-2">
                <p className="text-zinc-300">
                  This site uses essential cookies for authentication and game progress. 
                  By using Barkle, you agree to our use of cookies and data collection practices.
                </p>
                <p className="text-zinc-300">
                  We partner with third-party advertisers, including Google, who may use cookies 
                  and similar technologies to serve ads based on your prior visits to our website 
                  and other sites. These partners may collect information about your interactions 
                  to provide personalized advertising.
                </p>
                <p className="text-zinc-300">
                  You can opt out of personalized advertising by visiting{" "}
                  <a 
                    href="https://www.aboutads.info/choices" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-green-500 hover:text-green-400"
                  >
                    www.aboutads.info
                  </a>
                  {" "}or{" "}
                  <a 
                    href="https://www.google.com/settings/ads" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-green-500 hover:text-green-400"
                  >
                    Google Ads Settings
                  </a>
                </p>
              </div>
            </div>

            {/* User Content */}
            <div className="space-y-1.5">
              <h2 className="text-base font-semibold text-green-500">
                3. User Content & Behavior
              </h2>
              <p className="text-zinc-300">
                Users agree to:
              </p>
              <ul className="ml-4 list-inside list-disc space-y-1 text-zinc-300">
                <li>Provide accurate information when creating accounts</li>
                <li>Not manipulate scores or game mechanics</li>
                <li>Respect other users and maintain appropriate behavior</li>
                <li>Not use automated systems or bots</li>
              </ul>
            </div>

            {/* Advertising */}
            <div className="space-y-1.5">
              <h2 className="text-base font-semibold text-green-500">
                4. Advertising & Cookies
              </h2>
              <p className="text-zinc-300">
                Barkle displays advertisements through Google AdSense and other trusted partners. 
                Third-party vendors, including Google, use cookies to serve ads based on users' prior 
                visits to our website and other sites.
              </p>
              <p className="text-zinc-300">
                Google's use of advertising cookies enables it and its partners to serve ads based on 
                your visits to Barkle and/or other sites. These cookies are not directly related to 
                Barkle's core functionality but help provide relevant advertising.
              </p>
              <p className="text-zinc-300">
                You can opt out of personalized advertising by visiting:{" "}
                <a 
                  href="https://www.aboutads.info/choices" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-green-500 hover:text-green-400"
                >
                  www.aboutads.info
                </a>
                {" "}or{" "}
                <a 
                  href="https://www.google.com/settings/ads" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-green-500 hover:text-green-400"
                >
                  Google Ads Settings
                </a>
              </p>
            </div>

            {/* Safety & Disclaimer */}
            <div className="space-y-1.5">
              <h2 className="text-base font-semibold text-green-500">
                5. Safety & Disclaimer
              </h2>
              <p className="text-zinc-300">
                Barkle is provided "as is" without warranties. While we strive for accuracy, 
                we cannot guarantee the completeness or accuracy of all dog-related information. 
                Users rely on our content at their own discretion.
              </p>
            </div>

            {/* Copyright */}
           

            {/* Contact */}
            <div className="space-y-1.5">
              <h2 className="text-base font-semibold text-green-500">
                6. Contact Information
              </h2>
              <p className="text-zinc-300">
                For questions about these terms, privacy matters, or advertising concerns, 
                contact us at{" "}
                <a href="mailto:barkledaily@gmail.com" className="text-green-500 hover:text-green-400">
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
