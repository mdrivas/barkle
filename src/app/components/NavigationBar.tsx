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
    <nav className="sticky top-0 z-50 w-full border-b border-zinc-600/20 bg-gradient-to-br from-[#1e2c3d] to-[#141c2a]">
      <div className="mx-auto max-w-7xl">
        <div className="flex w-full justify-end gap-2 px-3 py-1.5 text-[10px] text-zinc-300 [&>*]:transition-colors [&>*]:hover:text-zinc-100">
          {isAdmin ? (
            <>
              <Link href="/" className="text-[10px] font-normal text-zinc-300 hover:text-zinc-100">
                Home
              </Link>
              <span className="text-zinc-600">|</span>
              <Link href="/admin" className="text-[10px] font-normal text-zinc-300 hover:text-zinc-100">
                Admin
              </Link>
              <span className="text-zinc-600">|</span>
              <Link href="/preview" className="text-[10px] font-normal text-zinc-300 hover:text-zinc-100">
                QR Code
              </Link>
              <span className="text-zinc-600">|</span>
            </>
          ) : (
            <>
              <Link 
                href="https://www.instagram.com/barkledailyy" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-300 hover:text-zinc-100"
              >
                <Instagram className="h-3 w-3" />
              </Link>
              <span className="text-zinc-600">|</span>
              <Link 
                href="https://www.tiktok.com/@barkleapp" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-300 hover:text-zinc-100"
              >
                <TiktokIcon className="h-3 w-3" />
              </Link>
              <span className="text-zinc-600">|</span>
            </>
          )}
          {navItems.map(({ Component }, index) => (
            <React.Fragment key={index}>
              {index > 0 && <span className="text-zinc-600">|</span>}
              <div className="[&>*]:!p-0 [&>*]:!text-[10px] [&>*]:!font-normal [&>*]:!text-zinc-300 [&>*:hover]:!text-zinc-100">
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
