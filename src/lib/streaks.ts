import { DateTime } from "luxon";

export const toPST = (date: Date) => {
  return DateTime.fromJSDate(date).setZone("America/Los_Angeles");
};

export const isConsecutiveDay = (prevDate: Date | null, currentDate: Date) => {
  if (!prevDate) return false;
  
  const prev = toPST(prevDate);
  const current = toPST(currentDate);
  
  // Get dates in PST, ignoring time
  const prevDay = prev.startOf('day');
  const currentDay = current.startOf('day');
  
  // Calculate the difference in days
  const diffInDays = Math.round(currentDay.diff(prevDay, 'days').days);
  
  // Return true only if the difference is exactly 1 day
  return diffInDays === 1;
};

export function isSameDay(date1: Date | null, date2: Date): boolean {
  if (!date1) return false;
  return toPST(date1).hasSame(toPST(date2), 'day');
}
