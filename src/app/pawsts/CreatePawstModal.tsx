"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { api } from "~/trpc/react";
import Image from "next/image";
import { useToast } from "~/hooks/use-toast";

interface CreatePawstModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ErrorResponse = { error: string };
type SuccessResponse = { url: string };

export function CreatePawstModal({ open, onOpenChange }: CreatePawstModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const utils = api.useUtils();
  const { toast } = useToast();

  const handleFileUpload = async (file: File) => {
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "post");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json() as ErrorResponse;
        throw new Error(error.error || "Upload failed");
      }

      const { url } = await response.json() as SuccessResponse;
      setImageUrl(url);
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const { mutate, isPending } = api.pawsts.create.useMutation({
    onSuccess: () => {
      setTitle("");
      setContent("");
      setImageUrl("");
      onOpenChange(false);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] border-zinc-800 bg-zinc-950">
        <DialogHeader>
          <DialogTitle className="text-zinc-50">Create a New Post</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-zinc-900 border-zinc-800 text-zinc-100"
          />
          <Textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            className="bg-zinc-900 border-zinc-800 text-zinc-100"
          />
          {imageUrl ? (
            <div className="relative h-56 w-full overflow-hidden rounded-lg border border-zinc-800/50">
              <Image
                src={imageUrl}
                alt="Upload preview"
                fill
                className="object-cover"
              />
              <Button
                variant="destructive"
                size="sm"
                className="absolute right-2 top-2"
                onClick={() => setImageUrl("")}
              >
                Remove
              </Button>
            </div>
          ) : (
            <div className="relative h-56 w-full">
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleFileUpload(file);
                }}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                disabled={isUploading}
              />
              <div className="flex h-full w-full items-center justify-center rounded-lg border-2 border-dashed border-zinc-700/50 bg-zinc-900/50 transition-colors hover:bg-zinc-800/50">
                <div className="text-center">
                  <div className="mb-2 text-zinc-400">
                    {isUploading ? "Uploading..." : "Click to upload photo (optional)"}
                  </div>
                  <div className="text-xs text-zinc-500">
                    Maximum file size: 5MB
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-2 w-full">
            <Button 
              variant="ghost" 
              onClick={() => onOpenChange(false)}
              className="sm:w-1/4"
            >
              Cancel
            </Button>
            <Button
              onClick={() => mutate({ title, content, imageUrl })}
              disabled={isPending || !title || !content}
              className="sm:w-3/4 bg-blue-600 hover:bg-blue-700 text-zinc-50"
            >
              {isPending ? "Creating..." : "Create Post"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 