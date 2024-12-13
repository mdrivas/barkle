"use client";

import { useSession } from "next-auth/react";
import { createContext, useContext, useEffect, useState } from "react";
import { api } from "~/trpc/react";

const TEMP_ID_KEY = "barkle_temp_id";

type ProfileContextType = {
  tempId: string | null;
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function useProfileContext() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error("useTempId must be used within a ProfileProvider");
  }
  return context;
}

export function ProfileProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { data: session, status } = useSession();
  const [isInitialized, setIsInitialized] = useState(false);
  const [tempId, setTempId] = useState<string | null>(null);

  const { mutate: migrateOrCreateProfile } =
    api.profile.migrateOrCreateProfile.useMutation({
      onSettled: () => {
        setIsInitialized(true);
      },
    });

  useEffect(() => {
    const initializeProfile = async () => {
      if (isInitialized) return;
      if (status === "loading") return;

      const existingTempId = localStorage.getItem(TEMP_ID_KEY);

      if (session?.user) {
        if (existingTempId) {
          migrateOrCreateProfile(
            { tempId: existingTempId },
            {
              onSuccess: () => {
                localStorage.removeItem(TEMP_ID_KEY);
                setTempId(null);
              },
            },
          );
        } else {
          setIsInitialized(true);
        }
      } else {
        if (!existingTempId) {
          const newTempId = crypto.randomUUID();
          localStorage.setItem(TEMP_ID_KEY, newTempId);
          setTempId(newTempId);
        } else {
          setTempId(existingTempId);
        }
        setIsInitialized(true);
      }
    };

    void initializeProfile();
  }, [session, status, migrateOrCreateProfile, isInitialized]);

  if (!isInitialized) {
    return null;
  }

  return (
    <ProfileContext.Provider value={{ tempId }}>
      {children}
    </ProfileContext.Provider>
  );
}
