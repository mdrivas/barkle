import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { Poppins } from "next/font/google";
import { type Metadata } from "next";

import { TRPCReactProvider } from "~/trpc/react";
import { Toaster } from "~/components/ui/toaster";
import { AuthProvider } from "./components/AuthProvider";
import { Suspense } from "react";
import { TooltipProvider } from "~/components/ui/tooltip";
import { GoogleAnalytics } from "./components/GoogleAnalytics"; // Add this import
import { ProfileProvider } from "./components/ProfileProvider";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Barkle - The Daily Dog Breed Game",
  description: "Test your dog breed knowledge with Barkle, a daily puzzle game featuring dog breeds from around the world. Play daily challenges and compete on the leaderboard!",
  metadataBase: new URL('https://barkle.vercel.app'),
  keywords: ["dog breeds", "dog game", "daily puzzle", "breed quiz", "dog breeds game", "Barkle", "dog breed quiz", "Worde for dogs"],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: "XPs4Q8Krq-JDjZPb_UHTJA33SYJ6HRLNuTlYkbimI9Y",
  },
  alternates: {
    canonical: 'https://barkle.vercel.app',
  },
  openGraph: {
    type: "website",
    url: "https://barkle.vercel.app",
    title: "Barkle",
    description: "The Daily Dog Breed Game",
    images: [
      {
        url: "/icon-512.png",
        width: 1200,
        height: 630,
        alt: "Barkle Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@yourtwitterhandle",
    title: "Barkle",
    description: "The Daily Dog Breed Game",
    images: ["/icon-512.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${poppins.variable}`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta 
          name="google-adsense-account"
          content="ca-pub-8788092045781561"
        />
        <meta 
          name="google-site-verification" 
          content="XPs4Q8Krq-JDjZPb_UHTJA33SYJ6HRLNuTlYkbimI9Y" 
        />
      </head>
      <body className="min-h-screen bg-[#121213]">
        {process.env.NODE_ENV === "production" && <GoogleAnalytics />}
        <TooltipProvider>
          <AuthProvider>
            <Toaster />
            <TRPCReactProvider>
              <ProfileProvider>
                <div className="flex min-h-screen flex-col">
                  <main className="flex-1 pb-8">
                    <Suspense
                      fallback={
                        <div className="flex min-h-screen items-center justify-center">
                          <div className="h-32 w-32 animate-spin rounded-full border-t-2 border-emerald-500" />
                        </div>
                      }
                    >
                      {children}
                    </Suspense>
                  </main>
                </div>
              </ProfileProvider>
            </TRPCReactProvider>
          </AuthProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
