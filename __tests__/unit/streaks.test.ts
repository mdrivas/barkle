import { describe, it, expect } from "vitest";
import { toPST, isConsecutiveDay } from "~/lib/streaks";

describe("Streak utilities", () => {
  describe("toPST", () => {
    it("converts UTC to PST", () => {
      // Create a fixed UTC date: 2024-01-15 08:00:00 UTC
      const utcDate = new Date("2024-01-15T08:00:00Z");
      const pstDate = toPST(utcDate);
      
      expect(pstDate.hour).toBe(0);
      expect(pstDate.day).toBe(15);
    });

    it("handles daylight saving time correctly", () => {
      // Test during DST (e.g., summer)
      const dstDate = new Date("2024-07-15T07:00:00Z");
      const pstDateDST = toPST(dstDate);
      expect(pstDateDST.hour).toBe(0);
      
      // Test outside DST (e.g., winter)
      const nonDstDate = new Date("2024-01-15T08:00:00Z");
      const pstDateNonDST = toPST(nonDstDate);
      expect(pstDateNonDST.hour).toBe(0);
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

    // New test cases
    it("handles DST transition days", () => {
      // Day before DST transition (March 9, 2024 5:00 PM PST)
      const beforeDST = new Date("2024-03-10T01:00:00Z");
      // Day of DST transition (March 10, 2024 5:00 PM PDT)
      const duringDST = new Date("2024-03-11T00:00:00Z");
      
      expect(isConsecutiveDay(beforeDST, duringDST)).toBe(true);
    });

    it("handles end of month transitions", () => {
      // Jan 31, 2024 5:00 PM PST
      const endOfMonth = new Date("2024-02-01T01:00:00Z");
      // Feb 1, 2024 5:00 PM PST
      const startOfMonth = new Date("2024-02-02T01:00:00Z");
      
      expect(isConsecutiveDay(endOfMonth, startOfMonth)).toBe(true);
    });

    it("handles leap year transition", () => {
      // Feb 28, 2024 5:00 PM PST
      const beforeLeapDay = new Date("2024-02-29T01:00:00Z");
      // Feb 29, 2024 5:00 PM PST
      const leapDay = new Date("2024-03-01T01:00:00Z");
      
      expect(isConsecutiveDay(beforeLeapDay, leapDay)).toBe(true);
    });

    it("handles year transition", () => {
      // Dec 31, 2024 5:00 PM PST
      const endOfYear = new Date("2025-01-01T01:00:00Z");
      // Jan 1, 2025 5:00 PM PST
      const startOfYear = new Date("2025-01-02T01:00:00Z");
      
      expect(isConsecutiveDay(endOfYear, startOfYear)).toBe(true);
    });

    it("rejects more than one day difference", () => {
      // Test various intervals greater than 1 day
      const baseDate = new Date("2024-01-16T01:00:00Z");
      const twoDays = new Date("2024-01-18T01:00:00Z");
      const threeDays = new Date("2024-01-19T01:00:00Z");
      const oneWeek = new Date("2024-01-23T01:00:00Z");
      
      expect(isConsecutiveDay(baseDate, twoDays)).toBe(false);
      expect(isConsecutiveDay(baseDate, threeDays)).toBe(false);
      expect(isConsecutiveDay(baseDate, oneWeek)).toBe(false);
    });

    it("handles different times on consecutive days", () => {
      // Jan 15, 2024 1:00 PM PST
      const earlyPlay = new Date("2024-01-15T21:00:00Z");
      // Jan 16, 2024 11:00 PM PST
      const latePlay = new Date("2024-01-17T07:00:00Z");
      
      expect(isConsecutiveDay(earlyPlay, latePlay)).toBe(true);
    });
  });
});
