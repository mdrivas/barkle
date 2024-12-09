"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { useToast } from "~/hooks/use-toast";
import { api } from "~/trpc/react";
import Image from "next/image";
import { useSession } from "next-auth/react";

export function DogSubmissionModal() {
  const [open, setOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [breed, setBreed] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const { data: session } = useSession();

  const submitMutation = api.dogSubmission.create.useMutation({
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Your dog photo has been submitted for review.",
      });
      setOpen(false);
      setImageUrl("");
      setBreed("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = async (file: File) => {
    try {
      setIsUploading(true);
      console.log("Starting upload for file:", file.name);

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const { url } = await response.json();
      setImageUrl(url);
      
      toast({
        title: "Upload successful!",
        description: "Image uploaded successfully",
      });
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 h-14 text-lg font-medium">
          Submit Dog Photo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-zinc-950 text-zinc-50 border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Submit Your Dog Photo</DialogTitle>
        </DialogHeader>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-4 mt-4">
          <div className="space-y-2">
            {imageUrl ? (
              <div className="relative w-full h-48">
                <Image
                  src={imageUrl}
                  alt="Uploaded dog"
                  fill
                  className="object-cover rounded-lg"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => setImageUrl("")}
                >
                  Remove
                </Button>
              </div>
            ) : (
              <div className="relative w-full h-48">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileUpload(file);
                    }
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={isUploading}
                />
                <div className="w-full h-full bg-zinc-900 hover:bg-zinc-800 border-2 border-dashed border-zinc-700 rounded-lg flex items-center justify-center">
                  {isUploading ? "Uploading..." : "Click to upload photo"}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400">Dog Breed</label>
            <Input
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
              placeholder="Enter dog breed"
              className="bg-zinc-900 border-zinc-800"
            />
          </div>

          <Button
            type="button"
            className="w-full bg-green-600 hover:bg-green-700"
            disabled={submitMutation.isPending || !imageUrl || !breed.trim()}
            onClick={() => submitMutation.mutate({ imageUrl, breed: breed.trim() })}
          >
            {submitMutation.isPending ? "Submitting..." : "Submit Photo"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
} 