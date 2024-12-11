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
  action: 'approve' | 'reject';
}

export default function AdminPage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>("single");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [decisions, setDecisions] = useState<ImageDecision[]>([]);
  const utils = api.useUtils();
  
  const { data: isAdmin, isLoading } = api.user.isAdmin.useQuery();
  const { data: pendingImages, refetch } = api.admin.getPendingImages.useQuery();
  const { data: stats } = api.admin.getStats.useQuery();

  // Move hooks above any conditional returns
  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push('/');
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

  const handleImageDecision = (filename: string, action: 'approve' | 'reject') => {
    setDecisions(prev => [...prev, { filename, action }]);
    // Move to next image
    if (currentIndex >= (pendingImages?.length ?? 0) - 1) {
      setCurrentIndex(0);
    } else {
      setCurrentIndex(prev => prev + 1);
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
        <h1 className="text-xl font-bold text-green-500 mb-8 text-center">Dog Photo Review Dashboard</h1>
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2 items-center">
              <span className="text-sm text-zinc-400 mr-2">Display:</span>
              <Button
                variant="ghost"
                onClick={() => setViewMode("single")}
                className={viewMode === "single" ? "text-green-500" : "text-zinc-400"}
              >
                <List className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                onClick={() => setViewMode("grid")}
                className={viewMode === "grid" ? "text-green-500" : "text-zinc-400"}
              >
                <Grid className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="flex gap-4 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <div className="p-1.5 bg-amber-500/10 rounded-lg">
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <span className="text-amber-500 font-bold">{stats?.pending ?? 0}</span>
              <span className="text-zinc-400">Pending</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="p-1.5 bg-blue-500/10 rounded-lg">
                <CheckCircle className="w-4 h-4 text-blue-500" />
              </div>
              <span className="text-blue-500 font-bold">{stats?.verified ?? 0}</span>
              <span className="text-zinc-400">Verified</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="p-1.5 bg-green-500/10 rounded-lg">
                <ImageIcon className="w-4 h-4 text-green-500" />
              </div>
              <span className="text-green-500 font-bold">{stats?.total ?? 0}</span>
              <span className="text-zinc-400">Total</span>
            </div>
          </div>

          {viewMode === "single" ? (
            <Card className="p-6 bg-[#121213] border-green-900/30">
              {pendingImages && pendingImages.length > 0 && currentImage ? (
                <div className="space-y-6">
                  <div className="relative h-[400px] rounded-lg overflow-hidden">
                    <Image
                      src={currentImage.url}
                      alt="Dog submission"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex justify-between gap-4">
                    <Button
                      onClick={() => handleImageDecision(currentImage.name, 'reject')}
                      variant="destructive"
                      className="w-full py-6"
                      disabled={decisions.some(d => d.filename === currentImage.name && d.action === 'reject')}
                    >
                      {decisions.some(d => d.filename === currentImage.name && d.action === 'reject') ? "Rejecting..." : "Reject"}
                    </Button>
                    <Button
                      onClick={() => handleImageDecision(currentImage.name, 'approve')}
                      className="w-full py-6 bg-blue-600 hover:bg-blue-700"
                      disabled={decisions.some(d => d.filename === currentImage.name && d.action === 'approve')}
                    >
                      {decisions.some(d => d.filename === currentImage.name && d.action === 'approve') ? "Approving..." : "Approve"}
                    </Button>
                  </div>
                  <div className="text-sm text-zinc-400 mt-2 space-y-1">
                    <p className="font-medium">Breed: {currentImage.breed}</p>
                    <p className="text-xs">Submitted by: {currentImage.submittedBy}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center text-zinc-400 py-12">
                  No pending submissions
                </div>
              )}
            </Card>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {pendingImages?.map((image, index) => (
                <Card
                  key={image.name}
                  className="p-3 bg-[#121213] border-green-900/30 flex flex-col"
                >
                  <div className="relative h-36 rounded-lg overflow-hidden mb-2">
                    <Image
                      src={image.url}
                      alt="Dog submission"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="text-sm text-zinc-400 mb-2">
                    <p className="font-medium truncate">Breed: {image.breed}</p>
                    <p className="text-xs truncate">By: {image.submittedBy}</p>
                  </div>
                  <div className="flex gap-1 mt-auto">
                    <Button
                      onClick={() => handleImageDecision(image.name, 'reject')}
                      variant="destructive"
                      size="sm"
                      className="flex-1 h-6 text-[10px] px-1"
                      disabled={decisions.some(d => d.filename === image.name && d.action === 'reject')}
                    >
                      ✕
                    </Button>
                    <Button
                      onClick={() => handleImageDecision(image.name, 'approve')}
                      size="sm"
                      className="flex-1 h-6 text-[10px] px-1 bg-blue-600 hover:bg-blue-700"
                      disabled={decisions.some(d => d.filename === image.name && d.action === 'approve')}
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