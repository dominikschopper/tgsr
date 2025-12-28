import { describe, it, expect } from 'vitest';
import { formatTime, calculateTimeRemaining, isTimeWarning } from './timer';

describe('timer utilities', () => {
  describe('formatTime', () => {
    it('should format zero milliseconds as 0:00', () => {
      expect(formatTime(0)).toBe('0:00');
    });

    it('should format seconds less than 60', () => {
      expect(formatTime(5000)).toBe('0:05');
      expect(formatTime(30000)).toBe('0:30');
      expect(formatTime(59000)).toBe('0:59');
    });

    it('should format exactly 60 seconds as 1:00', () => {
      expect(formatTime(60000)).toBe('1:00');
    });

    it('should format minutes and seconds correctly', () => {
      expect(formatTime(61000)).toBe('1:01');
      expect(formatTime(90000)).toBe('1:30');
      expect(formatTime(125000)).toBe('2:05');
    });

    it('should pad single-digit seconds with zero', () => {
      expect(formatTime(1000)).toBe('0:01');
      expect(formatTime(9000)).toBe('0:09');
      expect(formatTime(61000)).toBe('1:01');
    });

    it('should handle multi-minute durations', () => {
      expect(formatTime(180000)).toBe('3:00'); // 3 minutes
      expect(formatTime(300000)).toBe('5:00'); // 5 minutes
      expect(formatTime(299000)).toBe('4:59'); // 4:59
    });

    it('should floor partial seconds', () => {
      expect(formatTime(1500)).toBe('0:01'); // 1.5 seconds -> 1 second
      expect(formatTime(59999)).toBe('0:59'); // 59.999 seconds -> 59 seconds
    });
  });

  describe('calculateTimeRemaining', () => {
    it('should calculate remaining time correctly', () => {
      const now = Date.now();
      const futureTime = now + 60000; // 60 seconds in future

      const remaining = calculateTimeRemaining(futureTime);

      // Should be close to 60000ms (allow small margin for execution time)
      expect(remaining).toBeGreaterThanOrEqual(59900);
      expect(remaining).toBeLessThanOrEqual(60000);
    });

    it('should return 0 for past timestamps', () => {
      const now = Date.now();
      const pastTime = now - 5000; // 5 seconds ago

      expect(calculateTimeRemaining(pastTime)).toBe(0);
    });

    it('should return 0 for current time', () => {
      const now = Date.now();

      const remaining = calculateTimeRemaining(now);

      // Should be 0 or very close to 0
      expect(remaining).toBeLessThanOrEqual(10);
    });

    it('should handle large time differences', () => {
      const now = Date.now();
      const futureTime = now + 300000; // 5 minutes

      const remaining = calculateTimeRemaining(futureTime);

      expect(remaining).toBeGreaterThanOrEqual(299900);
      expect(remaining).toBeLessThanOrEqual(300000);
    });
  });

  describe('isTimeWarning', () => {
    it('should return true for less than 30 seconds', () => {
      expect(isTimeWarning(29999)).toBe(true);
      expect(isTimeWarning(15000)).toBe(true);
      expect(isTimeWarning(1000)).toBe(true);
      expect(isTimeWarning(0)).toBe(true);
    });

    it('should return false for 30 seconds or more', () => {
      expect(isTimeWarning(30000)).toBe(false);
      expect(isTimeWarning(30001)).toBe(false);
      expect(isTimeWarning(60000)).toBe(false);
      expect(isTimeWarning(300000)).toBe(false);
    });

    it('should handle edge case at exactly 30 seconds', () => {
      expect(isTimeWarning(30000)).toBe(false);
      expect(isTimeWarning(29999)).toBe(true);
    });
  });
});
