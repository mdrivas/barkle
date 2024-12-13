"use client";

import { useState } from "react";
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

export function Terms() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="text-green-500 transition-colors hover:text-green-400">
        Terms
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
            Terms of Service
          </SheetTitle>
        </SheetHeader>

        <div className="mt-4 max-h-[calc(90vh-80px)] overflow-y-auto pr-6 text-xs">
          <section className="space-y-4">
            {/* Agreement */}
            <div className="space-y-1.5">
              <h2 className="text-base font-semibold text-green-500">
                1. Acceptance of Terms
              </h2>
              <p className="text-zinc-300">
                By accessing or using Barkle ("Service"), you acknowledge that
                you have read, understood, and agree to be bound by these Terms
                of Service ("Terms"). If you do not agree to these Terms, please
                refrain from using the Service.
              </p>
            </div>

            {/* Usage Rules */}
            <div className="space-y-1.5">
              <h2 className="text-base font-semibold text-green-500">
                2. User Obligations
              </h2>
              <p className="text-zinc-300">
                In using the Service, users explicitly agree to:
              </p>
              <ul className="ml-4 list-inside list-disc space-y-1 text-zinc-300">
                <li>
                  Utilize the Service solely for personal, non-commercial
                  purposes
                </li>
                <li>
                  Maintain the integrity of the gaming system by refraining from
                  score manipulation or exploitation
                </li>
                <li>
                  Abstain from employing automated systems, bots, or scripts
                </li>
                <li>
                  Adhere to community standards and demonstrate respectful
                  behavior
                </li>
                <li>Comply with all applicable laws and regulations</li>
              </ul>
            </div>

            {/* Intellectual Property */}
            <div className="space-y-1.5">
              <h2 className="text-base font-semibold text-green-500">
                3. Intellectual Property Rights
              </h2>
              <p className="text-zinc-300">
                All intellectual property rights, including but not limited to
                copyrights, trademarks, trade secrets, and patents related to
                Barkle's content, features, and functionality remain the
                exclusive property of Barkle and its licensors. Any unauthorized
                use, reproduction, or distribution is strictly prohibited.
              </p>
            </div>

            {/* User Content */}
            <div className="space-y-1.5">
              <h2 className="text-base font-semibold text-green-500">
                4. User-Generated Content
              </h2>
              <p className="text-zinc-300">
                By submitting, posting, or displaying content on or through the
                Service, you grant Barkle a worldwide, non-exclusive,
                royalty-free license to use, modify, adapt, reproduce,
                distribute, and display such content across all media formats
                and channels.
              </p>
            </div>

            {/* Disclaimer */}
            <div className="space-y-1.5">
              <h2 className="text-base font-semibold text-green-500">
                5. Disclaimer of Warranties
              </h2>
              <p className="text-zinc-300">
                The Service is provided on an "as is" and "as available" basis
                without any warranties, whether express, implied, or statutory,
                including but not limited to warranties of merchantability,
                fitness for a particular purpose, or non-infringement.
              </p>
            </div>

            {/* Limitation of Liability */}
            <div className="space-y-1.5">
              <h2 className="text-base font-semibold text-green-500">
                6. Limitation of Liability
              </h2>
              <p className="text-zinc-300">
                To the maximum extent permitted by law, Barkle shall not be
                liable for any indirect, incidental, special, consequential, or
                punitive damages, including without limitation, loss of profits,
                data, use, goodwill, or other intangible losses resulting from
                your access to or use of the Service.
              </p>
            </div>

            {/* Changes to Terms */}
            <div className="space-y-1.5">
              <h2 className="text-base font-semibold text-green-500">
                7. Modifications to Terms
              </h2>
              <p className="text-zinc-300">
                Barkle reserves the right to modify, amend, or update these
                Terms at its sole discretion. Users will be notified of material
                changes, and continued use of the Service following such
                modifications constitutes acceptance of the updated Terms.
              </p>
            </div>

            {/* Contact */}
            <div className="space-y-1.5">
              <h2 className="text-base font-semibold text-green-500">
                8. Contact Information
              </h2>
              <p className="text-zinc-300">
                For inquiries regarding these Terms or any legal matters, please
                contact{" "}
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
