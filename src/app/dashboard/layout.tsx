"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import LoadingSkeleton from "../components/LoadingSkeleton";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();

  const { status } = useSession();

  useEffect(() => {
    if (status !== "loading" && status !== "authenticated") {
      router.push("/");
    }
  }, [router, status]);

  if (status === "loading") {
    return <LoadingSkeleton />;
  }

  return <>{children}</>;
}
