import { render, screen } from "@testing-library/react";
import DailyGame from "~/app/daily/page";
import { describe, it, expect, vi } from "vitest";
import { TestWrapper } from "../utils/TestWrapper";

// Mock the tRPC hooks
vi.mock("~/trpc/react", () => ({
  api: {
    profile: {
      migrateOrCreateProfile: {
        useMutation: () => ({
          mutate: vi.fn(),
          isLoading: false
        })
      },
      getProfile: {
        useQuery: () => ({
          data: null,
          isLoading: false,
          isFetched: true,
          refetch: vi.fn()
        })
      },
      createTempProfile: {
        useMutation: () => ({
          mutate: vi.fn(),
          isLoading: false
        })
      },
      attachUserId: {
        useMutation: () => ({
          mutate: vi.fn(),
          isLoading: false
        })
      },
      setUsername: {
        useMutation: () => ({
          mutate: vi.fn(),
          isLoading: false
        })
      },
      updateUsername: {
        useMutation: () => ({
          mutate: vi.fn(),
          isLoading: false
        })
      },
      updateProfileImage: {
        useMutation: () => ({
          mutate: vi.fn(),
          isLoading: false
        })
      },
      isAdmin: {
        useQuery: () => ({
          data: false,
          isLoading: false
        })
      },
      needsUsername: {
        useQuery: () => ({
          data: { needsUsername: false, isNewUser: false },
          isLoading: false
        })
      }
    },
    score: {
      canPlayToday: {
        useQuery: () => ({
          data: { canPlay: true },
          isLoading: false
        })
      },
      saveScore: {
        useMutation: () => ({
          mutate: vi.fn(),
          isLoading: false
        })
      },
      getTodayScore: {
        useQuery: () => ({
          data: null,
          isLoading: false
        })
      },
      getCurrentStreak: {
        useQuery: () => ({
          data: 0,
          isLoading: false
        })
      },
      getDailyLeaderboard: {
        useQuery: () => ({
          data: [],
          isLoading: false
        })
      },
      getPawsistenceLeaderboard: {
        useQuery: () => ({
          data: [],
          isLoading: false
        })
      },
      getBarkleStats: {
        useQuery: () => ({
          data: {
            gamesPlayed: 0,
            dailyStreak: 0,
            currentGuessStreak: 0,
            highestGuessStreak: 0
          },
          isLoading: false
        })
      },
      getPawsistenceStats: {
        useQuery: () => ({
          data: {
            currentStreak: 0,
            bestStreak: 0,
            playsToday: 0
          },
          isLoading: false
        })
      }
    },
    game: {
      getDailyBreeds: {
        useQuery: () => ({
          data: {
            breeds: JSON.stringify([
              { breed: "labrador", imageUrl: "/test.jpg", type: "api" },
            ]),
          },
          isLoading: false,
        })
      }
    }
  }
}));

vi.mock("next-auth/react", () => ({
  useSession: () => ({ data: null, status: "unauthenticated" }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => ({ get: () => null }),
}));

describe("DailyGame", () => {
  it("renders initial game state", () => {
    render(
      <TestWrapper>
        <DailyGame />
      </TestWrapper>,
    );
    expect(screen.getByText("Barkle")).toBeInTheDocument();
  });

  it("shows initial score of 0/5", () => {
    render(
      <TestWrapper>
        <DailyGame />
      </TestWrapper>,
    );
    expect(screen.getByText("0/5")).toBeInTheDocument();
  });
});
