"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { api } from "~/trpc/react";
import { DogAvatar } from "~/components/DogAvatar/DogAvatar";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "~/hooks/use-toast";

interface CommentSectionProps {
  blogPostId: number;
}

export function CommentSection({ blogPostId }: CommentSectionProps) {
  const [content, setContent] = useState("");
  const utils = api.useUtils();
  
  
  const { data: comments } = api.comments.getByBlogPostId.useQuery(blogPostId);
  const { toast } = useToast();

  const { mutate, isPending } = api.comments.create.useMutation({
    onSuccess: () => {
      setContent("");
      void utils.comments.getByBlogPostId.invalidate(blogPostId);
      void utils.pawsts.getAll.invalidate();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    console.log("Submitting with:", { content, blogPostId }); // Debug log
    mutate({ content, blogPostId });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write a comment..."
          className="bg-zinc-900 border-zinc-800 text-zinc-100"
        />
        <Button
          onClick={handleSubmit}
          disabled={isPending || !content.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {isPending ? "Posting..." : "Post Comment"}
        </Button>
      </div>

      <div className="space-y-4">
        {comments?.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            <DogAvatar size="sm" imageUrl={comment.user.profile?.profileImageUrl} />
            <div>
              <div className="rounded-lg bg-zinc-900 p-3">
                <p className="text-sm font-medium text-zinc-300">
                  {comment.user.profile?.username}
                </p>
                <p className="text-sm text-zinc-100">{comment.content}</p>
              </div>
              <p className="mt-1 text-xs text-zinc-500">
                {formatDistanceToNow(new Date(comment.createdAt))} ago
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 