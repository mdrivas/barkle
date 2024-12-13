import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock tRPC mutations and queries
vi.mock("~/trpc/react", () => ({
  api: {
    score: {
      canPlayToday: {
        useQuery: vi.fn(() => ({
          data: { canPlay: true },
          isLoading: false,
        })),
      },
      getTodayScore: {
        useQuery: vi.fn(() => ({
          data: { score: 3, results: "1,1,1,0,0" },

          isLoading: false,
        })),
      },
      saveScore: {
        useMutation: () => ({
          mutate: vi.fn(),
          isSuccess: false,
        }),
      },
    },
    game: {
      getDailyBreeds: {
        useQuery: vi.fn(() => ({
          data: {
            breeds: JSON.stringify([{ breed: "labrador", imageUrl: "url" }]),
            date: "2023-10-10",
          },
          isLoading: false,
        })),
      },
    },
    createClient: () => ({}),
    Provider: ({ children }: { children: React.ReactNode }) => children,
  },
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(),
  }),
}));

// Mock next-auth
vi.mock("next-auth/react", () => ({
  useSession: () => ({
    data: null,
    status: "unauthenticated",
  }),
  signIn: vi.fn(),
  signOut: vi.fn(),
}));
