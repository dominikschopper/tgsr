// Timer utility functions

export function formatTime(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function calculateTimeRemaining(endsAt: number): number {
  const now = Date.now();
  const remaining = endsAt - now;
  return remaining > 0 ? remaining : 0;
}

export function isTimeWarning(remaining: number): boolean {
  // Warning state if less than 30 seconds remaining
  return remaining < 30000;
}
