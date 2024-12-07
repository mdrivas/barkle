"use client";

import Link from "next/link";
import { signOut, useSession, signIn } from "next-auth/react";
import { Button } from "~/components/ui/button";
import { FAQSheet } from "~/app/components/FAQSheet";
import { FeedbackSheet } from "~/app/components/FeedbackSheet";

export function NavigationBar() {
  const { status } = useSession();

  return (
    <nav className="w-full bg-gradient-to-br from-[#1a1a1b] to-[#121213] border-b border-green-900/30">
      <div className="max-w-7xl mx-auto">
        <div className="w-full px-3 py-1.5 flex justify-end gap-2 text-[10px] text-green-500">
          <Link href="/privacy" className="hover:text-green-400 transition-colors">
            Privacy
          </Link>
          <span className="text-green-800">|</span>
          <Link href="/terms" className="hover:text-green-400 transition-colors">
            Terms
          </Link>
          <span className="text-green-800">|</span>
          <FAQSheet />
          <span className="text-green-800">|</span>
          <FeedbackSheet />
        </div>
      </div>
    </nav>
  );
}
