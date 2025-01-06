"use client";

import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { X } from "lucide-react";

export function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem("cookie-consent");
    if (!accepted) {
      setShowBanner(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("cookie-consent", "true");
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-900/95 border-t border-zinc-800 p-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <p className="text-sm text-zinc-300">
          We use cookies for essential game features and analytics. By continuing to use Barkle, you agree to our{" "}
          <button 
            onClick={() => (document.querySelector('[aria-label="Terms & Privacy"]') as HTMLElement)?.click()}
            className="text-green-500 hover:text-green-400 underline"
          >
            privacy policy
          </button>
          .
        </p>
        <div className="flex items-center gap-2">
          <Button
            onClick={acceptCookies}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 text-sm"
          >
            Accept
          </Button>
          <Button
            onClick={() => setShowBanner(false)}
            variant="ghost"
            size="icon"
            className="text-zinc-400 hover:text-zinc-300"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
} 