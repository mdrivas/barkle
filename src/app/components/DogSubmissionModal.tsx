"use client";

import { useState, useEffect } from "react";
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
import { useSession } from "next-auth/react";
import { useSignIn } from "~/hooks/useSignIn";

interface DogSubmissionModalProps {
  className?: string;
  variant?: "default" | "link";
}

// Add type for error response
type ErrorResponse = { error: string };

// Add type for success response
type SuccessResponse = { url: string; success: boolean };

export function DogSubmissionModal({
  className,
  variant,
}: DogSubmissionModalProps) {
  const [open, setOpen] = useState(false);
  const [showSubmission, setShowSubmission] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [breed, setBreed] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const { data: session } = useSession();
  const { handleGoogleSignIn } = useSignIn();

  const handleClose = () => {
    setOpen(false);
    setShowSubmission(false);
    setShowAuthPrompt(false);
    setImageUrl("");
    setBreed("");
  };

  const handleContinue = () => {
    if (!session) {
      setShowAuthPrompt(true);
    } else {
      setShowSubmission(true);
    }
  };

  const handleSignIn = async () => {
    const result = await handleGoogleSignIn();

    if (result?.ok) {
      setShowAuthPrompt(false);
      setShowSubmission(true);
      setOpen(true);
    }
  };

  useEffect(() => {
    if (session?.user) {
      setShowAuthPrompt(false);
    }
  }, [session]);

  const submitMutation = api.dogSubmission.create.useMutation({
    onSuccess: () => {
      toast({
        title: "Success!",
        description:
          "Your dog photo has been submitted for review. We'll notify you when it's approved!",
      });
      handleClose(); // Use the existing handleClose to reset the form
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit dog photo",
        variant: "destructive",
      });
    },
  });

  // Update the submit handler to include all required fields
  const handleSubmit = () => {
    if (!session?.user?.id || !imageUrl || !breed.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    submitMutation.mutate({
      imageUrl,
      breed: breed.trim(),
    });
  };

  const handleFileUpload = async (file: File) => {
    try {
      setIsUploading(true);
      console.log("Starting upload for file:", file.name);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "submission");

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

      toast({
        title: "Upload successful!",
        description: "Image uploaded successfully",
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
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
          onClick={() => {
            setShowSubmission(false);
            setShowAuthPrompt(false);
          }}
        >
          Submit Your Dog!
        </Button>
      </DialogTrigger>
      <DialogContent className="fixed left-1/2 top-1/2 w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-zinc-800 bg-zinc-950/95 text-zinc-50 sm:w-full sm:max-w-[400px]">
        {showAuthPrompt ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-center text-2xl font-bold text-zinc-50">
                Sign In Required
              </DialogTitle>
            </DialogHeader>

            <div className="mt-4 flex flex-col items-center gap-6">
              <div className="space-y-2 text-center">
                <p className="text-zinc-300">
                  Please sign in to submit your dog photo
                </p>
              </div>

              <button
                onClick={handleSignIn}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-2 text-gray-900 transition-colors duration-200 hover:bg-gray-50"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                    <path
                      fill="#4285F4"
                      d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"
                    />
                    <path
                      fill="#34A853"
                      d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"
                    />
                    <path
                      fill="#EA4335"
                      d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"
                    />
                  </g>
                </svg>
                Continue with Google
              </button>
            </div>
          </>
        ) : !showSubmission ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-center text-2xl font-bold text-zinc-50">
                Submit Your Dog! 🐾
              </DialogTitle>
            </DialogHeader>

            <div className="mt-4 flex flex-col items-center gap-6">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-600/20">
                <Camera className="h-12 w-12 text-emerald-500" />
              </div>

              <div className="space-y-2 text-center">
                <p className="text-zinc-300">
                  Want to see your furry friend featured in Barkle?
                </p>
                <p className="text-sm text-zinc-400">
                  Each day we feature 4 online dogs and 1 community-submitted
                  pup in our daily games! Submit a photo of your dog for a
                  chance to have them appear.
                </p>
              </div>

              <Button
                onClick={handleContinue}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-6 text-lg font-medium text-zinc-100 transition-all duration-200 hover:bg-emerald-700"
              >
                Continue
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-center text-2xl font-bold text-zinc-50">
                Upload Your Dog
              </DialogTitle>
            </DialogHeader>

            <form
              onSubmit={(e) => e.preventDefault()}
              className="mt-4 space-y-6"
            >
              <div className="space-y-4">
                {imageUrl ? (
                  <div className="relative h-56 w-full overflow-hidden rounded-lg border border-zinc-800/50 shadow-lg">
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
                      className="absolute right-2 top-2 bg-red-500/90 hover:bg-red-600"
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
                        if (file) {
                          void handleFileUpload(file);
                        }
                      }}
                      className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                      disabled={isUploading}
                    />
                    <div className="flex h-full w-full items-center justify-center rounded-lg border-2 border-dashed border-zinc-700/50 bg-zinc-900/50 transition-colors hover:bg-zinc-800/50">
                      <div className="text-center">
                        <div className="mb-2 text-zinc-400">
                          {isUploading
                            ? "Uploading..."
                            : "Click to upload photo"}
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
                <label className="text-sm font-medium text-zinc-400">
                  Dog Breed
                </label>
                <Input
                  value={breed}
                  onChange={(e) => setBreed(e.target.value)}
                  placeholder="Enter dog breed"
                  className="border-zinc-800/50 bg-zinc-900/50 transition-colors focus:border-emerald-500/50 focus:ring-emerald-500/20"
                />
              </div>

              <Button
                type="button"
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                disabled={
                  submitMutation.isPending || !imageUrl || !breed.trim()
                }
                onClick={handleSubmit} // Use the new handleSubmit
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
