/**
 * Pure, testable calendar and date calculations.
 * All functions operate strictly on local date components to prevent UTC day-shift errors.
 */

export type FirstDayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type DisabledDateMatcher = Date[] | ((date: Date) => boolean);

export interface CalendarDayCell {
  /** The full Date object corresponding to this cell */
  date: Date;
  /** Day of the month (1-31) */
  dayNumber: number;
  /** 0-indexed month (0-11) */
  month: number;
  /** Full 4-digit year */
  year: number;
  /** Whether this date belongs to the currently viewed month */
  isCurrentMonth: boolean;
  /** Whether this date corresponds to today's local date */
  isToday: boolean;
  /** Whether this date matches the currently selected candidate date */
  isSelected: boolean;
  /** Whether this date is disabled by min/max boundaries or disabledDates */
  isDisabled: boolean;
  /** Whether this date should be hidden from view (e.g. out of range when hideOutOfRangeDates is active) */
  isHidden?: boolean;
}

export interface CalendarGridOptions {
  /** 4-digit year of the displayed month */
  year: number;
  /** 0-indexed month of the displayed month (0-11) */
  month: number;
  /** Currently selected candidate date */
  selectedDate?: Date;
  /** Today's date reference (defaults to new Date()) */
  today?: Date;
  /** First day of the week (0 = Sunday, 1 = Monday, etc. Defaults to 0) */
  firstDayOfWeek?: FirstDayOfWeek;
  /** Earliest selectable date boundary */
  minimumDate?: Date;
  /** Latest selectable date boundary */
  maximumDate?: Date;
  /** Specific dates or predicate function to disable */
  disabledDates?: DisabledDateMatcher;
  /** Whether to hide out-of-range dates while preserving weekday column alignment */
  hideOutOfRangeDates?: boolean;
}

const MONTH_NAMES_LONG = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const MONTH_NAMES_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const WEEKDAY_NAMES_NARROW = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const WEEKDAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Returns true if the specified year is a leap year.
 */
