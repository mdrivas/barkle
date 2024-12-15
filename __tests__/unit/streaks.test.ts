import { describe, it, expect } from "vitest";
import { toPST, isConsecutiveDay } from "~/lib/streaks";

describe("Streak utilities", () => {
  describe("toPST", () => {
    it("converts UTC to PST", () => {
      // Create a fixed UTC date: 2024-01-15 08:00:00 UTC
      const utcDate = new Date("2024-01-15T08:00:00Z");
      const pstDate = toPST(utcDate);
      
      // Should be midnight (00:00) PST on the same day
      expect(pstDate.hour).toBe(0);
      expect(pstDate.day).toBe(15);
    });
  });

  describe("isConsecutiveDay", () => {
    it("returns false when previous date is null", () => {
      const currentDate = new Date();
      expect(isConsecutiveDay(null, currentDate)).toBe(false);
    });

    it("identifies consecutive days correctly", () => {
      // Jan 15, 2024 5:00 PM PST (Jan 16, 1:00 AM UTC)
      const prevDate = new Date("2024-01-16T01:00:00Z");
      // Jan 16, 2024 5:00 PM PST (Jan 17, 1:00 AM UTC)
      const currentDate = new Date("2024-01-17T01:00:00Z");
      
      expect(isConsecutiveDay(prevDate, currentDate)).toBe(true);
    });

    it("handles non-consecutive days", () => {
      // Jan 15, 2024 5:00 PM PST
      const prevDate = new Date("2024-01-16T01:00:00Z");
      // Jan 17, 2024 5:00 PM PST (skips a day)
      const twoDaysLater = new Date("2024-01-18T01:00:00Z");
      
      expect(isConsecutiveDay(prevDate, twoDaysLater)).toBe(false);
    });

    it("handles same-day plays", () => {
      // Jan 15, 2024 5:00 PM PST
      const firstPlay = new Date("2024-01-16T01:00:00Z");
      // Jan 15, 2024 8:00 PM PST
      const secondPlay = new Date("2024-01-16T04:00:00Z");
      
      expect(isConsecutiveDay(firstPlay, secondPlay)).toBe(false);
    });

    it("handles midnight PST edge case", () => {
      // Jan 15, 2024 11:59 PM PST
      const prevDate = new Date("2024-01-16T07:59:00Z");
      // Jan 16, 2024 12:01 AM PST
      const currentDate = new Date("2024-01-16T08:01:00Z");
      
      expect(isConsecutiveDay(prevDate, currentDate)).toBe(true);
    });
  });
});
