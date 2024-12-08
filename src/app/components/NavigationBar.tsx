"use client";

import React from "react";
import Link from "next/link";
import { signOut, useSession, signIn } from "next-auth/react";
import { Button } from "~/components/ui/button";
import { Terms } from "~/app/components/Terms";
import { Privacy } from "~/app/components/Privacy";
import { FAQSheet } from "~/app/components/FAQSheet";
import { FeedbackSheet } from "~/app/components/FeedbackSheet";

interface NavItem {
  Component: React.ComponentType;
}

export function NavigationBar() {
  const { status } = useSession();

  const navItems: NavItem[] = [
    { Component: Privacy },
    { Component: Terms },
    { Component: FAQSheet },
    { Component: FeedbackSheet },
  ];

  return (
    <nav className="w-full bg-gradient-to-br from-[#1a1a1b] to-[#121213] border-b border-green-900/30">
      <div className="max-w-7xl mx-auto">
        <div className="w-full px-3 py-1.5 flex justify-end gap-2 text-[10px] text-green-500 [&>*]:hover:text-green-400 [&>*]:transition-colors">
          {navItems.map(({ Component }, index) => (
            <React.Fragment key={index}>
              {index > 0 && <span className="text-green-800">|</span>}
              <div className="[&>*]:!text-[10px] [&>*]:!font-normal [&>*]:!p-0">
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
