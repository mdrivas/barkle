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
import { Camera, ArrowRight } from "lucide-react";

interface DogSubmissionModalProps {
  className?: string;
  variant?: "default" | "link";
}

export function DogSubmissionModal({ className, variant }: DogSubmissionModalProps) {
  const [open, setOpen] = useState(false);
  const [showSubmission, setShowSubmission] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [breed, setBreed] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleClose = () => {
    setOpen(false);
    setShowSubmission(false);
    setImageUrl("");
    setBreed("");
  };

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
        <Button 
          className={className}
          variant={variant}
        >
          Submit Your Dog!
        </Button>
      </DialogTrigger>
      <DialogContent className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] sm:w-full sm:max-w-[400px] bg-zinc-950/95 text-zinc-50 border border-zinc-800 rounded-xl">
        {!showSubmission ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-center text-zinc-50">
                Submit Your Dog! 🐾
              </DialogTitle>
            </DialogHeader>
            
            <div className="flex flex-col items-center gap-6 mt-4">
              <div className="w-24 h-24 bg-emerald-600/20 rounded-full flex items-center justify-center">
                <Camera className="w-12 h-12 text-emerald-500" />
              </div>
              
              <div className="text-center space-y-2">
                <p className="text-zinc-300">
                  Want to see your furry friend featured in Barkle?
                </p>
                <p className="text-sm text-zinc-400">
                  Each day we feature 4 online dogs and 1 community-submitted pup in our daily games! Submit a photo of your dog for a chance to have them appear.
                </p>
              </div>

              <Button
                onClick={() => setShowSubmission(true)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-zinc-100 transition-all duration-200 py-6 text-lg font-medium rounded-xl flex items-center justify-center gap-2"
              >
                Continue
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-center text-zinc-50">
                Upload Your Dog
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={(e) => e.preventDefault()} className="space-y-6 mt-4">
              <div className="space-y-4">
                {imageUrl ? (
                  <div className="relative w-full h-56 rounded-lg overflow-hidden border border-zinc-800/50 shadow-lg">
                    <Image
                      src={imageUrl}
                      alt="Uploaded dog"
                      fill
                      className="object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 bg-red-500/90 hover:bg-red-600"
                      onClick={() => setImageUrl("")}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="relative w-full h-56">
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
                    <div className="w-full h-full bg-zinc-900/50 hover:bg-zinc-800/50 border-2 border-dashed border-zinc-700/50 rounded-lg flex items-center justify-center transition-colors">
                      <div className="text-center">
                        <div className="text-zinc-400 mb-2">
                          {isUploading ? "Uploading..." : "Click to upload photo"}
                        </div>
                        <div className="text-xs text-zinc-500">
                          Maximum file size: 5MB
                        </div>
                      </div>
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
                  className="bg-zinc-900/50 border-zinc-800/50 focus:border-emerald-500/50 focus:ring-emerald-500/20 transition-colors"
                />
              </div>

              <Button
                type="button"
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                disabled={submitMutation.isPending || !imageUrl || !breed.trim()}
                onClick={() => submitMutation.mutate({ imageUrl, breed: breed.trim() })}
              >
                {submitMutation.isPending ? "Submitting..." : "Submit Photo"}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
} 