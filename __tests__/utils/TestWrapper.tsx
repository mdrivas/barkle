import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createTRPCReact, httpBatchLink } from "@trpc/react-query";
import { useState } from "react";
import superjson from "superjson";
import { type AppRouter } from "~/server/api/root";
import { ProfileProvider } from "~/app/components/ProfileProvider";
import { vi } from 'vitest';

// Create a mock TRPC client
export const api = createTRPCReact<AppRouter>();

// Mock the profile mutation
const mockProfileMutation = {
  mutate: () => void 0,
  isLoading: false,
};

// Mock the TRPC hooks
vi.mock("~/trpc/react", () => ({
  api: {
    profile: {
      migrateOrCreateProfile: {
        useMutation: () => mockProfileMutation,
      },
    },
  },
}));

export function TestWrapper({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
          },
        },
      }),
  );

  const [trpcClient] = useState(() =>
    api.createClient({
      links: [
        httpBatchLink({
          url: "http://localhost:3000/api/trpc",
          transformer: superjson,
        }),
      ],
    }),
  );

  return (
    <api.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <ProfileProvider>
          {children}
        </ProfileProvider>
      </QueryClientProvider>
    </api.Provider>
  );
}
