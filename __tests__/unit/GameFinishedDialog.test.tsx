import { render, screen } from "@testing-library/react";
import { GameFinishedDialog } from "~/app/daily/components/GameFinishedDialog";
import { describe, it, expect, vi } from "vitest";
import { TestWrapper } from "../utils/TestWrapper";

vi.mock("~/trpc/react", () => ({
  api: {
    profile: {
      migrateOrCreateProfile: {
        useMutation: () => ({
          mutate: () => void 0,
          isLoading: false
        })
      },
      getProfile: {
        useQuery: () => ({
          data: null,
          isLoading: false
        })
      }
    },
    score: {
      saveScore: {
        useMutation: () => ({
          mutate: () => void 0,
          isLoading: false
        })
      },
      getTodayScore: {
        useQuery: () => ({
          data: null,
          isLoading: false
        })
      }
    }
  }
}));

describe("GameFinishedDialog", () => {
  it("renders correct score", () => {
    render(
      <TestWrapper>
        <GameFinishedDialog
          isOpen={true}
          score={3}
          questionResults={[true, true, true, false, false]}
          onClose={vi.fn()}
        />
      </TestWrapper>,
    );

    const scoreText = screen.getByText((content) => {
      return content.includes("3/5");
    });

    expect(scoreText).toBeInTheDocument();
  });

  it("shows sign in button for unauthenticated users", () => {
    render(
      <TestWrapper>
        <GameFinishedDialog
          isOpen={true}
          score={3}
          questionResults={[true, true, true, false, false]}
          onClose={vi.fn()}
        />
      </TestWrapper>,
    );

    expect(screen.getByText(/Continue with Google/i)).toBeInTheDocument();
  });
});
