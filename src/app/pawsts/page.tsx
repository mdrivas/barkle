"use client";

import { Button } from "~/components/ui/button";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { CreatePawstModal } from "~/app/pawsts/CreatePawstModal";
import { api } from "~/trpc/react";
import { DogAvatar } from "~/components/DogAvatar/DogAvatar";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { CommentSection } from "~/app/pawsts/CommentSection";

type Pawst = {
  id: number;
  title: string;
  content: string;
  imageUrl: string | null;
  createdAt: Date;
  author: {
    id: number;
    username: string | null;
    profileImageUrl: string;
  } | null;
};

export default function PawstsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { data: session } = useSession();
  const { data: pawsts } = api.pawsts.getAll.useQuery();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1e2c3d] to-[#141c2a]">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex items-center justify-between">
            <Link 
              href="/" 
              className="text-3xl font-bold text-zinc-50 hover:text-zinc-300 transition-colors"
            >
              🐾 Pup Posts
            </Link>
            {session?.user && (
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Share Post
              </Button>
            )}
          </div>
          <p className="text-zinc-400 text-center text-sm max-w-xl mx-auto">
            Share your dog stories, photos, and get advice from our community of dog lovers! 🐕
          </p>
        </div>

        <div className="space-y-4">
          {pawsts?.map((post) => (
            <div
              key={post.id}
              className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4"
            >
              <div className="flex items-center gap-3 mb-3">
                <DogAvatar size="sm" imageUrl={post.author?.profileImageUrl} />
                <div>
                  <h3 className="font-medium text-zinc-200 text-base">{post.title}</h3>
                  <p className="text-xs text-zinc-400">
                    by {post.author?.username ?? 'Anonymous'} •{" "}
                    {formatDistanceToNow(new Date(post.createdAt))} ago
                  </p>
                </div>
              </div>
              
              {post.imageUrl && (
                <Image
                  src={post.imageUrl}
                  alt={post.title}
                  width={800}
                  height={600}
                  className="mb-3 rounded-lg w-full object-cover max-h-80"
                />
              )}
              
              <p className="text-zinc-300 text-sm whitespace-pre-wrap">{post.content}</p>

              <div className="mt-4 border-t border-zinc-800 pt-4">
                <CommentSection blogPostId={post.id} />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-300"
          >
            <span>←</span> Back to Home
          </Link>
        </div>
      </div>

      <CreatePawstModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
      />
    </div>
  );
} 