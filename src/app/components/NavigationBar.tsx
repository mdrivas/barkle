"use client";

import Link from "next/link";
import { signOut, useSession, signIn } from "next-auth/react";
import { Button } from "~/components/ui/button";

export function NavigationBar() {
  const { status } = useSession();

  return (
    <nav className="w-full bg-black border-b border-green-900/30">
      {/* Main navigation content */}
      <div className="max-w-7xl mx-auto">
        {/* Top links row */}
        <div className="w-full px-4 py-2 flex justify-end gap-4 text-xs text-green-500">
          <Link href="/privacy" className="hover:text-green-400 transition-colors">
            Privacy Policy
          </Link>
          <span className="text-green-800">|</span>
          <Link href="/terms" className="hover:text-green-400 transition-colors">
            Terms of Service
          </Link>
          <span className="text-green-800">|</span>
          <Link href="/faq" className="hover:text-green-400 transition-colors">
            FAQ
          </Link>
          <span className="text-green-800">|</span>
          <Link href="/feedback" className="hover:text-green-400 transition-colors">
            Feedback
          </Link>
        </div>

        {/* Main nav row - only shown if authenticated
        {status === "authenticated" && (
          <div className="px-4 py-2 flex items-center justify-between border-t border-green-900/30">
            <div className="flex items-center gap-4">
              <Link href="/profile">
                <Button 
                  variant="ghost" 
                  className="text-green-500 hover:text-green-400 hover:bg-green-900/20"
                >
                  Profile
                </Button>
              </Link>
              <Link href="/stats">
                <Button 
                  variant="ghost" 
                  className="text-green-500 hover:text-green-400 hover:bg-green-900/20"
                >
                  Stats
                </Button>
              </Link>
            </div>
            <Button 
              variant="ghost" 
              onClick={() => signOut()}
              className="text-green-500 hover:text-green-400 hover:bg-green-900/20"
            >
              Logout
            </Button>
          </div>
        )} */}
      </div>
    </nav>
  );
}
