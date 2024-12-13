"use client";

import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { api } from "~/trpc/react";
import Image from "next/image";
import { Grid, List, CheckCircle, Clock, ImageIcon, Home } from "lucide-react";
import { useRouter } from "next/navigation";
import { NavigationBar } from "~/app/components/NavigationBar";

type ViewMode = "single" | "grid";

interface ImageDecision {
  filename: string;
  action: "approve" | "reject";
}

export default function AdminPage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>("single");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [decisions, setDecisions] = useState<ImageDecision[]>([]);
  const utils = api.useUtils();

  const { data: isAdmin, isLoading } = api.user.isAdmin.useQuery();
  const { data: pendingImages, refetch } =
    api.admin.getPendingImages.useQuery();
  const { data: stats } = api.admin.getStats.useQuery();

  // Move hooks above any conditional returns
  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push("/");
    }
  }, [isLoading, isAdmin, router]);

  if (!isLoading && !isAdmin) {
    return null;
  }

  const currentImage = pendingImages?.[currentIndex];

  // New mutation for batch processing
  const batchProcessMutation = api.admin.batchProcessImages.useMutation({
    onSuccess: async () => {
      await utils.admin.getStats.invalidate();
      await refetch();
      setDecisions([]);
      setCurrentIndex(0);
    },
  });

  const handleImageDecision = (
    filename: string,
    action: "approve" | "reject",
  ) => {
    setDecisions((prev) => [...prev, { filename, action }]);
    // Move to next image
    if (currentIndex >= (pendingImages?.length ?? 0) - 1) {
      setCurrentIndex(0);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleSubmitChanges = async () => {
    if (decisions.length === 0) return;
    await batchProcessMutation.mutateAsync({ decisions });
  };

  return (
    <div className="min-h-screen bg-[#1a1a1b]">
      <NavigationBar />
      <div className="p-8">
        <h1 className="mb-8 text-center text-xl font-bold text-green-500">
          Dog Photo Review Dashboard
        </h1>
        <div className="mx-auto max-w-6xl">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="mr-2 text-sm text-zinc-400">Display:</span>
              <Button
                variant="ghost"
                onClick={() => setViewMode("single")}
                className={
                  viewMode === "single" ? "text-green-500" : "text-zinc-400"
                }
              >
                <List className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                onClick={() => setViewMode("grid")}
                className={
                  viewMode === "grid" ? "text-green-500" : "text-zinc-400"
                }
              >
                <Grid className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="mb-4 flex gap-4">
            <div className="flex items-center gap-2 text-sm">
              <div className="rounded-lg bg-amber-500/10 p-1.5">
                <Clock className="h-4 w-4 text-amber-500" />
              </div>
              <span className="font-bold text-amber-500">
                {stats?.pending ?? 0}
              </span>
              <span className="text-zinc-400">Pending</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="rounded-lg bg-blue-500/10 p-1.5">
                <CheckCircle className="h-4 w-4 text-blue-500" />
              </div>
              <span className="font-bold text-blue-500">
                {stats?.verified ?? 0}
              </span>
              <span className="text-zinc-400">Verified</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="rounded-lg bg-green-500/10 p-1.5">
                <ImageIcon className="h-4 w-4 text-green-500" />
              </div>
              <span className="font-bold text-green-500">
                {stats?.total ?? 0}
              </span>
              <span className="text-zinc-400">Total</span>
            </div>
          </div>

          {viewMode === "single" ? (
            <Card className="border-green-900/30 bg-[#121213] p-6">
              {pendingImages && pendingImages.length > 0 && currentImage ? (
                <div className="space-y-6">
                  <div className="relative h-[400px] overflow-hidden rounded-lg">
                    <Image
                      src={currentImage.url}
                      alt="Dog submission"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex justify-between gap-4">
                    <Button
                      onClick={() =>
                        handleImageDecision(currentImage.name, "reject")
                      }
                      variant="destructive"
                      className="w-full py-6"
                      disabled={decisions.some(
                        (d) =>
                          d.filename === currentImage.name &&
                          d.action === "reject",
                      )}
                    >
                      {decisions.some(
                        (d) =>
                          d.filename === currentImage.name &&
                          d.action === "reject",
                      )
                        ? "Rejecting..."
                        : "Reject"}
                    </Button>
                    <Button
                      onClick={() =>
                        handleImageDecision(currentImage.name, "approve")
                      }
                      className="w-full bg-blue-600 py-6 hover:bg-blue-700"
                      disabled={decisions.some(
                        (d) =>
                          d.filename === currentImage.name &&
                          d.action === "approve",
                      )}
                    >
                      {decisions.some(
                        (d) =>
                          d.filename === currentImage.name &&
                          d.action === "approve",
                      )
                        ? "Approving..."
                        : "Approve"}
                    </Button>
                  </div>
                  <div className="mt-2 space-y-1 text-sm text-zinc-400">
                    <p className="font-medium">Breed: {currentImage.breed}</p>
                    <p className="text-xs">
                      Submitted by: {currentImage.submittedBy}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-zinc-400">
                  No pending submissions
                </div>
              )}
            </Card>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {pendingImages?.map((image, index) => (
                <Card
                  key={image.name}
                  className="flex flex-col border-green-900/30 bg-[#121213] p-3"
                >
                  <div className="relative mb-2 h-36 overflow-hidden rounded-lg">
                    <Image
                      src={image.url}
                      alt="Dog submission"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="mb-2 text-sm text-zinc-400">
                    <p className="truncate font-medium">Breed: {image.breed}</p>
                    <p className="truncate text-xs">By: {image.submittedBy}</p>
                  </div>
                  <div className="mt-auto flex gap-1">
                    <Button
                      onClick={() => handleImageDecision(image.name, "reject")}
                      variant="destructive"
                      size="sm"
                      className="h-6 flex-1 px-1 text-[10px]"
                      disabled={decisions.some(
                        (d) =>
                          d.filename === image.name && d.action === "reject",
                      )}
                    >
                      ✕
                    </Button>
                    <Button
                      onClick={() => handleImageDecision(image.name, "approve")}
                      size="sm"
                      className="h-6 flex-1 bg-blue-600 px-1 text-[10px] hover:bg-blue-700"
                      disabled={decisions.some(
                        (d) =>
                          d.filename === image.name && d.action === "approve",
                      )}
                    >
                      ✓
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Fixed Submit Changes Button */}
          {decisions.length > 0 && (
            <div className="fixed bottom-8 right-8 z-10">
              <Button
                onClick={handleSubmitChanges}
                className="bg-green-600 hover:bg-green-700"
              >
                Submit Changes ({decisions.length})
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
