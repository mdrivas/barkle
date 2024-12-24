"use client";

import { useSession, signOut } from "next-auth/react";
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
  LogOut,
  Share2,
  Pencil,
  Star,
  Sparkles,
} from "lucide-react";
import { cn } from "~/lib/utils";
import { useToast } from "~/hooks/use-toast";
import { useSignIn } from "~/hooks/useSignIn";
import { useProfileContext } from "../components/ProfileProvider";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Achievements } from "../components/Achievements";
import { DogAvatar } from "~/components/DogAvatar/DogAvatar";
import { AvatarSelector } from "~/components/DogAvatar/AvatarSelector";
import { AccessorySelector } from "~/components/DogAvatar/AccessorySelector";
import { CustomizeAvatarDialog } from "~/components/DogAvatar/CustomizeAvatarDialog";
const STAT_CARD_STYLES = {
  sky: {
    background: "bg-gradient-to-br from-sky-500/20 to-sky-600/10",
    icon: "bg-sky-500/25 text-sky-500",
    text: "text-sky-900",
    highlight: "text-sky-700",
    ring: "ring-sky-500/20",
  },
  orange: {
    background: "bg-gradient-to-br from-orange-500/20 to-orange-600/10",
    icon: "bg-orange-500/25 text-orange-500",
    text: "text-orange-900",
    highlight: "text-orange-700",
    ring: "ring-orange-500/20",
  },
  emerald: {
    background: "bg-gradient-to-br from-emerald-500/20 to-emerald-600/10",
    icon: "bg-emerald-500/25 text-emerald-500",
    text: "text-emerald-900",
    highlight: "text-emerald-700",
    ring: "ring-emerald-500/20",
  },
  indigo: {
    background: "bg-gradient-to-br from-indigo-500/20 to-indigo-600/10",
    icon: "bg-indigo-500/25 text-indigo-500",
    text: "text-indigo-900",
    highlight: "text-indigo-700",
    ring: "ring-indigo-500/20",
  },
} as const;

