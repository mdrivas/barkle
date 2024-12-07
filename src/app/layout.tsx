import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { Poppins } from "next/font/google";
import { type Metadata } from "next";

import { TRPCReactProvider } from "~/trpc/react";
import { Toaster } from "~/components/ui/toaster";
import { AuthProvider } from "./components/AuthProvider";
import { Suspense } from "react";
import { TooltipProvider } from "~/components/ui/tooltip"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Barkle",
  description: "Dog breed guessing game",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${poppins.variable}`}>
      <body>
        <TooltipProvider>
          <AuthProvider>
            <Toaster />
            <TRPCReactProvider>
              <Suspense>
                {children}
              </Suspense>
            </TRPCReactProvider>
          </AuthProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
