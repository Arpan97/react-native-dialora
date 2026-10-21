import { describe, expect, it } from '@jest/globals';
import {
  angleToHours,
  angleToMinutes,
  formatTime,
  getHourHandAngle,
  getMinuteHandAngle,
  normalizeAngle,
  pointerToAngle,
  resolveHourPeriod,
  roundMinutes,
  setTimeOnDate,
  toggleHourPeriod,
} from '../utils/clockUtils';

describe('clockUtils', () => {
  describe('normalizeAngle', () => {
    it('normalizes negative angles and angles greater than 360', () => {
      expect(normalizeAngle(0)).toBe(0);
      expect(normalizeAngle(360)).toBe(0);
      expect(normalizeAngle(720)).toBe(0);
      expect(normalizeAngle(-90)).toBe(270);
      expect(normalizeAngle(-1)).toBe(359);
      expect(normalizeAngle(450)).toBe(90);
      expect(normalizeAngle(NaN)).toBe(0);
      expect(normalizeAngle(Infinity)).toBe(0);
    });
  });

  describe('Hour-hand angle calculations', () => {
    it('calculates discrete and continuous hour angles correctly', () => {
      // 12 o'clock = 0 deg
      expect(getHourHandAngle(12, 0, false)).toBe(0);
      expect(getHourHandAngle(0, 0, false)).toBe(0);

      // 3 o'clock = 90 deg
      expect(getHourHandAngle(3, 0, false)).toBe(90);
      expect(getHourHandAngle(15, 0, false)).toBe(90);

      // 6 o'clock = 180 deg
      expect(getHourHandAngle(6, 0, false)).toBe(180);

      // 9 o'clock = 270 deg
      expect(getHourHandAngle(9, 0, false)).toBe(270);

      // Continuous hour hand at 3:30 (should be halfway between 3 and 4 -> 90 + 15 = 105 deg)
      expect(getHourHandAngle(3, 30, true)).toBe(105);

      // Continuous hour hand at 11:30 (should be 330 + 15 = 345 deg)
      expect(getHourHandAngle(11, 30, true)).toBe(345);

      // Handles invalid inputs safely
      expect(getHourHandAngle(NaN, NaN)).toBe(0);
    });
  });

  describe('Minute-hand angle calculations', () => {
    it('calculates minute angles correctly', () => {
      expect(getMinuteHandAngle(0)).toBe(0);
      expect(getMinuteHandAngle(15)).toBe(90);
      expect(getMinuteHandAngle(30)).toBe(180);
      expect(getMinuteHandAngle(45)).toBe(270);
      expect(getMinuteHandAngle(60)).toBe(0);

      // Continuous with seconds: 30 minutes + 30 seconds = 180 + 3 = 183 deg
      expect(getMinuteHandAngle(30, 30, true)).toBe(183);

      expect(getMinuteHandAngle(NaN)).toBe(0);
    });
  });

  describe('Pointer-to-angle conversion', () => {
    const center = 100;

    it('converts pointer positions into clockwise angles from 12 o clock', () => {
      // Top (12 o'clock): x = 100, y = 50 (deltaX = 0, deltaY = -50)
      expect(pointerToAngle(100, 50, center, center)).toBeCloseTo(0, 5);

      // Right (3 o'clock): x = 150, y = 100 (deltaX = 50, deltaY = 0)
      expect(pointerToAngle(150, 100, center, center)).toBeCloseTo(90, 5);

      // Bottom (6 o'clock): x = 100, y = 150 (deltaX = 0, deltaY = 50)
      expect(pointerToAngle(100, 150, center, center)).toBeCloseTo(180, 5);

      // Left (9 o'clock): x = 50, y = 100 (deltaX = -50, deltaY = 0)
      expect(pointerToAngle(50, 100, center, center)).toBeCloseTo(270, 5);

      // 1:30 position (45 deg): deltaX > 0, deltaY < 0
      expect(pointerToAngle(150, 50, center, center)).toBeCloseTo(45, 5);
    });

    it('handles invalid pointer coordinates and center singularity safely', () => {
      // Exactly at center returns null
      expect(pointerToAngle(center, center, center, center)).toBeNull();

      // NaN coordinates return null
      expect(pointerToAngle(NaN, 50, center, center)).toBeNull();
      expect(pointerToAngle(50, NaN, center, center)).toBeNull();
      expect(pointerToAngle(50, 50, NaN, center)).toBeNull();
      expect(pointerToAngle(Infinity, 50, center, center)).toBeNull();
    });
  });

  describe('Hour and minute selection from angle', () => {
    it('converts angles to 12-hour values', () => {
      expect(angleToHours(0)).toBe(12);
      expect(angleToHours(10)).toBe(12);
      expect(angleToHours(350)).toBe(12);
      expect(angleToHours(30)).toBe(1);
      expect(angleToHours(90)).toBe(3);
      expect(angleToHours(180)).toBe(6);
      expect(angleToHours(270)).toBe(9);
      expect(angleToHours(330)).toBe(11);
    });

    it('preserves AM/PM period when currentHour is provided', () => {
      // 3 o'clock in PM (currentHour = 14) -> returns 15 (3 PM)
      expect(angleToHours(90, 14)).toBe(15);

      // 3 o'clock in AM (currentHour = 2) -> returns 3 (3 AM)
      expect(angleToHours(90, 2)).toBe(3);

      // 12 o'clock in PM (currentHour = 13) -> returns 12 (12 PM / noon)
      expect(angleToHours(0, 13)).toBe(12);

      // 12 o'clock in AM (currentHour = 1) -> returns 0 (12 AM / midnight)
      expect(angleToHours(0, 1)).toBe(0);
    });

    it('converts angles to minute values', () => {
      expect(angleToMinutes(0)).toBe(0);
      expect(angleToMinutes(6)).toBe(1);
      expect(angleToMinutes(90)).toBe(15);
      expect(angleToMinutes(180)).toBe(30);
      expect(angleToMinutes(270)).toBe(45);
      expect(angleToMinutes(354)).toBe(59);
    });
  });

  describe('Minute rounding and interval handling', () => {
    it('rounds minutes to custom intervals (e.g. 5, 15)', () => {
      expect(roundMinutes(0, 5)).toBe(0);
      expect(roundMinutes(2, 5)).toBe(0);
      expect(roundMinutes(3, 5)).toBe(5);
      expect(roundMinutes(7, 5)).toBe(5);
      expect(roundMinutes(8, 5)).toBe(10);
      expect(roundMinutes(58, 5)).toBe(0); // 60 -> 0

      expect(roundMinutes(12, 15)).toBe(15);
      expect(roundMinutes(22, 15)).toBe(15);
      expect(roundMinutes(23, 15)).toBe(30);

      expect(roundMinutes(NaN, 5)).toBe(0);
    });

    it('angleToMinutes respects minute intervals', () => {
      // Angle around 7 minutes (42 deg) with interval 5 -> returns 5
      expect(angleToMinutes(42, 5)).toBe(5);
      // Angle around 8 minutes (48 deg) with interval 5 -> returns 10
      expect(angleToMinutes(48, 5)).toBe(10);
    });
  });

  describe('12-hour and 24-hour formatting, midnight and noon', () => {
    it('formats 12-hour time correctly with AM/PM', () => {
      expect(formatTime(0, 0, false)).toBe('12:00 AM'); // midnight
      expect(formatTime(0, 5, false)).toBe('12:05 AM');
      expect(formatTime(8, 45, false)).toBe('08:45 AM');
      expect(formatTime(11, 59, false)).toBe('11:59 AM');
      expect(formatTime(12, 0, false)).toBe('12:00 PM'); // noon
      expect(formatTime(12, 30, false)).toBe('12:30 PM');
      expect(formatTime(15, 30, false)).toBe('03:30 PM');
      expect(formatTime(23, 59, false)).toBe('11:59 PM');
    });

    it('formats 24-hour time correctly', () => {
      expect(formatTime(0, 0, true)).toBe('00:00'); // midnight
      expect(formatTime(8, 45, true)).toBe('08:45');
      expect(formatTime(12, 0, true)).toBe('12:00'); // noon
      expect(formatTime(15, 30, true)).toBe('15:30');
      expect(formatTime(23, 59, true)).toBe('23:59');
    });

    it('resolves period correctly', () => {
      expect(resolveHourPeriod(0)).toBe('AM');
      expect(resolveHourPeriod(11)).toBe('AM');
      expect(resolveHourPeriod(12)).toBe('PM');
      expect(resolveHourPeriod(23)).toBe('PM');
    });

    it('toggles hour period between AM and PM cleanly', () => {
      expect(toggleHourPeriod(0)).toBe(12); // 12 AM -> 12 PM
      expect(toggleHourPeriod(12)).toBe(0); // 12 PM -> 12 AM
      expect(toggleHourPeriod(8)).toBe(20); // 8 AM -> 8 PM
      expect(toggleHourPeriod(20)).toBe(8); // 8 PM -> 8 AM
    });
  });

  describe('Controlled time updates with setTimeOnDate', () => {
    it('returns a new Date with updated time while preserving calendar date', () => {
      const baseDate = new Date('2026-10-15T04:15:30.500Z');
      const year = baseDate.getFullYear();
      const month = baseDate.getMonth();
      const date = baseDate.getDate();

      const updated = setTimeOnDate(baseDate, 14, 45, 0);

      expect(updated).not.toBe(baseDate); // new instance
      expect(updated.getFullYear()).toBe(year);
      expect(updated.getMonth()).toBe(month);
      expect(updated.getDate()).toBe(date);
      expect(updated.getHours()).toBe(14);
      expect(updated.getMinutes()).toBe(45);
      expect(updated.getSeconds()).toBe(0);

      // Verify original date was not mutated
      expect(baseDate.getHours()).toBe(baseDate.getHours());
    });
  });
});
