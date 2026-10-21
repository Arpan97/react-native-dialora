import { describe, expect, it } from '@jest/globals';
import {
  addMonths,
  clampDatePreservingTime,
  formatMonthYear,
  generateCalendarGrid,
  getDaysInMonth,
  getWeekdayNames,
  isAfterDay,
  isBeforeDay,
  isDateDisabled,
  isLeapYear,
  isSameDay,
  isSelectionDisabled,
  getSelectionValidationMessage,
  setDatePreservingTime,
  startOfDay,
} from '../utils/dateUtils';

describe('dateUtils', () => {
  describe('isLeapYear and getDaysInMonth', () => {
    it('accurately identifies leap years', () => {
      expect(isLeapYear(2024)).toBe(true);
      expect(isLeapYear(2020)).toBe(true);
      expect(isLeapYear(2000)).toBe(true); // Century divisible by 400
      expect(isLeapYear(1900)).toBe(false); // Century not divisible by 400
      expect(isLeapYear(2023)).toBe(false);
      expect(isLeapYear(2025)).toBe(false);
      expect(isLeapYear(NaN)).toBe(false);
    });

    it('returns the exact count of days per month', () => {
      // February in leap year = 29
      expect(getDaysInMonth(2024, 1)).toBe(29);
      // February in common year = 28
      expect(getDaysInMonth(2023, 1)).toBe(28);
      expect(getDaysInMonth(1900, 1)).toBe(28);
      expect(getDaysInMonth(2000, 1)).toBe(29);

      // 31-day months (Jan, Mar, May, Jul, Aug, Oct, Dec)
      expect(getDaysInMonth(2026, 0)).toBe(31); // Jan
      expect(getDaysInMonth(2026, 2)).toBe(31); // Mar
      expect(getDaysInMonth(2026, 4)).toBe(31); // May
      expect(getDaysInMonth(2026, 6)).toBe(31); // Jul
      expect(getDaysInMonth(2026, 7)).toBe(31); // Aug
      expect(getDaysInMonth(2026, 9)).toBe(31); // Oct
      expect(getDaysInMonth(2026, 11)).toBe(31); // Dec

      // 30-day months (Apr, Jun, Sep, Nov)
      expect(getDaysInMonth(2026, 3)).toBe(30); // Apr
      expect(getDaysInMonth(2026, 5)).toBe(30); // Jun
      expect(getDaysInMonth(2026, 8)).toBe(30); // Sep
      expect(getDaysInMonth(2026, 10)).toBe(30); // Nov
    });
  });

  describe('Day comparisons and local date boundaries', () => {
    it('isSameDay matches local date components without UTC offset issues', () => {
      const d1 = new Date(2026, 9, 15, 10, 30);
      const d2 = new Date(2026, 9, 15, 23, 45);
      const d3 = new Date(2026, 9, 16, 0, 5);

      expect(isSameDay(d1, d2)).toBe(true);
      expect(isSameDay(d1, d3)).toBe(false);
      expect(isSameDay(undefined, d1)).toBe(false);
    });

    it('startOfDay strips hours, minutes, and seconds while preserving calendar day', () => {
      const d = new Date(2026, 9, 15, 17, 45, 30, 200);
      const sod = startOfDay(d);

      expect(sod.getFullYear()).toBe(2026);
      expect(sod.getMonth()).toBe(9);
      expect(sod.getDate()).toBe(15);
      expect(sod.getHours()).toBe(0);
      expect(sod.getMinutes()).toBe(0);
      expect(sod.getSeconds()).toBe(0);
      expect(sod.getMilliseconds()).toBe(0);
    });

    it('isBeforeDay and isAfterDay compare calendar boundaries regardless of time-of-day', () => {
      const morning15 = new Date(2026, 9, 15, 2, 0);
      const evening15 = new Date(2026, 9, 15, 22, 0);
      const morning16 = new Date(2026, 9, 16, 1, 0);

      expect(isBeforeDay(morning15, evening15)).toBe(false);
      expect(isBeforeDay(morning15, morning16)).toBe(true);
      expect(isAfterDay(morning16, evening15)).toBe(true);
      expect(isAfterDay(evening15, morning15)).toBe(false);
    });
  });

  describe('isDateDisabled restrictions', () => {
    const minDate = new Date(2026, 9, 10);
    const maxDate = new Date(2026, 9, 20);

    it('restricts dates strictly before minimumDate or after maximumDate', () => {
      expect(
        isDateDisabled(new Date(2026, 9, 9), { minimumDate: minDate })
      ).toBe(true);
      expect(
        isDateDisabled(new Date(2026, 9, 10), { minimumDate: minDate })
      ).toBe(false);
      expect(
        isDateDisabled(new Date(2026, 9, 15), {
          minimumDate: minDate,
          maximumDate: maxDate,
        })
      ).toBe(false);
      expect(
        isDateDisabled(new Date(2026, 9, 20), { maximumDate: maxDate })
      ).toBe(false);
      expect(
        isDateDisabled(new Date(2026, 9, 21), { maximumDate: maxDate })
      ).toBe(true);
    });

    it('disables dates provided as an array', () => {
      const disabledList = [new Date(2026, 9, 14), new Date(2026, 9, 18)];

      expect(
        isDateDisabled(new Date(2026, 9, 14, 15, 0), {
          disabledDates: disabledList,
        })
      ).toBe(true);
      expect(
        isDateDisabled(new Date(2026, 9, 15), { disabledDates: disabledList })
      ).toBe(false);
    });

    it('disables dates matched by a predicate function', () => {
      // Disable all weekend days (Sunday = 0, Saturday = 6)
      const noWeekends = (d: Date) => d.getDay() === 0 || d.getDay() === 6;

      const sunday = new Date(2026, 9, 11); // Sunday
      const monday = new Date(2026, 9, 12); // Monday

      expect(isDateDisabled(sunday, { disabledDates: noWeekends })).toBe(true);
      expect(isDateDisabled(monday, { disabledDates: noWeekends })).toBe(false);
    });
  });

  describe('setDatePreservingTime', () => {
    it('preserves hours, minutes, seconds, and milliseconds when updating calendar day', () => {
      const base = new Date(2026, 0, 1, 14, 45, 30, 250);
      const newDay = new Date(2026, 9, 15, 0, 0, 0, 0);

      const result = setDatePreservingTime(base, newDay);

      expect(result).not.toBe(base);
      expect(result.getFullYear()).toBe(2026);
      expect(result.getMonth()).toBe(9);
      expect(result.getDate()).toBe(15);
      expect(result.getHours()).toBe(14);
      expect(result.getMinutes()).toBe(45);
      expect(result.getSeconds()).toBe(30);
      expect(result.getMilliseconds()).toBe(250);

      // Base date was not mutated
      expect(base.getMonth()).toBe(0);
      expect(base.getDate()).toBe(1);
    });
  });

  describe('Weekday names and first day of week', () => {
    it('returns weekday labels rotated by firstDayOfWeek', () => {
      // Sunday first (0)
      const sunFirst = getWeekdayNames(0, 'narrow');
      expect(sunFirst[0]).toBe('Su');
      expect(sunFirst[1]).toBe('Mo');
      expect(sunFirst[6]).toBe('Sa');

      // Monday first (1)
      const monFirst = getWeekdayNames(1, 'narrow');
      expect(monFirst[0]).toBe('Mo');
      expect(monFirst[1]).toBe('Tu');
      expect(monFirst[6]).toBe('Su');
    });
  });

  describe('Month navigation and formatting', () => {
    it('addMonths handles positive, negative, and year boundary shifts', () => {
      // Forward within year
      expect(addMonths(2026, 2, 2)).toEqual({ year: 2026, month: 4 });
      // Forward crossing year: Dec 2026 + 2 months -> Feb 2027
      expect(addMonths(2026, 11, 2)).toEqual({ year: 2027, month: 1 });
      // Backward crossing year: Jan 2026 - 1 month -> Dec 2025
      expect(addMonths(2026, 0, -1)).toEqual({ year: 2025, month: 11 });
    });

    it('formatMonthYear formats readable strings', () => {
      expect(formatMonthYear(2026, 9, 'long')).toBe('October 2026');
      expect(formatMonthYear(2026, 9, 'short')).toBe('Oct 2026');
    });
  });

  describe('generateCalendarGrid', () => {
    it('generates a complete 35 or 42 day grid with correct leading and trailing days', () => {
      // October 2026: Oct 1, 2026 is a Thursday (weekday index 4)
      // With Sunday (0) as firstDayOfWeek: leading count is 4 (Sun, Mon, Tue, Wed)
      // Days in Oct = 31.
      // Total leading + daysInOct = 4 + 31 = 35 cells!
      const cells = generateCalendarGrid({
        year: 2026,
        month: 9,
        selectedDate: new Date(2026, 9, 15),
        today: new Date(2026, 9, 15),
        firstDayOfWeek: 0,
      });

      expect(cells.length).toBe(35);

      // Leading days belong to September (month 8)
      expect(cells[0]?.isCurrentMonth).toBe(false);
      expect(cells[0]?.month).toBe(8);
      expect(cells[0]?.dayNumber).toBe(27);

      // October 1 is at index 4
      expect(cells[4]?.isCurrentMonth).toBe(true);
      expect(cells[4]?.dayNumber).toBe(1);

      // October 15 is selected and is today
      const cell15 = cells.find((c) => c.isCurrentMonth && c.dayNumber === 15);
      expect(cell15?.isSelected).toBe(true);
      expect(cell15?.isToday).toBe(true);

      // October 31 is the last day of October
      const cell31 = cells.find((c) => c.isCurrentMonth && c.dayNumber === 31);
      expect(cell31).toBeDefined();
    });

    it('generates 42 cells when month requires 6 weeks', () => {
      // August 2026: Aug 1 is Saturday (index 6).
      // With Sunday first: 6 leading days + 31 days = 37 days -> requires 42 cells!
      const cells = generateCalendarGrid({
        year: 2026,
        month: 7,
        firstDayOfWeek: 0,
      });

      expect(cells.length).toBe(42);
      expect(cells[0]?.isCurrentMonth).toBe(false); // July leading days
      expect(cells[cells.length - 1]?.isCurrentMonth).toBe(false); // September trailing days
    });

    it('marks out-of-range dates as isHidden when hideOutOfRangeDates is true', () => {
      const minDate = new Date(2026, 9, 10);
      const maxDate = new Date(2026, 9, 20);

      const cells = generateCalendarGrid({
        year: 2026,
        month: 9,
        minimumDate: minDate,
        maximumDate: maxDate,
        hideOutOfRangeDates: true,
      });

      // Oct 5 should be hidden and disabled
      const cell5 = cells.find((c) => c.isCurrentMonth && c.dayNumber === 5);
      expect(cell5?.isHidden).toBe(true);
      expect(cell5?.isDisabled).toBe(true);

      // Oct 15 should be visible and selectable
      const cell15 = cells.find((c) => c.isCurrentMonth && c.dayNumber === 15);
      expect(cell15?.isHidden).toBe(false);
      expect(cell15?.isDisabled).toBe(false);

      // Oct 25 should be hidden and disabled
      const cell25 = cells.find((c) => c.isCurrentMonth && c.dayNumber === 25);
      expect(cell25?.isHidden).toBe(true);
      expect(cell25?.isDisabled).toBe(true);

      // Total count still preserves weekday grid geometry
      expect(cells.length).toBe(35);
    });

    it('keeps out-of-range dates visible but disabled when hideOutOfRangeDates is false', () => {
      const minDate = new Date(2026, 9, 10);

      const cells = generateCalendarGrid({
        year: 2026,
        month: 9,
        minimumDate: minDate,
        hideOutOfRangeDates: false,
      });

      const cell5 = cells.find((c) => c.isCurrentMonth && c.dayNumber === 5);
      expect(cell5?.isHidden).toBe(false);
      expect(cell5?.isDisabled).toBe(true);
    });
  });

  describe('clampDatePreservingTime', () => {
    it('preserves candidate time when adjusting date to minimumDate boundary', () => {
      // Candidate: Oct 5, 2026 at 15:45:30
      const candidate = new Date(2026, 9, 5, 15, 45, 30);
      // Min date: Oct 10, 2026 at 10:00:00
      const minDate = new Date(2026, 9, 10, 10, 0, 0);

      const clamped = clampDatePreservingTime(candidate, minDate);

      expect(clamped.getFullYear()).toBe(2026);
      expect(clamped.getMonth()).toBe(9);
      expect(clamped.getDate()).toBe(10);
      // Preserved candidate's 15:45:30 because it is >= 10:00:00
      expect(clamped.getHours()).toBe(15);
      expect(clamped.getMinutes()).toBe(45);
      expect(clamped.getSeconds()).toBe(30);
    });

    it('clamps time to minimumDate when candidate time on minimumDate is earlier than min time', () => {
      // Candidate: Oct 5, 2026 at 08:15:00
      const candidate = new Date(2026, 9, 5, 8, 15, 0);
      // Min date: Oct 10, 2026 at 11:30:00
      const minDate = new Date(2026, 9, 10, 11, 30, 0);

      const clamped = clampDatePreservingTime(candidate, minDate);

      expect(clamped.getDate()).toBe(10);
      expect(clamped.getHours()).toBe(11);
      expect(clamped.getMinutes()).toBe(30);
    });

    it('preserves candidate time when adjusting date to maximumDate boundary', () => {
      // Candidate: Oct 28, 2026 at 14:20:00
      const candidate = new Date(2026, 9, 28, 14, 20, 0);
      // Max date: Oct 20, 2026 at 18:00:00
      const maxDate = new Date(2026, 9, 20, 18, 0, 0);

      const clamped = clampDatePreservingTime(candidate, undefined, maxDate);

      expect(clamped.getDate()).toBe(20);
      expect(clamped.getHours()).toBe(14);
      expect(clamped.getMinutes()).toBe(20);
    });

    it('clamps time to maximumDate when candidate time on maximumDate is later than max time', () => {
      // Candidate: Oct 28, 2026 at 20:00:00
      const candidate = new Date(2026, 9, 28, 20, 0, 0);
      // Max date: Oct 20, 2026 at 18:00:00
      const maxDate = new Date(2026, 9, 20, 18, 0, 0);

      const clamped = clampDatePreservingTime(candidate, undefined, maxDate);

      expect(clamped.getDate()).toBe(20);
      expect(clamped.getHours()).toBe(18);
      expect(clamped.getMinutes()).toBe(0);
    });

    it('leaves candidates within allowed bounds untouched', () => {
      const candidate = new Date(2026, 9, 15, 12, 34, 56);
      const minDate = new Date(2026, 9, 10);
      const maxDate = new Date(2026, 9, 20);

      const clamped = clampDatePreservingTime(candidate, minDate, maxDate);
      expect(clamped.getTime()).toBe(candidate.getTime());
    });

    it('handles inverted boundaries (minimumDate > maximumDate) without crashing', () => {
      const candidate = new Date(2026, 9, 15, 12, 0, 0);
      const minDate = new Date(2026, 9, 25);
      const maxDate = new Date(2026, 9, 10);

      // Should not throw or crash
      expect(() => {
        const clamped = clampDatePreservingTime(candidate, minDate, maxDate);
        expect(clamped).toBeInstanceOf(Date);
      }).not.toThrow();
    });
  });

  describe('isSelectionDisabled validation contract', () => {
    const minDate = new Date(2026, 9, 10, 9, 0, 0); // Oct 10 09:00
    const maxDate = new Date(2026, 9, 20, 18, 0, 0); // Oct 20 18:00

    it('returns true for invalid or missing candidate dates', () => {
      expect(isSelectionDisabled(null as any)).toBe(true);
      expect(isSelectionDisabled(undefined as any)).toBe(true);
      expect(isSelectionDisabled(new Date('invalid'))).toBe(true);
    });

    it('validates date mode ignoring time of day', () => {
      // Within date range
      expect(
        isSelectionDisabled(new Date(2026, 9, 15, 2, 0, 0), 'date', {
          minimumDate: minDate,
          maximumDate: maxDate,
        })
      ).toBe(false);

      // Same calendar day as minDate even if earlier time -> valid in date mode
      expect(
        isSelectionDisabled(new Date(2026, 9, 10, 2, 0, 0), 'date', {
          minimumDate: minDate,
          maximumDate: maxDate,
        })
      ).toBe(false);

      // Before minDate calendar day -> disabled
      expect(
        isSelectionDisabled(new Date(2026, 9, 9, 23, 59, 59), 'date', {
          minimumDate: minDate,
          maximumDate: maxDate,
        })
      ).toBe(true);

      // After maxDate calendar day -> disabled
      expect(
        isSelectionDisabled(new Date(2026, 9, 21, 0, 0, 0), 'date', {
          minimumDate: minDate,
          maximumDate: maxDate,
        })
      ).toBe(true);
    });

    it('handles disabledDates matcher array and predicate in date mode', () => {
      const disabledArray = [new Date(2026, 9, 14), new Date(2026, 9, 16)];
      expect(
        isSelectionDisabled(new Date(2026, 9, 14), 'date', {
          disabledDates: disabledArray,
        })
      ).toBe(true);
      expect(
        isSelectionDisabled(new Date(2026, 9, 15), 'date', {
          disabledDates: disabledArray,
        })
      ).toBe(false);

      // Predicate function
      const isSunday = (d: Date) => d.getDay() === 0;
      // Oct 11, 2026 is Sunday
      expect(
        isSelectionDisabled(new Date(2026, 9, 11), 'date', {
          disabledDates: isSunday,
        })
      ).toBe(true);
      // Oct 12, 2026 is Monday
      expect(
        isSelectionDisabled(new Date(2026, 9, 12), 'date', {
          disabledDates: isSunday,
        })
      ).toBe(false);

      // Error-throwing predicate function handled safely without crashing
      const throwingPredicate = () => {
        throw new Error('Predicate failed');
      };
      expect(() => {
        const result = isSelectionDisabled(new Date(2026, 9, 15), 'date', {
          disabledDates: throwingPredicate,
        });
        expect(result).toBe(false);
      }).not.toThrow();
    });

    it('validates time mode with same-day boundaries', () => {
      const minTime = new Date(2026, 9, 15, 9, 30, 0);
      const maxTime = new Date(2026, 9, 15, 17, 0, 0);

      // Within range
      expect(
        isSelectionDisabled(new Date(2026, 9, 15, 12, 0, 0), 'time', {
          minimumDate: minTime,
          maximumDate: maxTime,
        })
      ).toBe(false);

      // Before minTime -> disabled
      expect(
        isSelectionDisabled(new Date(2026, 9, 15, 9, 15, 0), 'time', {
          minimumDate: minTime,
          maximumDate: maxTime,
        })
      ).toBe(true);

      // After maxTime -> disabled
      expect(
        isSelectionDisabled(new Date(2026, 9, 15, 17, 30, 0), 'time', {
          minimumDate: minTime,
          maximumDate: maxTime,
        })
      ).toBe(true);
    });

    it('validates time mode with different-day boundaries via time-of-day comparison', () => {
      // Min is 09:00 on generic date 2020-01-01
      const minTime = new Date(2020, 0, 1, 9, 0, 0);
      // Max is 17:00 on generic date 2020-01-01
      const maxTime = new Date(2020, 0, 1, 17, 0, 0);

      // Candidate on 2026-10-15 at 14:00 (within 09:00 - 17:00)
      expect(
        isSelectionDisabled(new Date(2026, 9, 15, 14, 0, 0), 'time', {
          minimumDate: minTime,
          maximumDate: maxTime,
        })
      ).toBe(false);

      // Candidate on 2026-10-15 at 08:30 (< 09:00) -> disabled
      expect(
        isSelectionDisabled(new Date(2026, 9, 15, 8, 30, 0), 'time', {
          minimumDate: minTime,
          maximumDate: maxTime,
        })
      ).toBe(true);

      // Candidate on 2026-10-15 at 17:30 (> 17:00) -> disabled
      expect(
        isSelectionDisabled(new Date(2026, 9, 15, 17, 30, 0), 'time', {
          minimumDate: minTime,
          maximumDate: maxTime,
        })
      ).toBe(true);
    });

    it('validates datetime mode requiring both calendar day and exact timestamp to be valid', () => {
      const minDateTime = new Date(2026, 9, 10, 10, 0, 0);
      const maxDateTime = new Date(2026, 9, 20, 16, 0, 0);

      // Within range
      expect(
        isSelectionDisabled(new Date(2026, 9, 15, 12, 0, 0), 'datetime', {
          minimumDate: minDateTime,
          maximumDate: maxDateTime,
        })
      ).toBe(false);

      // On minimumDate day, but earlier time -> disabled
      expect(
        isSelectionDisabled(new Date(2026, 9, 10, 8, 0, 0), 'datetime', {
          minimumDate: minDateTime,
          maximumDate: maxDateTime,
        })
      ).toBe(true);

      // On maximumDate day, but later time -> disabled
      expect(
        isSelectionDisabled(new Date(2026, 9, 20, 18, 0, 0), 'datetime', {
          minimumDate: minDateTime,
          maximumDate: maxDateTime,
        })
      ).toBe(true);

      // Earlier date -> disabled
      expect(
        isSelectionDisabled(new Date(2026, 9, 9, 12, 0, 0), 'datetime', {
          minimumDate: minDateTime,
          maximumDate: maxDateTime,
        })
      ).toBe(true);
    });

    it('deterministically normalizes conflicting boundaries (minimumDate > maximumDate)', () => {
      const minConflicting = new Date(2026, 9, 20);
      const maxConflicting = new Date(2026, 9, 10);

      // Should normalize safeMin = Oct 10 and safeMax = Oct 20 without crashing
      expect(() => {
        const disabled = isSelectionDisabled(new Date(2026, 9, 15), 'date', {
          minimumDate: minConflicting,
          maximumDate: maxConflicting,
        });
        expect(disabled).toBe(false); // Oct 15 is within normalized [Oct 10, Oct 20]
      }).not.toThrow();

      // Oct 5 is before normalized safeMin (Oct 10) -> disabled
      expect(
        isSelectionDisabled(new Date(2026, 9, 5), 'date', {
          minimumDate: minConflicting,
          maximumDate: maxConflicting,
        })
      ).toBe(true);

      // Oct 25 is after normalized safeMax (Oct 20) -> disabled
      expect(
        isSelectionDisabled(new Date(2026, 9, 25), 'date', {
          minimumDate: minConflicting,
          maximumDate: maxConflicting,
        })
      ).toBe(true);
    });
  });

  describe('getSelectionValidationMessage explanation contract', () => {
    it('returns null when selection is completely valid', () => {
      const validDate = new Date(2026, 9, 15, 12, 0, 0);
      expect(
        getSelectionValidationMessage(validDate, 'datetime', {
          minimumDate: new Date(2026, 9, 10),
          maximumDate: new Date(2026, 9, 20),
        })
      ).toBeNull();
    });

    it('explains invalid Date instances', () => {
      expect(getSelectionValidationMessage(null as any)).toBe(
        'Selected date is invalid.'
      );
      expect(getSelectionValidationMessage(new Date('invalid'))).toBe(
        'Selected date is invalid.'
      );
    });

    it('explains disabled dates list and predicate rule failures', () => {
      const disabledDate = new Date(2026, 9, 15);
      expect(
        getSelectionValidationMessage(disabledDate, 'date', {
          disabledDates: [disabledDate],
        })
      ).toBe('This date is not available for selection.');

      const isWeekend = (d: Date) => d.getDay() === 0;
      const sundayDate = new Date(2026, 9, 11);
      expect(
        getSelectionValidationMessage(sundayDate, 'date', {
          disabledDates: isWeekend,
        })
      ).toBe('This date is not available for selection.');
    });

    it('explains minimumDate and maximumDate boundary violations in date mode', () => {
      const min = new Date(2026, 9, 10);
      const max = new Date(2026, 9, 20);

      const tooEarly = new Date(2026, 9, 5);
      expect(
        getSelectionValidationMessage(tooEarly, 'date', {
          minimumDate: min,
          maximumDate: max,
        })
      ).toBe('Date cannot be earlier than the minimum allowed date.');

      const tooLate = new Date(2026, 9, 25);
      expect(
        getSelectionValidationMessage(tooLate, 'date', {
          minimumDate: min,
          maximumDate: max,
        })
      ).toBe('Date cannot be later than the maximum allowed date.');
    });

    it('explains minimumDate and maximumDate boundary violations in time mode', () => {
      const min = new Date(2026, 9, 15, 10, 0, 0);
      const max = new Date(2026, 9, 15, 18, 0, 0);

      const tooEarlyTime = new Date(2026, 9, 15, 8, 30, 0);
      expect(
        getSelectionValidationMessage(tooEarlyTime, 'time', {
          minimumDate: min,
          maximumDate: max,
        })
      ).toBe('Time cannot be earlier than the minimum allowed time.');

      const tooLateTime = new Date(2026, 9, 15, 20, 0, 0);
      expect(
        getSelectionValidationMessage(tooLateTime, 'time', {
          minimumDate: min,
          maximumDate: max,
        })
      ).toBe('Time cannot be later than the maximum allowed time.');
    });

    it('explains datetime mode boundary violations', () => {
      const min = new Date(2026, 9, 10, 9, 0, 0);
      const max = new Date(2026, 9, 20, 17, 0, 0);

      const earlierDateTime = new Date(2026, 9, 10, 8, 0, 0);
      expect(
        getSelectionValidationMessage(earlierDateTime, 'datetime', {
          minimumDate: min,
          maximumDate: max,
        })
      ).toBe('Date and time cannot be earlier than the minimum allowed.');

      const laterDateTime = new Date(2026, 9, 20, 18, 0, 0);
      expect(
        getSelectionValidationMessage(laterDateTime, 'datetime', {
          minimumDate: min,
          maximumDate: max,
        })
      ).toBe('Date and time cannot be later than the maximum allowed.');
    });

    it('safely normalizes conflicting bounds in validation message', () => {
      const conflictingMin = new Date(2026, 9, 20);
      const conflictingMax = new Date(2026, 9, 10);

      // Within normalized [Oct 10, Oct 20] -> null
      expect(
        getSelectionValidationMessage(new Date(2026, 9, 15), 'date', {
          minimumDate: conflictingMin,
          maximumDate: conflictingMax,
        })
      ).toBeNull();

      // Before Oct 10 -> minimum error
      expect(
        getSelectionValidationMessage(new Date(2026, 9, 5), 'date', {
          minimumDate: conflictingMin,
          maximumDate: conflictingMax,
        })
      ).toBe('Date cannot be earlier than the minimum allowed date.');
    });
  });
});
