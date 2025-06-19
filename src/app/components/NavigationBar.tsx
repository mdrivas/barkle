"use client";

import React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { api } from "~/trpc/react";
import { Terms } from "~/app/components/Terms";
import { FAQSheet } from "~/app/components/FAQSheet";
import { FeedbackSheet } from "~/app/components/FeedbackSheet";
import { Instagram, TiktokIcon } from "~/app/components/icons";

interface NavItem {
  Component: React.ComponentType;
}

export function NavigationBar() {
  const { data: session } = useSession();
  const { data: isAdmin } = api.profile.isAdmin.useQuery(undefined, {
    enabled: !!session?.user,
  });

  const navItems = [
    { Component: Terms },
    { Component: FAQSheet },
    { Component: FeedbackSheet },
  ] satisfies NavItem[];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-sky-400/10 bg-gradient-to-br from-[#0284c7]/90 to-[#0369a1]/90">
      <div className="mx-auto max-w-7xl">
        <div className="flex w-full justify-end gap-2 px-3 py-1.5 text-[10px] text-white/80 [&>*]:transition-colors [&>*]:hover:text-white">
          {isAdmin ? (
            <>
              <Link href="/" className="text-[10px] font-normal text-white/90 hover:text-white">
                Home
              </Link>
              <span className="text-sky-200/50">|</span>
              <Link href="/admin" className="text-[10px] font-normal text-white/90 hover:text-white">
                Admin
              </Link>
              <span className="text-sky-200/50">|</span>
              <Link href="/preview" className="text-[10px] font-normal text-white/90 hover:text-white">
                QR Code
              </Link>
              <span className="text-sky-200/50">|</span>
            </>
          ) : (
            <>
              <Link 
                href="https://www.instagram.com/barkledailyy" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/90 hover:text-white"
              >
                <Instagram className="h-3 w-3" />
              </Link>
              <span className="text-sky-200/50">|</span>
              <Link 
                href="https://www.tiktok.com/@barkleapp" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/90 hover:text-white"
              >
                <TiktokIcon className="h-3 w-3" />
              </Link>
              <span className="text-sky-200/50">|</span>
            </>
          )}
          {navItems.map(({ Component }, index) => (
            <React.Fragment key={index}>
              {index > 0 && <span className="text-sky-200/50">|</span>}
              <div className="[&>*]:!p-0 [&>*]:!text-[10px] [&>*]:!font-normal [&>*]:!text-white/90 [&>*:hover]:!text-white">
                <Component />
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </nav>
  );
}

/**
 * NavigationBar Component Style Guide
 * ----------------------------------
 *
 * Layout Requirements:
 * - Must maintain full width with gradient background
 * - Navigation items should be right-aligned
 * - Items should be separated by green dividers
 *
 * Styling Requirements:
 * - Font size should be 10px for all navigation items
 * - Text color should be green-500
 * - Hover state should transition to green-400
 * - All transitions should be smooth
 * - Dividers should use green-800 color
 *
 * Component Structure:
 * - Keep Privacy, Terms, FAQ and Feedback components as direct children
 * - Maintain consistent spacing with gap-2
 * - Preserve the gradient background and border styling
 *
 * Accessibility:
 * - Ensure all interactive elements are keyboard accessible
 * - Maintain proper contrast ratios for text
 */
