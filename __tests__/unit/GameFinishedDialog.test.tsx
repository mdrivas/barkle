import { render, screen } from "@testing-library/react";
import { GameFinishedDialog } from "~/app/daily/components/GameFinishedDialog";
import { describe, it, expect, vi } from "vitest";
import { TestWrapper } from "../utils/TestWrapper";

describe("GameFinishedDialog", () => {
  it("renders correct score", () => {
    render(
      <TestWrapper>
        <GameFinishedDialog
          isOpen={true}
          score={3}
          questionResults={[true, true, true, false, false]}
          onClose={() => {}}
        />
      </TestWrapper>,
    );

    const scoreText = screen.getByText((content) => {
      return content.includes("3") && content.includes("Points");
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
          onClose={() => {}}
        />
      </TestWrapper>,
    );

    expect(screen.getByText(/Continue with Google/i)).toBeInTheDocument();
  });
});
