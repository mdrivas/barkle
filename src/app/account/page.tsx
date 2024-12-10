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
import { 
  Trophy, 
  Flame, 
  GamepadIcon, 
  Camera, 
  ArrowLeft, 
  LogOut 
} from "lucide-react";
import { cn } from "~/lib/utils";

export default function AccountPage() {
  const { data: session } = useSession();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

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

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));

      // Create FormData
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "profile");
      
      // Upload to your preferred service
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const { url } = await response.json();
      
      // Update user profile with new image URL
      await updateImage({ imageUrl: url });
      
      // Clear file state but keep preview
      setImageFile(null);
    } catch (error) {
      console.error("Failed to upload image:", error);
      // Revert preview on error
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
    }
  };

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    color, 
    isLoading 
  }: { 
    title: string; 
    value: number; 
    icon: any; 
    color: string;
    isLoading: boolean;
  }) => (
    <Card className={`bg-gradient-to-br from-${color}-500/15 to-${color}-600/5 p-4`}>
      <div className="flex items-center gap-3">
        <div className={`rounded-full bg-${color}-500/15 p-2`}>
          <Icon className={`h-5 w-5 text-${color}-600`} />
        </div>
        <div>
          {isLoading ? (
            <Skeleton className="h-7 w-16" />
          ) : (
            <p className={`text-xl font-bold text-${color}-700`}>{value}</p>
          )}
          <p className={`text-sm text-${color}-600/90`}>{title}</p>
        </div>
      </div>
    </Card>
  );

  const { data: barkleStats, isLoading: isBarkleLoading } = api.score.getBarkleStats.useQuery(
    { userId: session?.user?.id ?? '' },
    { enabled: !!session?.user?.id }
  );

  const { data: pawsistenceStats, isLoading: isPawsistenceLoading } = api.score.getPawsistenceStats.useQuery(
    { userId: session?.user?.id ?? '' },
    { enabled: !!session?.user?.id }
  );

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
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <Button 
            onClick={() => void signOut({ callbackUrl: '/' })} 
            variant="destructive"
            size="sm"
            className="bg-red-600 hover:bg-red-700"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>

        {/* Profile Card */}
        <Card className="mb-6 overflow-hidden bg-gradient-to-br from-zinc-900 to-zinc-950 p-6">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="h-24 w-24 overflow-hidden rounded-full ring-2 ring-green-500/20">
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
              <label 
                className={cn(
                  "absolute bottom-0 right-0 cursor-pointer",
                  isUploading && "pointer-events-none"
                )}
              >
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                  disabled={isUploading}
                />
                <div 
                  className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center",
                    isUploading 
                      ? "bg-gray-500" 
                      : "bg-green-500 hover:bg-green-600"
                  )}
                >
                  {isUploading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <Camera className="h-4 w-4 text-white" />
                  )}
                </div>
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

        {/* Stats Sections */}
        <div className="space-y-6">
          {/* Daily Barkle Section */}
          <div>
            <h2 className="mb-4 text-xl font-semibold text-zinc-200">Daily Barkle</h2>
            <div className="grid grid-cols-2 gap-4">
              <StatCard
                title="Games Played"
                value={barkleStats?.gamesPlayed ?? 0}
                icon={GamepadIcon}
                color="sky"
                isLoading={isBarkleLoading}
              />
              <StatCard
                title="Daily Streak"
                value={barkleStats?.dailyStreak ?? 0}
                icon={Flame}
                color="orange"
                isLoading={isBarkleLoading}
              />
            </div>
          </div>

          {/* Pawsistence Section */}
          <div>
            <h2 className="mb-4 text-xl font-semibold text-zinc-200">Pawsistence</h2>
            <div className="grid grid-cols-2 gap-4">
              <StatCard
                title="Current Streak"
                value={pawsistenceStats?.currentStreak ?? 0}
                icon={Flame}
                color="emerald"
                isLoading={isPawsistenceLoading}
              />
              <StatCard
                title="Best Streak"
                value={pawsistenceStats?.bestStreak ?? 0}
                icon={Trophy}
                color="indigo"
                isLoading={isPawsistenceLoading}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 