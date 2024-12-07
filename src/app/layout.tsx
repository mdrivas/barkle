import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import { TRPCReactProvider } from "~/trpc/react";
import { Toaster } from "~/components/ui/toaster";
import { AuthProvider } from "./components/AuthProvider";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Podivate",
  description: "Podcast creation made easy",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body>
        <AuthProvider>
          <Toaster />
          <TRPCReactProvider>
            <Suspense>
              {children}
            </Suspense>
          </TRPCReactProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