export function isLeapYear(year: number): boolean {
  if (isNaN(year) || !isFinite(year)) {
    return false;
  }
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * Returns the number of days in a given month (0-indexed month: 0 = January, 11 = December).
 */
export function getDaysInMonth(year: number, month: number): number {
  if (isNaN(year) || isNaN(month)) {
    return 31;
  }
  const safeMonth = ((month % 12) + 12) % 12;
  // February
  if (safeMonth === 1) {
    return isLeapYear(year) ? 29 : 28;
  }
  // April, June, September, November
  if ([3, 5, 8, 10].includes(safeMonth)) {
    return 30;
  }
  return 31;
}

/**
 * Strips the time portion of a date, returning a new Date set to 00:00:00.000 local time.
 */
export function startOfDay(date: Date): Date {
  const d = date instanceof Date && !isNaN(date.getTime()) ? date : new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
}

/**
 * Returns true if both dates refer to the exact same calendar day (ignoring time).
 */
export function isSameDay(d1?: Date, d2?: Date): boolean {
  if (!d1 || !d2 || isNaN(d1.getTime()) || isNaN(d2.getTime())) {
    return false;
  }
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

/**
 * Returns true if d1 occurs strictly before the calendar day of d2.
 */
export function isBeforeDay(d1: Date, d2: Date): boolean {
  return startOfDay(d1).getTime() < startOfDay(d2).getTime();
}

/**
 * Returns true if d1 occurs strictly after the calendar day of d2.
 */
export function isAfterDay(d1: Date, d2: Date): boolean {
  return startOfDay(d1).getTime() > startOfDay(d2).getTime();
}

/**
 * Checks if a given date is disabled based on min/max boundaries and custom matchers.
 */
export function isDateDisabled(
  date: Date,
  options?: {
    minimumDate?: Date;
    maximumDate?: Date;
    disabledDates?: DisabledDateMatcher;
  }
): boolean {
  if (!options || !(date instanceof Date) || isNaN(date.getTime())) {
    return false;
  }

  const { minimumDate, maximumDate, disabledDates } = options;
  const hasMin = minimumDate instanceof Date && !isNaN(minimumDate.getTime());
  const hasMax = maximumDate instanceof Date && !isNaN(maximumDate.getTime());

  let safeMin = hasMin ? minimumDate : undefined;
  let safeMax = hasMax ? maximumDate : undefined;
  if (hasMin && hasMax && minimumDate.getTime() > maximumDate.getTime()) {
    safeMin = maximumDate;
    safeMax = minimumDate;
  }

  if (safeMin && isBeforeDay(date, safeMin)) {
    return true;
  }

  if (safeMax && isAfterDay(date, safeMax)) {
    return true;
  }

  if (disabledDates) {
    if (typeof disabledDates === 'function') {
      try {
        return Boolean(disabledDates(date));
      } catch {
        return false;
      }
    }
    if (Array.isArray(disabledDates)) {
      return disabledDates.some((d) => isSameDay(d, date));
    }
  }

  return false;
}

/**
 * Helper to compute the total milliseconds elapsed since 00:00:00.000 local time on a date.
 */
function getTimeOfDayMs(d: Date): number {
  return (
    d.getHours() * 3600000 +
    d.getMinutes() * 60000 +
    d.getSeconds() * 1000 +
    d.getMilliseconds()
  );
}

/**
 * Checks if a candidate date is disabled or out-of-range according to the picker mode,
 * minimum/maximum date boundaries, and custom disabled date matchers.
 *
 * Deterministic rules:
 * 1. Conflicting boundaries: If minimumDate > maximumDate, boundaries are
 *    deterministically normalized by swapping them (safeMin = maximumDate, safeMax = minimumDate).
 * 2. 'date' mode: Validates that candidate's calendar day is within [minimumDate, maximumDate]
 *    and not disabled by disabledDates. Time of day is disregarded.
 * 3. 'time' mode: Validates that candidate's time is within [minimumDate, maximumDate].
 *    If boundary dates share the candidate's calendar day, full timestamps are compared.
 *    If boundary dates have different calendar days, local time-of-day milliseconds are compared.
 * 4. 'datetime' mode: Validates both that candidate's calendar day is within date boundaries
 *    and not in disabledDates, AND candidate's full timestamp is within [minimumDate, maximumDate].
 * 5. Error tolerance: If candidate or options are invalid, or if disabledDates predicate throws,
 *    it fails safely without crashing.
 */
export function isSelectionDisabled(
  candidate: Date,
  mode: 'date' | 'time' | 'datetime' = 'datetime',
  options?: {
    minimumDate?: Date;
    maximumDate?: Date;
    disabledDates?: DisabledDateMatcher;
  }
): boolean {
  if (
    !candidate ||
    !(candidate instanceof Date) ||
    isNaN(candidate.getTime())
  ) {
    return true;
  }

  const min = options?.minimumDate;
  const max = options?.maximumDate;
  const hasMin = min instanceof Date && !isNaN(min.getTime());
  const hasMax = max instanceof Date && !isNaN(max.getTime());

  let safeMin = hasMin ? min : undefined;
  let safeMax = hasMax ? max : undefined;
  if (hasMin && hasMax && min.getTime() > max.getTime()) {
    safeMin = max;
    safeMax = min;
  }

  if (mode === 'date') {
    return isDateDisabled(candidate, {
      minimumDate: safeMin,
      maximumDate: safeMax,
      disabledDates: options?.disabledDates,
    });
  }

  if (mode === 'time') {
    if (safeMin) {
      if (isSameDay(candidate, safeMin)) {
        if (candidate.getTime() < safeMin.getTime()) {
          return true;
        }
      } else if (getTimeOfDayMs(candidate) < getTimeOfDayMs(safeMin)) {
        return true;
      }
    }
    if (safeMax) {
      if (isSameDay(candidate, safeMax)) {
        if (candidate.getTime() > safeMax.getTime()) {
          return true;
        }
      } else if (getTimeOfDayMs(candidate) > getTimeOfDayMs(safeMax)) {
        return true;
      }
    }
    return false;
  }

  // mode === 'datetime'
  const isDatePartDisabled = isDateDisabled(candidate, {
    minimumDate: safeMin,
    maximumDate: safeMax,
    disabledDates: options?.disabledDates,
  });
  if (isDatePartDisabled) {
    return true;
  }

  if (safeMin && candidate.getTime() < safeMin.getTime()) {
    return true;
  }
  if (safeMax && candidate.getTime() > safeMax.getTime()) {
    return true;
  }

  return false;
}

/**
 * Returns a concise, accessible explanation when a candidate date is disabled
 * or out of range, or null if the selection is completely valid.
 */
export function getSelectionValidationMessage(
  candidate: Date,
  mode: 'date' | 'time' | 'datetime' = 'datetime',
  options?: {
    minimumDate?: Date;
    maximumDate?: Date;
    disabledDates?: DisabledDateMatcher;
  }
): string | null {
  if (
    !candidate ||
    !(candidate instanceof Date) ||
    isNaN(candidate.getTime())
  ) {
    return 'Selected date is invalid.';
  }

  const min = options?.minimumDate;
  const max = options?.maximumDate;
  const hasMin = min instanceof Date && !isNaN(min.getTime());
  const hasMax = max instanceof Date && !isNaN(max.getTime());

  let safeMin = hasMin ? min : undefined;
  let safeMax = hasMax ? max : undefined;
  if (hasMin && hasMax && min.getTime() > max.getTime()) {
    safeMin = max;
    safeMax = min;
  }

  // Check disabledDates rule for date and datetime modes
  if (mode === 'date' || mode === 'datetime') {
    if (options?.disabledDates) {
      if (typeof options.disabledDates === 'function') {
        try {
          if (options.disabledDates(candidate)) {
            return 'This date is not available for selection.';
          }
        } catch {
          // Ignore predicate errors safely
        }
      } else if (Array.isArray(options.disabledDates)) {
        if (options.disabledDates.some((d) => isSameDay(d, candidate))) {
          return 'This date is not available for selection.';
        }
      }
    }
  }

  if (mode === 'date') {
    if (safeMin && isBeforeDay(candidate, safeMin)) {
      return 'Date cannot be earlier than the minimum allowed date.';
    }
    if (safeMax && isAfterDay(candidate, safeMax)) {
      return 'Date cannot be later than the maximum allowed date.';
    }
    return null;
  }

  if (mode === 'time') {
    if (safeMin) {
      if (isSameDay(candidate, safeMin)) {
        if (candidate.getTime() < safeMin.getTime()) {
          return 'Time cannot be earlier than the minimum allowed time.';
        }
      } else if (getTimeOfDayMs(candidate) < getTimeOfDayMs(safeMin)) {
        return 'Time cannot be earlier than the minimum allowed time.';
      }
    }
    if (safeMax) {
      if (isSameDay(candidate, safeMax)) {
        if (candidate.getTime() > safeMax.getTime()) {
          return 'Time cannot be later than the maximum allowed time.';
        }
      } else if (getTimeOfDayMs(candidate) > getTimeOfDayMs(safeMax)) {
        return 'Time cannot be later than the maximum allowed time.';
      }
    }
    return null;
  }

  // mode === 'datetime'
  if (safeMin && isBeforeDay(candidate, safeMin)) {
    return 'Date cannot be earlier than the minimum allowed date.';
  }
  if (safeMax && isAfterDay(candidate, safeMax)) {
    return 'Date cannot be later than the maximum allowed date.';
  }
  if (safeMin && candidate.getTime() < safeMin.getTime()) {
    return 'Date and time cannot be earlier than the minimum allowed.';
  }
  if (safeMax && candidate.getTime() > safeMax.getTime()) {
    return 'Date and time cannot be later than the maximum allowed.';
  }

  return null;
}

/**
 * Returns a new Date instance adopting the year, month, and day from newDate,
 * while strictly preserving the hours, minutes, seconds, and milliseconds of baseDate.
 */
export function setDatePreservingTime(baseDate: Date, newDate: Date): Date {
  const safeBase =
    baseDate instanceof Date && !isNaN(baseDate.getTime())
      ? baseDate
      : new Date();
  const safeNew =
    newDate instanceof Date && !isNaN(newDate.getTime()) ? newDate : new Date();

  const next = new Date(safeBase.getTime());
  next.setFullYear(
    safeNew.getFullYear(),
    safeNew.getMonth(),
    safeNew.getDate()
  );
  return next;
}

/**
 * Clamps a candidate date to minimumDate and maximumDate boundaries while preserving
 * the candidate date's hours, minutes, seconds, and milliseconds as closely as possible.
 *
 * Boundary handling policy:
 * 1. If both minimumDate and maximumDate are provided and minimumDate > maximumDate (invalid configuration),
 *    the range is treated as an inverted constraint: it clamps to minimumDate safely without crashing or throwing.
 * 2. If candidate date is strictly before minimumDate:
 *    - It adopts the year, month, and day of minimumDate.
 *    - If minimumDate has a specific time (e.g. 14:30) and candidate's time is earlier than 14:30,
 *      time is clamped to minimumDate's time; otherwise the candidate's time is preserved.
 * 3. If candidate date is strictly after maximumDate:
 *    - It adopts the year, month, and day of maximumDate.
 *    - If maximumDate has a specific time (e.g. 18:00) and candidate's time is later than 18:00,
 *      time is clamped to maximumDate's time; otherwise candidate's time is preserved.
 * 4. In all other cases, candidate date and time are returned unchanged.
 */
export function clampDatePreservingTime(
  targetDate: Date,
  minimumDate?: Date,
  maximumDate?: Date
): Date {
  const safeTarget =
    targetDate instanceof Date && !isNaN(targetDate.getTime())
      ? targetDate
      : new Date();

  const hasMin = minimumDate instanceof Date && !isNaN(minimumDate.getTime());
  const hasMax = maximumDate instanceof Date && !isNaN(maximumDate.getTime());

  if (!hasMin && !hasMax) {
    return safeTarget;
  }

  // Handle invalid boundary where min > max safely without throwing
  let effectiveMin = hasMin ? minimumDate : undefined;
  let effectiveMax = hasMax ? maximumDate : undefined;
  if (hasMin && hasMax && minimumDate!.getTime() > maximumDate!.getTime()) {
    effectiveMin = maximumDate;
    effectiveMax = minimumDate;
  }

  let result = new Date(safeTarget.getTime());

  if (effectiveMin && result.getTime() < effectiveMin.getTime()) {
    const adjusted = setDatePreservingTime(result, effectiveMin);
    if (adjusted.getTime() < effectiveMin.getTime()) {
      result = new Date(effectiveMin.getTime());
    } else {
      result = adjusted;
    }
  }

  if (effectiveMax && result.getTime() > effectiveMax.getTime()) {
    const adjusted = setDatePreservingTime(result, effectiveMax);
    if (adjusted.getTime() > effectiveMax.getTime()) {
      result = new Date(effectiveMax.getTime());
    } else {
      result = adjusted;
    }
  }

  return result;
}

/**
 * Shifts a year and month by a delta count, correctly rolling over year boundaries.
 */
export function addMonths(
  year: number,
  month: number,
  count: number
): { year: number; month: number } {
  const totalMonths = year * 12 + month + count;
  const nextYear = Math.floor(totalMonths / 12);
  const nextMonth = ((totalMonths % 12) + 12) % 12;
  return { year: nextYear, month: nextMonth };
}

/**
 * Returns an array of localized weekday header labels respecting firstDayOfWeek.
 */
export function getWeekdayNames(
  firstDayOfWeek: FirstDayOfWeek = 0,
  format: 'narrow' | 'short' = 'narrow'
): string[] {
  const source =
    format === 'short' ? WEEKDAY_NAMES_SHORT : WEEKDAY_NAMES_NARROW;
  const result: string[] = [];
  for (let i = 0; i < 7; i++) {
    result.push(source[(i + firstDayOfWeek) % 7] ?? '');
  }
  return result;
}

/**
 * Formats a given year and month as a readable header string (e.g. "October 2026").
 */
export function formatMonthYear(
  year: number,
  month: number,
  format: 'long' | 'short' = 'long'
): string {
  const names = format === 'short' ? MONTH_NAMES_SHORT : MONTH_NAMES_LONG;
  const safeMonth = ((month % 12) + 12) % 12;
  return `${names[safeMonth]} ${year}`;
}

/**
 * Generates the full 35 or 42 day cell grid for the specified month,
 * including leading days from the previous month and trailing days from the next month.
 */
export function generateCalendarGrid(
  options: CalendarGridOptions
): CalendarDayCell[] {
  const {
    year,
    month,
    selectedDate,
    today = new Date(),
    firstDayOfWeek = 0,
    minimumDate,
    maximumDate,
    disabledDates,
    hideOutOfRangeDates = false,
  } = options;

  const daysInCurrent = getDaysInMonth(year, month);
  const firstDayOfMonthWeekday = new Date(year, month, 1).getDay();
  const leadingCount = (firstDayOfMonthWeekday - firstDayOfWeek + 7) % 7;

  const cells: CalendarDayCell[] = [];

  const createCell = (
    cellDate: Date,
    isCurrentMonth: boolean
  ): CalendarDayCell => {
    const isOutOfRange = Boolean(
      (minimumDate && isBeforeDay(cellDate, minimumDate)) ||
      (maximumDate && isAfterDay(cellDate, maximumDate))
    );
    const isHidden = Boolean(hideOutOfRangeDates && isOutOfRange);
    const isDisabled =
      isHidden ||
      isDateDisabled(cellDate, {
        minimumDate,
        maximumDate,
        disabledDates,
      });

    return {
      date: cellDate,
      dayNumber: cellDate.getDate(),
      month: cellDate.getMonth(),
      year: cellDate.getFullYear(),
      isCurrentMonth,
      isToday: isSameDay(cellDate, today),
      isSelected: isSameDay(cellDate, selectedDate),
      isDisabled,
      isHidden,
    };
  };

  // 1. Leading days from previous month
  const prevMonthInfo = addMonths(year, month, -1);
  const daysInPrev = getDaysInMonth(prevMonthInfo.year, prevMonthInfo.month);
  const prevStartDay = daysInPrev - leadingCount + 1;

  for (let day = prevStartDay; day <= daysInPrev; day++) {
    const cellDate = new Date(prevMonthInfo.year, prevMonthInfo.month, day);
    cells.push(createCell(cellDate, false));
  }

  // 2. Days of the current month
  for (let day = 1; day <= daysInCurrent; day++) {
    const cellDate = new Date(year, month, day);
    cells.push(createCell(cellDate, true));
  }

  // 3. Trailing days from next month
  // Standard calendars display 35 cells (5 rows) or 42 cells (6 rows)
  const totalCellsNeeded = cells.length > 35 ? 42 : 35;
  const trailingCount = totalCellsNeeded - cells.length;
  const nextMonthInfo = addMonths(year, month, 1);

  for (let day = 1; day <= trailingCount; day++) {
    const cellDate = new Date(nextMonthInfo.year, nextMonthInfo.month, day);
    cells.push(createCell(cellDate, false));
  }

  return cells;
}
