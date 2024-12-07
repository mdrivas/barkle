"use client";

import { useSession } from "next-auth/react";
import { Card } from "~/components/ui/card";
import Link from "next/link";
import { Button } from "~/components/ui/button";

export default function AccountPage() {
  const { data: session } = useSession();

  if (!session) {
    return (
      <div className="min-h-screen bg-[#121213] text-zinc-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in to view your account</h1>
          <Link href="/">
            <Button>Return Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121213] text-zinc-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="text-zinc-400 hover:text-zinc-200">
              ← Back to Home
            </Button>
          </Link>
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