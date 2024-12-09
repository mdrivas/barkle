"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { Card } from "~/components/ui/card";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { GoogleLogo } from "~/components/icons";
import Image from "next/image";
import { useState } from "react";
import { api } from "~/trpc/react";
import { Skeleton } from "../../components/ui/skeleton";

export default function AccountPage() {
  const { data: session } = useSession();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { data: userData, isLoading } = api.user.getProfile.useQuery(undefined, {
    enabled: !!session?.user,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  });

  const utils = api.useUtils();
  const { mutate: updateImage } = api.user.updateProfileImage.useMutation({
    onSuccess: () => {
      utils.user.getProfile.invalidate();
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleImageUpload = async () => {
    if (!imageFile) return;

    try {
      // Create FormData
      const formData = new FormData();
      formData.append("file", imageFile);
      
      // Upload to your preferred service (e.g., Cloudinary, S3)
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      
      const { url } = await response.json();
      
      // Update user profile with new image URL
      await updateImage({ imageUrl: url });
      
      // Clear local state
      setImageFile(null);
      setPreviewUrl(null);
    } catch (error) {
      console.error("Failed to upload image:", error);
    }
  };

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#121213] p-4">
        <Card className="w-full max-w-sm space-y-8 bg-zinc-900/50 p-8">
          <h1 className="text-center text-2xl font-bold text-zinc-50">Welcome to Barkle</h1>
          <button
            onClick={() => void signIn("google")}
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-white px-6 py-3 text-black transition-colors hover:bg-gray-50"
          >
            <GoogleLogo />
            Continue with Google
          </button>
          <Link href="/" className="block text-center">
            <Button variant="ghost" className="text-zinc-400 hover:text-zinc-200">
              Return Home
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121213] px-4 py-6">
      <div className="mx-auto max-w-xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" className="text-zinc-400 hover:text-zinc-200">
              ← Back
            </Button>
          </Link>
          <Button 
            onClick={() => void signOut({ callbackUrl: '/' })} 
            variant="destructive"
            size="sm"
            className="bg-red-600 hover:bg-red-700"
          >
            Sign Out
          </Button>
        </div>

        {/* Profile Section */}
        <Card className="mb-6 overflow-hidden bg-zinc-900/50 p-6">
          <div className="flex flex-col items-center gap-4">
            <div className="flex flex-col items-center">
              <div className="h-24 w-24 overflow-hidden rounded-full bg-zinc-800">
                {(previewUrl || session.user.image) && (
                  <Image
                    src={previewUrl ?? session.user.image!}
                    alt="Profile"
                    width={96}
                    height={96}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <label className="mt-3">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                  onClick={handleImageUpload}
                  disabled={!imageFile}
                >
                  {imageFile ? "Save Photo" : "Change Photo"}
                </Button>
              </label>
            </div>
            
            <div className="text-center">
              {isLoading ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <p className="text-2xl font-bold text-zinc-50">
                  {userData?.username ?? 'User'}
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-zinc-800/50 p-4 text-center">
            {isLoading ? (
              <Skeleton className="mx-auto h-10 w-16" />
            ) : (
              <p className="text-3xl font-bold text-zinc-50">
                {userData?.gamesPlayed ?? 0}
              </p>
            )}
            <p className="text-sm text-zinc-400">Games Played</p>
          </Card>
          <Card className="bg-zinc-800/50 p-4 text-center">
            {isLoading ? (
              <Skeleton className="mx-auto h-10 w-16" />
            ) : (
              <p className="text-3xl font-bold text-zinc-50">
                {userData?.currentDailyStreak ?? 0}
              </p>
            )}
            <p className="text-sm text-zinc-400">Day Streak</p>
          </Card>
        </div>
      </div>
    </div>
  );
} 