"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { Card } from "~/components/ui/card";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { GoogleLogo } from "~/components/icons";

export default function AccountPage() {
  const { data: session } = useSession();

  if (!session) {
    return (
      <div className="min-h-screen bg-[#121213] text-zinc-50 flex items-center justify-center">
        <div className="text-center space-y-6">
          <h1 className="text-2xl font-bold mb-4">Sign in to view your account</h1>
          <button
            onClick={() => void signIn("google")}
            className="flex items-center justify-center gap-2 bg-white text-black rounded-lg px-6 py-3 hover:bg-gray-50 transition-colors"
          >
            <GoogleLogo />
            Continue with Google
          </button>
          <div className="pt-4">
            <Link href="/">
              <Button variant="ghost" className="text-zinc-400 hover:text-zinc-200">
                Return Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121213] text-zinc-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <Link href="/">
            <Button variant="ghost" className="text-zinc-400 hover:text-zinc-200">
              ← Back to Home
            </Button>
          </Link>
          <Button 
            onClick={() => void signOut({ callbackUrl: '/' })} 
            variant="destructive"
            className="bg-red-600 hover:bg-red-700"
          >
            Sign Out
          </Button>
        </div>

        <h1 className="text-3xl font-bold mb-8">My Account</h1>

        <Card className="bg-zinc-900/50 border-zinc-800 p-6 space-y-4">
          <div>
            <label className="text-sm text-zinc-400">Name</label>
            <p className="text-lg font-medium">{session.user.name}</p>
          </div>
          <div>
            <label className="text-sm text-zinc-400">Email</label>
            <p className="text-lg font-medium">{session.user.email}</p>
          </div>
        </Card>
      </div>
    </div>
  );
} 