export default function AccountPage() {
  const { data: session } = useSession();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { tempId } = useProfileContext();
  const {
    data: userData,
    isLoading,
    refetch: refetchProfile,
  } = api.profile.getProfile.useQuery(
    { tempId },
    {
      enabled: !!session?.user,
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
      refetchOnWindowFocus: false,
    },
  );

  const { handleGoogleSignIn } = useSignIn();

  const { mutate: updateImage } = api.profile.updateProfileImage.useMutation({
    onSuccess: () => {
      void refetchProfile();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const { toast } = useToast();

  const updateUsernameMutation = api.profile.updateUsername.useMutation({
    onSuccess: () => {
      setIsEditingUsername(false);
      void refetchProfile();
      toast({
        title: "Username updated!",
        description: "Your new username has been saved.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleUsernameUpdate = async () => {
    if (!newUsername) return;
    
    try {
      await updateUsernameMutation.mutateAsync({ username: newUsername });
    } catch (error) {
      // Error handling is done in onError above
    }
  };

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
        throw new Error("Upload failed");
      }

      const { url } = (await response.json()) as { url: string };

      // Update user profile with new image URL
      updateImage({ imageUrl: url });

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

  const signInWithGoogle = () => {
    void handleGoogleSignIn();
  };

  const StatCard = ({
    title,
    value,
    icon: Icon,
    color,
    isLoading,
    isLegendary,
  }: {
    title: string;
    value: number;
    icon: any; // Consider using a more specific type like LucideIcon
    color: keyof typeof STAT_CARD_STYLES;
    isLoading: boolean;
    isLegendary?: boolean;
  }) => {
    const styles = STAT_CARD_STYLES[color];

    return (
      <Card
        className={cn(
          "relative overflow-hidden p-4 transition-all duration-200 hover:scale-[1.02]",
          styles.background,
          "ring-1",
          {
            "ring-purple-500/20": isLegendary,
            "ring-white/10": !isLegendary,
          },
          "shadow-lg hover:shadow-xl",
        )}
      >
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "rounded-xl p-2.5",
                styles.icon,
                "ring-1 ring-white/10",
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div>
              {isLoading ? (
                <Skeleton className="h-7 w-16" />
              ) : (
                <p
                  className={cn(
                    "text-2xl font-bold tracking-tight",
                    styles.highlight,
                  )}
                >
                  {value}
                </p>
              )}
              <p className={cn("text-sm font-medium", styles.text)}>{title}</p>
            </div>
          </div>
        </div>
        {/* Decorative corner gradient */}
        <div
          className={cn(
            "absolute -right-4 -top-4 h-24 w-24 rounded-full blur-2xl",
            styles.icon,
            "opacity-20",
          )}
        />
        {isLegendary && (
          <Sparkles 
            className="absolute right-2 top-2 h-4 w-4 text-purple-400" 
          />
        )}
      </Card>
    );
  };

  const { data: barkleStats, isLoading: isBarkleLoading } =
    api.score.getBarkleStats.useQuery(undefined, {
      enabled: !!session?.user?.id,
    });

  const { mutate: trackShare } = api.achievements.trackShare.useMutation();

  const handleShare = async () => {
    const statsText = `🐕 MY BARKLE STATS 🐕

📊 DAILY BARKLE
━━━━━━━━━━━━━━━
🎮 Games Played: ${barkleStats?.gamesPlayed ?? 0}
🔥 Daily Streak: ${barkleStats?.dailyStreak ?? 0}
✨ Current Guess Streak: ${userData?.currentGuessStreak ?? 0}
👑 Best Guess Streak: ${userData?.highestGuessStreak ?? 0}

🎯 PAWSISTENCE
━━━━━━━━━━━━━━━
🎮 Today's Plays: ${userData?.pawsistencePlaysToday ?? 0}
👑 Longest Streak: ${userData?.highestPawsistenceStreak ?? 0}

🌟 PAWPULATION
━━━━━━━━━━━━━━━━
🎮 Games Played: ${userData?.pawpulationGamesPlayed ?? 0}
🏆 High Score: ${userData?.pawpulationHighScore ?? 0}

🌟 Fetch your own pups at https://barkle.vercel.app`;

    try {
      if (navigator.share) {
        await navigator.share({
          text: statsText,
        });
        trackShare(); // Track successful share
      } else {
        await navigator.clipboard.writeText(statsText);
        trackShare(); // Track successful copy
        toast({
          title: "Stats copied!",
          description: "Share your Barkle progress with friends!",
          duration: 2000,
        });
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const [showAllAchievements, setShowAllAchievements] = useState(false);
  const [isSelectingAvatar, setIsSelectingAvatar] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(1);

  const handleAvatarUpdate = async (avatarNumber: number) => {
    setSelectedAvatar(avatarNumber);
    setIsSelectingAvatar(false);
    await updateImage({ imageUrl: `/avatars/dogav${avatarNumber}.png` });
  };

  const [isSelectingAccessory, setIsSelectingAccessory] = useState(false);
  const [selectedAccessory, setSelectedAccessory] = useState<number | null>(null);

  

  const [showCustomizeDialog, setShowCustomizeDialog] = useState(false);

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#121213] p-4">
        <Card className="w-full max-w-sm space-y-8 bg-zinc-900/50 p-8">
          <h1 className="text-center text-2xl font-bold text-zinc-50">
            Welcome to Barkle
          </h1>
          <button
            onClick={signInWithGoogle}
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-white px-6 py-3 text-black transition-colors hover:bg-gray-50"
          >
            <GoogleLogo />
            Continue with Google
          </button>
          <Link href="/" className="block text-center">
            <Button
              variant="ghost"
              className="text-zinc-400 hover:text-zinc-200"
            >
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
            <Button
              variant="ghost"
              className="text-zinc-400 hover:text-zinc-200"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <Button
            onClick={() => void signOut({ callbackUrl: "/" })}
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
                <DogAvatar 
                  size="lg" 
                  imageUrl={userData?.profileImageUrl}
                />
              </div>
              <button
                onClick={() => setShowCustomizeDialog(true)}
                className="absolute -bottom-1 -right-1 rounded-full bg-zinc-800 p-1.5 ring-1 ring-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                <Pencil className="h-4 w-4" />
              </button>
            </div>

            <div className="text-center">
              {isLoading ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <p className="text-2xl font-bold text-zinc-50">
                    {userData?.username ?? "User"}
                  </p>
                  <button
                    onClick={() => {
                      setNewUsername(userData?.username ?? "");
                      setIsEditingUsername(true);
                    }}
                    className="rounded-full p-1.5 text-zinc-400 hover:text-zinc-200 transition-colors"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Stats Sections */}
        <div className="space-y-6">
          {/* Achievements Section */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold text-zinc-200">
                  Achievements
                </h2>
                {(barkleStats?.achievements ?? []).filter(a => a.rarity === 'LEGENDARY' && a.isUnlocked).length > 0 && (
                  <div className="flex items-center gap-1 rounded-full bg-purple-500/10 px-2 py-0.5">
                    <Sparkles className="h-4 w-4 text-purple-400" />
                    <span className="text-sm text-purple-400">
                      {(barkleStats?.achievements ?? []).filter(a => a.rarity === 'LEGENDARY' && a.isUnlocked).length}
                    </span>
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllAchievements(!showAllAchievements)}
                className="text-zinc-400 hover:text-zinc-200"
              >
                {showAllAchievements ? 'Show Less' : 'View All'}
              </Button>
            </div>
            <Achievements 
              achievements={
                showAllAchievements 
                  ? (barkleStats?.achievements ?? []).sort((a, b) => {
                      if (a.isUnlocked !== b.isUnlocked) return b.isUnlocked ? 1 : -1;
                      const rarityOrder = { 
                        LEGENDARY: 4, 
                        EPIC: 3, 
                        RARE: 2, 
                        COMMON: 1 
                      } as const;
                      return rarityOrder[b.rarity as keyof typeof rarityOrder] - rarityOrder[a.rarity as keyof typeof rarityOrder];
                    })
                  : (barkleStats?.achievements ?? [])
                      .filter(a => a.isUnlocked)
                      .sort((a, b) => {
                        const rarityOrder = { 
                          LEGENDARY: 4, 
                          RARE: 2, 
                          COMMON: 1 
                        } as const;
                        return rarityOrder[b.rarity.toUpperCase() as keyof typeof rarityOrder] - 
                               rarityOrder[a.rarity.toUpperCase() as keyof typeof rarityOrder];
                      })
                      .slice(0, 3)
              }
              isLoading={isBarkleLoading} 
            />
          </div>

          {/* Daily Barkle Section */}
          <div>
            <h2 className="mb-4 text-xl font-semibold text-zinc-200">
              Daily Barkle
            </h2>
            <div className="mb-4 grid grid-cols-2 gap-4">
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
                isLegendary={barkleStats?.achievements.some(
                  a => a.type === 'DAILY_LEGENDARY' && a.isUnlocked
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <StatCard
                title="Current Guess Streak"
                value={userData?.currentGuessStreak ?? 0}
                icon={Flame}
                color="emerald"
                isLoading={isLoading}
              />
              <StatCard
                title="Best Guess Streak"
                value={barkleStats?.highestGuessStreak ?? 0}
                icon={Trophy}
                color="indigo"
                isLoading={isBarkleLoading}
                isLegendary={barkleStats?.achievements.some(
                  a => a.type === 'STREAK_LEGENDARY' && a.isUnlocked
                )}
              />
            </div>
          </div>

          {/* Pawsistence Section */}
          <div>
            <h2 className="mb-4 text-xl font-semibold text-zinc-200">
              Pawsistence
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <StatCard
                title="Plays Today"
                value={userData?.pawsistencePlaysToday ?? 0}
                icon={GamepadIcon}
                color="emerald"
                isLoading={isLoading}
              />
              <StatCard
                title="Best Streak"
                value={userData?.highestPawsistenceStreak ?? 0}
                icon={Trophy}
                color="indigo"
                isLoading={isLoading}
              />
            </div>
          </div>

          {/* Pawpulation Section */}
          <div className="mt-8">
            <h2 className="mb-4 text-xl font-semibold text-zinc-200">
              Pawpulation
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <StatCard
                title="Games Played"
                value={userData?.pawpulationGamesPlayed ?? 0}
                icon={GamepadIcon}
                color="sky"
                isLoading={isLoading}
              />
              <StatCard
                title="High Score"
                value={userData?.pawpulationHighScore ?? 0}
                icon={Trophy}
                color="indigo"
                isLoading={isLoading}
              />

            </div>
          </div>
        </div>

        <div className="mt-8">
          <Button
            onClick={handleShare}
            className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-700/20 transition-all duration-200 hover:from-emerald-700 hover:to-emerald-600 hover:shadow-emerald-700/40"
            size="lg"
          >
            <Share2 className="mr-2 h-5 w-5" />
            Share Stats
          </Button>
        </div>
      </div>

      {/* Add Username Edit Dialog */}
      <Dialog open={isEditingUsername} onOpenChange={setIsEditingUsername}>
        <DialogContent className="bg-zinc-900 text-zinc-50">
          <DialogHeader>
            <DialogTitle>Edit Username</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="New username"
              className="bg-zinc-800 text-zinc-50"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => setIsEditingUsername(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUsernameUpdate}
                disabled={updateUsernameMutation.isPending}
              >
                {updateUsernameMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <CustomizeAvatarDialog
        isOpen={showCustomizeDialog}
        onClose={() => setShowCustomizeDialog(false)}
        onSelectAvatar={() => setIsSelectingAvatar(true)}
        onSelectAccessory={() => setIsSelectingAccessory(true)}
      />

      <AvatarSelector
        isOpen={isSelectingAvatar}
        onClose={() => setIsSelectingAvatar(false)}
        onSelect={handleAvatarUpdate}
        selectedAvatar={selectedAvatar}
      />

      <AccessorySelector
        isOpen={isSelectingAccessory}
        onClose={() => setIsSelectingAccessory(false)}
        onSelect={(accessoryId) => {
          setSelectedAccessory(accessoryId);
          setIsSelectingAccessory(false);
        }}
        selectedAccessory={selectedAccessory}
      />
    </div>
  );
}
