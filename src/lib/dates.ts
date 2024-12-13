const PST_OFFSET = -8; // PST is UTC-8

export function getNextGameTime(): Date {
  const now = new Date();
  const pstDate = new Date(now.getTime() + PST_OFFSET * 60 * 60 * 1000);
  const tomorrow = new Date(pstDate);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  // Convert back to UTC
  return new Date(tomorrow.getTime() - PST_OFFSET * 60 * 60 * 1000);
}

export function canPlayToday(lastPlayedAt: Date | null): boolean {
  // If no last play, they can definitely play
  if (!lastPlayedAt) return true;

  const now = new Date();
  const pstNow = new Date(now.getTime() + PST_OFFSET * 60 * 60 * 1000);
  const lastPlayedPST = new Date(
    lastPlayedAt.getTime() + PST_OFFSET * 60 * 60 * 1000,
  );

  // If it's a different day in PST, they can play
  if (
    pstNow.getDate() !== lastPlayedPST.getDate() ||
    pstNow.getMonth() !== lastPlayedPST.getMonth() ||
    pstNow.getFullYear() !== lastPlayedPST.getFullYear()
  ) {
    return true;
  }

  // If it's the same day, they can still play unless they've used all their plays
  // (this is handled by the playsToday count in the router)
  return true;
}
