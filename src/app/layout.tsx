import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { Poppins } from "next/font/google";
import { type Metadata } from "next";

import { TRPCReactProvider } from "~/trpc/react";
import { Toaster } from "~/components/ui/toaster";
import { AuthProvider } from "./components/AuthProvider";
import { Suspense } from "react";
import { TooltipProvider } from "~/components/ui/tooltip"
import { GoogleAnalytics } from "~/components/GoogleAnalytics"; // Add this import

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Barkle",
  description: "The Daily Dog Breed Game",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180" },
    ],
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
      </head>
      <body>
        {process.env.NODE_ENV === 'production' && <GoogleAnalytics />}
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