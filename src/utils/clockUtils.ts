/**
 * Pure, testable clock calculations and time conversion utilities.
 * All functions are timezone-independent and operate strictly on numeric hour/minute values.
 */

/**
 * Normalizes an angle in degrees into the [0, 360) range.
 */
export function normalizeAngle(degrees: number): number {
  if (isNaN(degrees) || !isFinite(degrees)) {
    return 0;
  }
  const mod = degrees % 360;
  return mod < 0 ? mod + 360 : mod;
}

/**
 * Calculates the hour hand angle in degrees (0° at 12 o'clock, clockwise).
 *
 * @param hours - Hour value (0-23 or 1-12)
 * @param minutes - Minute value (0-59)
 * @param continuous - When true, smooth interpolation based on minutes is applied
 */
export function getHourHandAngle(
  hours: number,
  minutes: number = 0,
  continuous: boolean = true
): number {
  const safeHours = isNaN(hours) ? 0 : hours;
  const safeMinutes = isNaN(minutes) ? 0 : Math.max(0, Math.min(59, minutes));

  const normalizedHour = safeHours % 12;
  const minuteOffset = continuous ? safeMinutes / 60 : 0;
  const degrees = (normalizedHour + minuteOffset) * 30;

  return normalizeAngle(degrees);
}

/**
 * Calculates the minute hand angle in degrees (0° at 12 o'clock, clockwise).
 *
 * @param minutes - Minute value (0-59)
 * @param seconds - Optional second value (0-59)
 * @param continuous - When true, smooth interpolation based on seconds is applied
 */
export function getMinuteHandAngle(
  minutes: number,
  seconds: number = 0,
  continuous: boolean = false
): number {
  const safeMinutes = isNaN(minutes) ? 0 : minutes;
  const safeSeconds = isNaN(seconds) ? 0 : Math.max(0, Math.min(59, seconds));

  const secondOffset = continuous ? safeSeconds / 60 : 0;
  const degrees = ((safeMinutes % 60) + secondOffset) * 6;

  return normalizeAngle(degrees);
}

/**
 * Converts a 2D pointer coordinate relative to the clock center into an angle in degrees
 * measuring clockwise from 12 o'clock (0° at top, 90° at 3, 180° at 6, 270° at 9).
 *
 * Returns null if coordinates are invalid or pointer is at the exact center.
 */
export function pointerToAngle(
  x: number,
  y: number,
  centerX: number,
  centerY: number
): number | null {
  if (
    isNaN(x) ||
    isNaN(y) ||
    isNaN(centerX) ||
    isNaN(centerY) ||
    !isFinite(x) ||
    !isFinite(y) ||
    !isFinite(centerX) ||
    !isFinite(centerY)
  ) {
    return null;
  }

  const deltaX = x - centerX;
  const deltaY = y - centerY;

  if (deltaX === 0 && deltaY === 0) {
    return null;
  }

  // Math.atan2(y, x) has 0 at 3 o'clock, positive clockwise in screen coordinates (y-down)
  // Adding 90 degrees rotates 0 to 12 o'clock (top)
  const rad = Math.atan2(deltaY, deltaX);
  const degrees = (rad * 180) / Math.PI + 90;

  return normalizeAngle(degrees);
}

/**
 * Converts a clock angle in degrees into an hour value (1-12 or 0-23).
 *
 * @param angle - Clock angle in degrees [0, 360)
 * @param currentHour - If provided, preserves whether the time is AM or PM
 * @param is24Hour - If true and currentHour is provided, formats in 24-hour range [0, 23]
 */
export function angleToHours(
  angle: number,
  currentHour?: number,
  is24Hour: boolean = false
): number {
  const normalized = normalizeAngle(angle);

  // Each hour occupies 30 degrees (360 / 12), centered on the hour tick
  const rawSector = Math.round(normalized / 30) % 12;
  const hour12 = rawSector === 0 ? 12 : rawSector;

  if (currentHour === undefined) {
    return is24Hour && hour12 === 12 ? 0 : hour12;
  }

  const isPM = currentHour >= 12;

  if (isPM) {
    return hour12 === 12 ? 12 : hour12 + 12;
  } else {
    return hour12 === 12 ? 0 : hour12;
  }
}

/**
 * Rounds a minute value to the specified interval (e.g. 1, 5, 15).
 */
export function roundMinutes(minutes: number, interval: number = 1): number {
  if (isNaN(minutes)) {
    return 0;
  }
  const safeInterval = Math.max(1, Math.min(30, Math.floor(interval)));
  const rounded = Math.round(minutes / safeInterval) * safeInterval;
  return rounded % 60;
}

/**
 * Converts a clock angle in degrees into a minute value [0, 59], rounded to minuteInterval.
 */
export function angleToMinutes(
  angle: number,
  minuteInterval: number = 1
): number {
  const normalized = normalizeAngle(angle);
  const rawMinutes = Math.round(normalized / 6) % 60;
  return roundMinutes(rawMinutes, minuteInterval);
}

/**
 * Returns whether an hour [0-23] is AM or PM.
 */
export function resolveHourPeriod(hours: number): 'AM' | 'PM' {
  return hours >= 12 ? 'PM' : 'AM';
}

/**
 * Toggles an hour [0-23] between AM and PM while keeping the 12-hour numeral unchanged.
 * Example: 0 (12 AM) -> 12 (12 PM), 14 (2 PM) -> 2 (2 AM).
 */
export function toggleHourPeriod(hours: number): number {
  const safeHour = isNaN(hours) ? 0 : ((hours % 24) + 24) % 24;
  return safeHour >= 12 ? safeHour - 12 : safeHour + 12;
}

/**
 * Formats hours and minutes into a localized, predictable digital string.
 *
 * @param hours - Hour value [0, 23]
 * @param minutes - Minute value [0, 59]
 * @param use24Hour - If true, outputs 'HH:mm' (e.g. '00:05', '14:30').
 *                    If false, outputs 'hh:mm A' (e.g. '12:05 AM', '02:30 PM').
 */
export function formatTime(
  hours: number,
  minutes: number,
  use24Hour: boolean = false
): string {
  const safeH = isNaN(hours) ? 0 : ((hours % 24) + 24) % 24;
  const safeM = isNaN(minutes) ? 0 : Math.max(0, Math.min(59, minutes));

  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

  if (use24Hour) {
    return `${pad(safeH)}:${pad(safeM)}`;
  }

  const period = resolveHourPeriod(safeH);
  const h12 = safeH % 12 === 0 ? 12 : safeH % 12;

  return `${pad(h12)}:${pad(safeM)} ${period}`;
}

/**
 * Returns a new Date instance with updated hours, minutes, and seconds,
 * while strictly preserving the year, month, and day of the base date.
 */
export function setTimeOnDate(
  baseDate: Date,
  hours: number,
  minutes: number,
  seconds: number = 0
): Date {
  const safeDate =
    baseDate instanceof Date && !isNaN(baseDate.getTime())
      ? new Date(baseDate.getTime())
      : new Date();

  const next = new Date(safeDate.getTime());
  const safeH = isNaN(hours) ? 0 : ((hours % 24) + 24) % 24;
  const safeM = isNaN(minutes) ? 0 : Math.max(0, Math.min(59, minutes));
  const safeS = isNaN(seconds) ? 0 : Math.max(0, Math.min(59, seconds));

  next.setHours(safeH, safeM, safeS, 0);
  return next;
}
