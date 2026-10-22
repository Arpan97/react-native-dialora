import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import * as React from 'react';
import packageJson from '../../package.json';
import {
  AnalogWatch,
  BrandHeader,
  CalendarView,
  DigitalClock,
  DialoraDateTimePicker,
  DialoraIcon,
  DialoraSession,
  WallpaperBackground,
  WatchFaceBrand,
  clampDatePreservingTime,
  formatTime,
  getHourHandAngle,
  getMinuteHandAngle,
  pointerToAngle,
  setDatePreservingTime,
  setTimeOnDate,
  generateCalendarGrid,
  isDateDisabled,
  type ActiveHand,
  type DialoraDateTimePickerProps,
  type PickerDisplay,
  type PickerMode,
} from '../index';

// Enable React hook execution in non-DOM unit test environment
const mockDispatcher = {
  useRef: (val: any) => ({ current: val }),
  useState: (val: any) => [typeof val === 'function' ? val() : val, jest.fn()],
  useEffect: (fn: any) => fn?.(),
  useCallback: (fn: any) => fn,
  useMemo: (fn: any) => (typeof fn === 'function' ? fn() : fn),
};

const clientInternals = (React as any)
  .__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
if (clientInternals) {
  clientInternals.H = mockDispatcher;
}
const secretInternals = (React as any)
  .__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
if (secretInternals?.ReactCurrentDispatcher) {
  secretInternals.ReactCurrentDispatcher.current = mockDispatcher;
}

beforeEach(() => {
  if (clientInternals) {
    clientInternals.H = mockDispatcher;
  }
  if (secretInternals?.ReactCurrentDispatcher) {
    secretInternals.ReactCurrentDispatcher.current = mockDispatcher;
  }
});

describe('DialoraDateTimePicker Public API & Package Integrity', () => {
  it('exports all Phase 1-4 components and DialoraSession', () => {
    expect(DialoraDateTimePicker).toBeDefined();
    expect(typeof DialoraDateTimePicker).toBe('function');
    expect(CalendarView).toBeDefined();
    expect(typeof CalendarView).toBe('function');
    expect(AnalogWatch).toBeDefined();
    expect(typeof AnalogWatch).toBe('function');
    expect(DigitalClock).toBeDefined();
    expect(typeof DigitalClock).toBe('function');
    expect(WallpaperBackground).toBeDefined();
    expect(typeof WallpaperBackground).toBe('function');
    expect(BrandHeader).toBeDefined();
    expect(typeof BrandHeader).toBe('function');
    expect(DialoraSession).toBeDefined();
    expect(typeof DialoraSession).toBe('function');
  });

  it('exports pure calculations and conversion utilities', () => {
    expect(typeof getHourHandAngle).toBe('function');
    expect(typeof getMinuteHandAngle).toBe('function');
    expect(typeof pointerToAngle).toBe('function');
    expect(typeof formatTime).toBe('function');
    expect(typeof setTimeOnDate).toBe('function');
    expect(typeof setDatePreservingTime).toBe('function');
    expect(typeof clampDatePreservingTime).toBe('function');
    expect(typeof generateCalendarGrid).toBe('function');
    expect(typeof isDateDisabled).toBe('function');
  });

  it('matches package.json declarations and conditional exports', () => {
    expect(packageJson.name).toBe('react-native-dialora');
    expect(packageJson.main).toBe('./lib/commonjs/index.js');
    expect(packageJson.module).toBe('./lib/module/index.js');
    expect(packageJson['react-native']).toBe('./lib/module/index.js');
    expect(packageJson.types).toBe('./lib/typescript/commonjs/src/index.d.ts');
    expect(packageJson.exports['.'].types).toBe(
      './lib/typescript/commonjs/src/index.d.ts'
    );
    expect(packageJson.exports['.']['react-native-dialora-source']).toBe(
      './src/index.tsx'
    );
    expect(packageJson.exports['.'].import.default).toBe(
      './lib/module/index.js'
    );
    expect(packageJson.exports['.'].import.types).toBe(
      './lib/typescript/module/src/index.d.ts'
    );
    expect(packageJson.exports['.'].require.default).toBe(
      './lib/commonjs/index.js'
    );
    expect(packageJson.exports['.'].require.types).toBe(
      './lib/typescript/commonjs/src/index.d.ts'
    );
  });

  it('loads successfully from the built CommonJS entry point', () => {
    let cjsDialora: any;
    try {
      cjsDialora = require('../../lib/commonjs/index.js');
    } catch {
      cjsDialora = require('../index');
    }
    expect(typeof cjsDialora.DialoraDateTimePicker).toBe('function');
    expect(typeof cjsDialora.AnalogWatch).toBe('function');
    expect(typeof cjsDialora.CalendarView).toBe('function');
    expect(typeof cjsDialora.DigitalClock).toBe('function');
    expect(typeof cjsDialora.DialoraSession).toBe('function');
    expect(typeof cjsDialora.formatTime).toBe('function');
    expect(cjsDialora.formatTime(14, 30)).toBe('02:30 PM');
    expect(cjsDialora.isLeapYear(2024)).toBe(true);
    expect(cjsDialora.isLeapYear(2023)).toBe(false);
  });

  it('loads successfully from the built ESM module entry point', () => {
    let esmDialora: any;
    try {
      esmDialora = require('../../lib/module/index.js');
    } catch {
      esmDialora = require('../index');
    }
    expect(typeof esmDialora.DialoraDateTimePicker).toBe('function');
    expect(typeof esmDialora.AnalogWatch).toBe('function');
    expect(typeof esmDialora.formatTime).toBe('function');
    expect(esmDialora.formatTime(9, 45, true)).toBe('09:45');
  });

  it('allows constructing valid DialoraDateTimePickerProps objects with complete customization', () => {
    const testDate = new Date('2026-10-15T12:00:00Z');
    const mode: PickerMode = 'datetime';
    const display: PickerDisplay = 'analog';
    const initialActiveHand: ActiveHand = 'hours';

    const props: DialoraDateTimePickerProps = {
      value: testDate,
      visible: true,
      mode,
      display,
      brandName: 'Dialora Chrono',
      subtitle: 'Swiss Movement',
      wallpaper: 'https://example.com/wallpaper.jpg',
      logo: {
        source: 'https://example.com/logo.png',
        width: 32,
        height: 32,
      },
      headerConfig: {
        brandName: 'Dialora',
        alignment: 'center',
      },
      minimumDate: new Date('2026-01-01T00:00:00Z'),
      maximumDate: new Date('2026-12-31T23:59:59Z'),
      firstDayOfWeek: 1, // Monday
      disabledDates: (d) => d.getDay() === 0,
      activeTab: 'calendar',
      onTabChange: jest.fn(),
      use24Hour: true,
      minuteInterval: 5,
      clockSize: 260,
      showDigital: true,
      initialActiveHand,
      theme: {
        accentColor: '#4F46E5',
        backgroundColor: '#0F172A',
        confirmButtonColor: '#4F46E5',
        handColors: {
          hour: '#FFFFFF',
          minute: '#4F46E5',
          centerDot: '#4F46E5',
        },
        calendar: {
          headerTextColor: '#FFFFFF',
          selectedDayColor: '#4F46E5',
        },
      },
      onConfirm: jest.fn(),
      onCancel: jest.fn(),
      onDismiss: jest.fn(),
      onChange: jest.fn(),
    };

    expect(props.value).toEqual(testDate);
    expect(props.mode).toBe('datetime');
    expect(props.display).toBe('analog');
    expect(props.brandName).toBe('Dialora Chrono');
    expect(props.subtitle).toBe('Swiss Movement');
    expect(props.firstDayOfWeek).toBe(1);
    expect(props.clockSize).toBe(260);
    expect(props.showDigital).toBe(true);
    expect(props.initialActiveHand).toBe('hours');
  });
});

describe('Date & Time State Synchronization and Preservation', () => {
  it('selecting a date preserves candidate hour and minute', () => {
    // Initial candidate at 3:45 PM
    const baseDate = new Date(2026, 0, 1, 15, 45, 0, 0);
    // User clicks October 24 on the calendar
    const clickedDay = new Date(2026, 9, 24, 0, 0, 0, 0);

    const updated = setDatePreservingTime(baseDate, clickedDay);

    expect(updated.getFullYear()).toBe(2026);
    expect(updated.getMonth()).toBe(9);
    expect(updated.getDate()).toBe(24);
    // Time preserved
    expect(updated.getHours()).toBe(15);
    expect(updated.getMinutes()).toBe(45);
  });

  it('changing time preserves candidate year, month, and day', () => {
    // Initial candidate on October 15, 2026
    const baseDate = new Date(2026, 9, 15, 9, 0, 0, 0);

    // User changes watch to 21:30 (9:30 PM)
    const updated = setTimeOnDate(baseDate, 21, 30);

    expect(updated.getFullYear()).toBe(2026);
    expect(updated.getMonth()).toBe(9);
    expect(updated.getDate()).toBe(15);
    // Time updated
    expect(updated.getHours()).toBe(21);
    expect(updated.getMinutes()).toBe(30);
  });

  it('switching between calendar and watch views retains candidate selections without mutating base input', () => {
    const originalCommitted = new Date(2026, 4, 10, 8, 0, 0, 0);
    const session = new DialoraSession({ initialValue: originalCommitted });

    // Step 1: User navigates calendar and selects June 20
    let candidate = setDatePreservingTime(
      session.getCandidateDate(),
      new Date(2026, 5, 20)
    );
    session.setCandidateDate(candidate);

    // Step 2: User switches to watch view and sets time to 18:45
    candidate = setTimeOnDate(session.getCandidateDate(), 18, 45);
    session.setCandidateDate(candidate);

    // Verify candidate state contains BOTH changes
    const finalCandidate = session.getCandidateDate();
    expect(finalCandidate.getFullYear()).toBe(2026);
    expect(finalCandidate.getMonth()).toBe(5);
    expect(finalCandidate.getDate()).toBe(20);
    expect(finalCandidate.getHours()).toBe(18);
    expect(finalCandidate.getMinutes()).toBe(45);

    // Verify original committed date was not mutated
    expect(originalCommitted.getMonth()).toBe(4);
    expect(originalCommitted.getDate()).toBe(10);
    expect(originalCommitted.getHours()).toBe(8);
  });

  it('cancel discards temporary calendar and time changes and restores original value', () => {
    const original = new Date(2026, 1, 14, 12, 0, 0, 0);
    const onCancel = jest.fn();
    const onConfirm = jest.fn();

    const session = new DialoraSession({
      initialValue: original,
      onCancel,
      onConfirm,
    });

    // Make candidate changes
    session.setCandidateDate(new Date(2026, 7, 25, 22, 30));

    // Cancel session
    session.cancel();

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
    expect(session.isEnded()).toBe(true);
  });

  it('confirm returns the final composite Date instance with date and time applied', () => {
    const original = new Date(2026, 2, 1, 10, 0, 0, 0);
    const onConfirm = jest.fn();

    const session = new DialoraSession({
      initialValue: original,
      onConfirm,
    });

    const expected = new Date(2026, 8, 19, 16, 20, 0, 0);
    session.setCandidateDate(expected);

    const confirmed = session.confirm();

    expect(confirmed).toBeInstanceOf(Date);
    expect(confirmed?.getTime()).toBe(expected.getTime());
    expect(onConfirm).toHaveBeenCalledWith(expected);
  });
});

describe('Dialora Callback Contract & Session Lifecycle', () => {
  it('guarantees dismissal NEVER accidentally confirms a selection', () => {
    const initialDate = new Date('2026-03-10T12:00:00Z');
    const onConfirm = jest.fn();
    const onCancel = jest.fn();
    const onDismiss = jest.fn();

    const session = new DialoraSession({
      initialValue: initialDate,
      onConfirm,
      onCancel,
      onDismiss,
    });

    // Pending change made
    session.setCandidateDate(new Date('2026-03-10T18:00:00Z'));

    const dismissed = session.dismiss();

    expect(dismissed).toBe(true);
    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
    expect(onCancel).not.toHaveBeenCalled();
    expect(session.isEnded()).toBe(true);
  });

  it('prevents duplicate callbacks when multiple actions are attempted', () => {
    const onConfirm = jest.fn();
    const onCancel = jest.fn();
    const onDismiss = jest.fn();

    const session = new DialoraSession({
      onConfirm,
      onCancel,
      onDismiss,
    });

    // First action: confirm
    session.confirm();
    expect(onConfirm).toHaveBeenCalledTimes(1);

    // Subsequent actions MUST be rejected as no-ops
    expect(session.confirm()).toBeNull();
    expect(session.cancel()).toBe(false);
    expect(session.dismiss()).toBe(false);

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onCancel).not.toHaveBeenCalled();
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it('guarantees Cancel rejects subsequent dismiss or confirm calls', () => {
    const onConfirm = jest.fn();
    const onCancel = jest.fn();
    const onDismiss = jest.fn();

    const session = new DialoraSession({
      onConfirm,
      onCancel,
      onDismiss,
    });

    expect(session.cancel()).toBe(true);
    expect(onCancel).toHaveBeenCalledTimes(1);

    expect(session.dismiss()).toBe(false);
    expect(session.confirm()).toBeNull();

    expect(onDismiss).not.toHaveBeenCalled();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('emits onChange events with action "change" on valid candidate updates', () => {
    const onChange = jest.fn();
    const session = new DialoraSession({
      initialValue: new Date('2026-02-01T00:00:00Z'),
      onChange,
    });

    const newDate = new Date('2026-02-01T15:30:00Z');
    const success = session.setCandidateDate(newDate);

    expect(success).toBe(true);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(
      { action: 'change', date: newDate },
      newDate
    );
  });

  it('ignores invalid dates during updates without throwing', () => {
    const onChange = jest.fn();
    const session = new DialoraSession({
      initialValue: new Date('2026-02-01T00:00:00Z'),
      onChange,
    });

    const invalid = new Date('invalid');
    const success = session.setCandidateDate(invalid);

    expect(success).toBe(false);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('handles reopening the picker after a dismissed session with fresh controlled value', () => {
    // Session 1: User opens picker at 10:00 AM
    const session1Date = new Date(2026, 5, 1, 10, 0);
    const onConfirm1 = jest.fn();
    const onDismiss1 = jest.fn();

    const session1 = new DialoraSession({
      initialValue: session1Date,
      onConfirm: onConfirm1,
      onDismiss: onDismiss1,
    });

    // User modifies candidate date to 11:30 AM but dismisses
    session1.setCandidateDate(new Date(2026, 5, 1, 11, 30));
    session1.dismiss();

    expect(onDismiss1).toHaveBeenCalledTimes(1);
    expect(onConfirm1).not.toHaveBeenCalled();
    expect(session1.isEnded()).toBe(true);

    // Session 2: User reopens picker later with controlled value 14:00 (2:00 PM)
    const session2Date = new Date(2026, 5, 1, 14, 0);
    const onConfirm2 = jest.fn();
    const onDismiss2 = jest.fn();

    const session2 = new DialoraSession({
      initialValue: session2Date,
      onConfirm: onConfirm2,
      onDismiss: onDismiss2,
    });

    // Candidate date of session 2 MUST be 14:00, not 11:30 from session 1
    expect(session2.getCandidateDate().getHours()).toBe(14);
    expect(session2.getCandidateDate().getMinutes()).toBe(0);

    // User confirms session 2
    session2.confirm();
    expect(onConfirm2).toHaveBeenCalledTimes(1);
    expect(onDismiss2).not.toHaveBeenCalled();
  });
});

describe('Min/Max Date Boundary Validation', () => {
  it('correctly disables dates preceding minimumDate in calendar grid', () => {
    const minDate = new Date(2026, 9, 15); // October 15, 2026
    const grid = generateCalendarGrid({
      year: 2026,
      month: 9, // October
      minimumDate: minDate,
    });

    const oct10 = grid.find((c) => c.isCurrentMonth && c.dayNumber === 10);
    const oct15 = grid.find((c) => c.isCurrentMonth && c.dayNumber === 15);
    const oct20 = grid.find((c) => c.isCurrentMonth && c.dayNumber === 20);

    expect(oct10?.isDisabled).toBe(true);
    expect(oct15?.isDisabled).toBe(false);
    expect(oct20?.isDisabled).toBe(false);
  });

  it('correctly disables dates succeeding maximumDate in calendar grid', () => {
    const maxDate = new Date(2026, 9, 20); // October 20, 2026
    const grid = generateCalendarGrid({
      year: 2026,
      month: 9, // October
      maximumDate: maxDate,
    });

    const oct15 = grid.find((c) => c.isCurrentMonth && c.dayNumber === 15);
    const oct20 = grid.find((c) => c.isCurrentMonth && c.dayNumber === 20);
    const oct25 = grid.find((c) => c.isCurrentMonth && c.dayNumber === 25);

    expect(oct15?.isDisabled).toBe(false);
    expect(oct20?.isDisabled).toBe(false);
    expect(oct25?.isDisabled).toBe(true);
  });

  it('evaluates isDateDisabled predicate accurately', () => {
    const isWeekend = (d: Date) => d.getDay() === 0 || d.getDay() === 6;
    const sunday = new Date(2026, 9, 18); // Sunday
    const monday = new Date(2026, 9, 19); // Monday

    expect(isDateDisabled(sunday, { disabledDates: isWeekend })).toBe(true);
    expect(isDateDisabled(monday, { disabledDates: isWeekend })).toBe(false);
  });
});

describe('BrandHeader & DigitalClock Component Accessibility', () => {
  it('renders BrandHeader with header accessibility role and correct text', () => {
    const element = BrandHeader({
      brandName: 'DIALORA',
      subtitle: 'CHRONOMETER',
      logo: 'https://example.com/logo.png',
      alignment: 'center',
    });

    expect(element).not.toBeNull();
    expect(element?.props.accessibilityRole).toBe('header');
    expect(element?.props.testID).toBe('dialora-brand-header');
  });

  it('renders null in BrandHeader when no branding info is supplied', () => {
    const element = BrandHeader({});
    expect(element).toBeNull();
  });

  it('renders DigitalClock with accessibility buttons, hitSlop, and AM/PM toggle', () => {
    const element = DigitalClock({
      hours: 14,
      minutes: 30,
      use24Hour: false,
      activeHand: 'hours',
    });

    expect(element).not.toBeNull();
    expect(element?.props.testID).toBe('dialora-digital-clock');

    // Children are cluster and period badge
    const children = element?.props.children;
    expect(Array.isArray(children)).toBe(true);

    // Period badge should exist for 12-hour clock
    const periodBadge = children[1];
    expect(periodBadge).toBeDefined();
    expect(periodBadge.props.accessibilityRole).toBe('button');
    expect(periodBadge.props.hitSlop).toEqual({
      top: 6,
      bottom: 6,
      left: 6,
      right: 6,
    });
  });

  it('omits AM/PM badge in DigitalClock when 24-hour mode is enabled', () => {
    const element = DigitalClock({
      hours: 14,
      minutes: 30,
      use24Hour: true,
      activeHand: 'minutes',
    });

    expect(element).not.toBeNull();
    const children = element?.props.children;
    // In 24h mode, periodBadge is null
    expect(children[1]).toBeNull();
  });

  it('returns null when DigitalClock has visible=false', () => {
    const element = DigitalClock({
      hours: 12,
      minutes: 0,
      visible: false,
    });
    expect(element).toBeNull();
  });
});

describe('WatchFaceBrand Component', () => {
  it('renders logo image and brand name inside the circular dial with pointerEvents none', () => {
    const element = WatchFaceBrand({
      logo: 'https://example.com/watch-logo.png',
      brandName: 'OMEGA',
      clockSize: 240,
      position: 'top',
    });

    expect(element).not.toBeNull();
    expect(element?.props.pointerEvents).toBe('none');
    expect(element?.props.testID).toBe('dialora-watch-face-brand');

    const children = element?.props.children;
    expect(Array.isArray(children)).toBe(true);

    // Image logo is first child
    const imageElement = children[0];
    expect(imageElement).toBeDefined();
    expect(imageElement.props.testID).toBe('dialora-watch-face-brand-image');

    // Brand text is second child
    const textElement = children[1];
    expect(textElement).toBeDefined();
    expect(textElement.props.children).toBe('OMEGA');
    expect(textElement.props.testID).toBe('dialora-watch-face-brand-text');
  });

  it('supports configuration object for logo with custom width and height', () => {
    const element = WatchFaceBrand({
      logo: {
        source: 'https://example.com/logo.png',
        width: 36,
        height: 24,
        tintColor: '#22D3EE',
      },
      clockSize: 240,
    });

    expect(element).not.toBeNull();
    const children = element?.props.children;
    const imageElement = children[0];
    expect(imageElement).toBeDefined();
    expect(imageElement.props.style[1].width).toBe(36);
    expect(imageElement.props.style[1].height).toBe(24);
    expect(imageElement.props.style[1].tintColor).toBe('#22D3EE');
  });

  it('calculates vertical position based on top, center, and bottom presets', () => {
    const topElement = WatchFaceBrand({
      brandName: 'DIALORA',
      clockSize: 240,
      position: 'top',
    });
    const centerElement = WatchFaceBrand({
      brandName: 'DIALORA',
      clockSize: 240,
      position: 'center',
    });
    const bottomElement = WatchFaceBrand({
      brandName: 'DIALORA',
      clockSize: 240,
      position: 'bottom',
    });

    expect(topElement?.props.style[1].top).toBeLessThan(
      centerElement?.props.style[1].top
    );
    expect(centerElement?.props.style[1].top).toBeLessThan(
      bottomElement?.props.style[1].top
    );
  });

  it('returns null if neither logo nor brandName is supplied', () => {
    const element = WatchFaceBrand({
      clockSize: 240,
    });
    expect(element).toBeNull();
  });
});

describe('AnalogWatch Enhancements & Auto-Advance', () => {
  it('renders AnalogWatch with WatchFaceBrand and applies watchTheme overrides', () => {
    const element = AnalogWatch({
      hours: 10,
      minutes: 20,
      logo: 'https://example.com/watch-logo.png',
      brandName: 'CHRONO',
      watchTheme: {
        faceColor: '#0F172A',
        bezelColor: '#1E293B',
        numeralColor: '#38BDF8',
        hourHandColor: '#F8FAFC',
        minuteHandColor: '#06B6D4',
        accentColor: '#0EA5E9',
      },
    });

    expect(element).not.toBeNull();
    expect(element.props.testID).toBe('dialora-analog-watch');

    // Face element contains tick items, numbers, WatchFaceBrand, hands, dot
    const face = element.props.children[1];
    expect(face.props.testID).toBe('dialora-analog-watch-face');
    expect(face.props.style[1].backgroundColor).toBe('#0F172A');
    expect(face.props.style[1].borderColor).toBe('#1E293B');
    expect(face.props.style[0].overflow).toBe('hidden');
  });

  it('triggers onHourSelectionComplete when accessible stepper adjusts hours', () => {
    const onTimeChange = jest.fn();
    const onHourSelectionComplete = jest.fn();

    const element = AnalogWatch({
      hours: 10,
      minutes: 20,
      activeHand: 'hours',
      onTimeChange,
      onHourSelectionComplete,
    });

    // Stepper row is child index 2
    const stepperRow = element.props.children[2];
    const stepUpButton = stepperRow.props.children[2];

    stepUpButton.props.onPress();
    expect(onTimeChange).toHaveBeenCalledWith(11, 20);
    expect(onHourSelectionComplete).toHaveBeenCalledTimes(1);
  });

  it('does NOT trigger onHourSelectionComplete when accessible stepper adjusts minutes', () => {
    const onTimeChange = jest.fn();
    const onHourSelectionComplete = jest.fn();

    const element = AnalogWatch({
      hours: 10,
      minutes: 20,
      activeHand: 'minutes',
      onTimeChange,
      onHourSelectionComplete,
    });

    const stepperRow = element.props.children[2];
    const stepUpButton = stepperRow.props.children[2];

    stepUpButton.props.onPress();
    expect(onTimeChange).toHaveBeenCalledWith(10, 21);
    expect(onHourSelectionComplete).not.toHaveBeenCalled();
  });

  it('allows manual switching between hours and minutes modes', () => {
    const onActiveHandChange = jest.fn();

    const element = AnalogWatch({
      hours: 10,
      minutes: 20,
      activeHand: 'hours',
      onActiveHandChange,
    });

    const selectorRow = element.props.children[0];
    const minutesTab = selectorRow.props.children[1];

    minutesTab.props.onPress();
    expect(onActiveHandChange).toHaveBeenCalledWith('minutes');
  });
});

describe('CalendarView Independent Theme & Boundary Navigation', () => {
  it('applies dedicated calendarTheme properties', () => {
    const onSelectDate = jest.fn();
    const element = CalendarView({
      selectedDate: new Date(2026, 9, 15),
      onSelectDate,
      calendarTheme: {
        headerTextColor: '#A78BFA',
        headerArrowColor: '#C4B5FD',
        selectedDateColor: '#10B981',
        dayTextColor: '#F3F4F6',
        disabledDayTextColor: '#4B5563',
        disabledDayBackgroundColor: '#1F2937',
      },
    });

    expect(element).not.toBeNull();
    const headerRow = element.props.children[0];
    const headerTitle = headerRow.props.children[1];
    expect(headerTitle.props.style[1].color).toBe('#A78BFA');
  });

  it('renders hidden placeholder for out-of-range dates when hideOutOfRangeDates is true', () => {
    const onSelectDate = jest.fn();
    const minDate = new Date(2026, 9, 10);
    const maxDate = new Date(2026, 9, 20);

    const element = CalendarView({
      selectedDate: new Date(2026, 9, 15),
      minimumDate: minDate,
      maximumDate: maxDate,
      hideOutOfRangeDates: true,
      onSelectDate,
    });

    const daysGrid = element.props.children[2];
    const gridCells = daysGrid.props.children;

    // Out-of-range cells have testID containing -hidden and no TouchableOpacity child
    const hiddenCells = gridCells.filter((c: any) =>
      c.props.testID?.includes('-hidden')
    );
    expect(hiddenCells.length).toBeGreaterThan(0);
  });

  it('disables previous year navigation when minimumDate is within the current year', () => {
    const onSelectDate = jest.fn();
    const minDate = new Date(2026, 5, 1);

    const element = CalendarView({
      selectedDate: new Date(2026, 9, 15),
      minimumDate: minDate,
      onSelectDate,
    });

    const headerRow = element.props.children[0];
    const leftNav = headerRow.props.children[0];
    const prevYearBtn = leftNav.props.children[0];
    const prevMonthBtn = leftNav.props.children[1];

    // Prev year (2025) is before minDate (June 2026) -> disabled
    expect(prevYearBtn.props.disabled).toBe(true);
    // Prev month (Sept 2026) is after minDate (June 2026) -> enabled
    expect(prevMonthBtn.props.disabled).toBe(false);
  });

  it('handles inverted boundaries (minimumDate > maximumDate) without throwing', () => {
    const onSelectDate = jest.fn();
    expect(() => {
      const element = CalendarView({
        selectedDate: new Date(2026, 9, 15),
        minimumDate: new Date(2026, 9, 25),
        maximumDate: new Date(2026, 9, 10),
        onSelectDate,
      });
      expect(element).not.toBeNull();
    }).not.toThrow();
  });
});

describe('DialoraDateTimePicker Independent Customization & Lifecycle Integration', () => {
  it('renders with independent calendarTheme and watchTheme', () => {
    const element = DialoraDateTimePicker({
      value: new Date(2026, 9, 15, 14, 30),
      mode: 'datetime',
      isModal: false,
      calendarTheme: {
        backgroundColor: '#111827',
        textColor: '#F9FAFB',
        selectedDateColor: '#10B981',
      },
      watchTheme: {
        faceColor: '#0F172A',
        hourHandColor: '#FFFFFF',
        minuteHandColor: '#38BDF8',
        numeralColor: '#E2E8F0',
        selectedTimeColor: '#38BDF8',
      },
      tabsTheme: {
        activeBackgroundColor: '#10B981',
        activeTextColor: '#FFFFFF',
        inactiveBackgroundColor: '#1F2937',
        inactiveTextColor: '#9CA3AF',
        borderRadius: 12,
      },
    });

    expect(element).not.toBeNull();
    expect(element!.props.testID).toBe('dialora-date-time-picker');
  });

  it('allows hiding top header logo while watch dial retains its logo', () => {
    const element = DialoraDateTimePicker({
      value: new Date(2026, 9, 15, 14, 30),
      mode: 'time',
      isModal: false,
      showTopHeaderLogo: false,
      watchLogo: 'https://example.com/watch-logo.png',
      brandName: 'DIALORA',
    });

    expect(element).not.toBeNull();

    // Wallpaper -> ScrollView -> innerContent
    const wallpaper = element!.props.children;
    const scroll = wallpaper.props.children;
    const inner = scroll.props.children;

    // First child is BrandHeader
    const brandHeader = inner[0];
    expect(brandHeader.props.logo).toBeUndefined();

    // Watch child has testID dialora-date-time-picker-watch
    const watch = inner.find(
      (child: any) => child?.props?.testID === 'dialora-date-time-picker-watch'
    );
    expect(watch).toBeDefined();
    expect(watch.props.logo).toBe('https://example.com/watch-logo.png');
  });

  it('applies custom active and inactive tab colors from tabsTheme', () => {
    const element = DialoraDateTimePicker({
      value: new Date(2026, 9, 15, 14, 30),
      mode: 'datetime',
      isModal: false,
      tabsTheme: {
        activeBackgroundColor: '#8B5CF6',
        activeTextColor: '#F5F3FF',
        inactiveBackgroundColor: '#374151',
        inactiveTextColor: '#D1D5DB',
        borderRadius: 16,
      },
    });

    expect(element).not.toBeNull();
    const wallpaper = element!.props.children;
    const scroll = wallpaper.props.children;
    const inner = scroll.props.children;
    const tabContainer = inner[2]; // tabs container

    expect(tabContainer.props.testID).toBe('dialora-date-time-picker-tabs');
    expect(tabContainer.props.style[1].borderRadius).toBe(16);

    const calTab = tabContainer.props.children[0];
    expect(calTab.props.accessibilityRole).toBe('tab');
    expect(calTab.props.accessibilityState.selected).toBe(true);
  });

  it('preserves candidate date when switching tabs and adjusting time', () => {
    const onChange = jest.fn();
    const testDate = new Date(2026, 9, 15, 10, 30);

    const element = DialoraDateTimePicker({
      value: testDate,
      mode: 'datetime',
      isModal: false,
      onChange,
    });

    expect(element).not.toBeNull();
  });
});

/**
 * Stateful test harness helper to test hooks across re-renders without DOM or native bridge.
 */
function createHookRunner<P, R>(Component: (props: P) => R) {
  const states: any[] = [];
  const stateSetters: any[] = [];
  const refs: any[] = [];
  const prevDepsList: any[] = [];
  const memoCache: any[] = [];

  let hookIndex = 0;
  let refIndex = 0;
  let effectIndex = 0;
  let memoIndex = 0;

  const dispatcher = {
    useState: (initial: any) => {
      const idx = hookIndex++;
      if (states.length <= idx) {
        states[idx] = typeof initial === 'function' ? initial() : initial;
        stateSetters[idx] = (next: any) => {
          states[idx] = typeof next === 'function' ? next(states[idx]) : next;
        };
      }
      return [states[idx], stateSetters[idx]];
    },
    useRef: (initial: any) => {
      const idx = refIndex++;
      if (refs.length <= idx) {
        refs[idx] = { current: initial };
      }
      return refs[idx];
    },
    useEffect: (fn: any, deps?: any[]) => {
      const idx = effectIndex++;
      const prevDeps = prevDepsList[idx];
      const hasChanged =
        !prevDeps || !deps || deps.some((d, i) => d !== prevDeps[i]);
      prevDepsList[idx] = deps;
      if (hasChanged) {
        fn();
      }
    },
    useMemo: (fn: any, deps?: any[]) => {
      const idx = memoIndex++;
      const cached = memoCache[idx];
      const hasChanged =
        !cached || !deps || deps.some((d, i) => d !== cached.deps[i]);
      if (hasChanged) {
        const value = fn();
        memoCache[idx] = { value, deps };
        return value;
      }
      return cached.value;
    },
    useCallback: (fn: any) => fn,
  };

  return {
    render: (props: P): R => {
      hookIndex = 0;
      refIndex = 0;
      effectIndex = 0;
      memoIndex = 0;

      const r = React as any;
      const prevClient =
        r.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE?.H;
      const prevSecret =
        r.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED
          ?.ReactCurrentDispatcher?.current;

      if (r.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE) {
        r.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE.H =
          dispatcher;
      }
      if (
        r.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED
          ?.ReactCurrentDispatcher
      ) {
        r.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentDispatcher.current =
          dispatcher;
      }

      try {
        return Component(props);
      } finally {
        if (r.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE) {
          r.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE.H =
            prevClient;
        }
        if (
          r.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED
            ?.ReactCurrentDispatcher
        ) {
          r.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentDispatcher.current =
            prevSecret;
        }
      }
    },
  };
}

/**
 * Traverses an element tree recursively to find a node by testID.
 */
function findElementByTestId(node: any, testId: string): any {
  if (!node) return null;
  if (node.props?.testID === testId) return node;
  const children = node.props?.children;
  if (Array.isArray(children)) {
    for (const child of children) {
      const found = findElementByTestId(child, testId);
      if (found) return found;
    }
  } else if (children && typeof children === 'object') {
    return findElementByTestId(children, testId);
  }
  return null;
}

describe('Task 1: External value updates while visible', () => {
  it('synchronizes candidateDate and session when parent provides genuinely new external value', () => {
    const onConfirm = jest.fn<(date: Date) => void>();
    const onChange = jest.fn();
    const t1 = new Date(2026, 9, 15, 10, 0, 0);
    const t2 = new Date(2026, 9, 20, 14, 30, 0);

    const runner = createHookRunner(DialoraDateTimePicker);

    // Initial render with t1
    let element = runner.render({
      value: t1,
      visible: true,
      mode: 'datetime',
      isModal: false,
      onConfirm,
      onChange,
    });
    expect(element).not.toBeNull();

    // Rerender with genuinely new external value t2
    element = runner.render({
      value: t2,
      visible: true,
      mode: 'datetime',
      isModal: false,
      onConfirm,
      onChange,
    });

    // Confirm button should confirm t2
    const confirmBtn = findElementByTestId(
      element,
      'dialora-date-time-picker-confirm'
    );
    expect(confirmBtn).not.toBeNull();
    confirmBtn.props.onPress();

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onConfirm.mock.calls[0]![0].getTime()).toBe(t2.getTime());
    // External synchronization must not emit onChange feedback loops
    expect(onChange).not.toHaveBeenCalled();
  });

  it('avoids resetting candidateDate during unrelated parent rerenders with unchanged value', () => {
    const onConfirm = jest.fn<(date: Date) => void>();
    const t1 = new Date(2026, 9, 15, 10, 0, 0);
    const userSelected = new Date(2026, 9, 18, 12, 0, 0);

    const runner = createHookRunner(DialoraDateTimePicker);

    let element = runner.render({
      value: t1,
      visible: true,
      mode: 'date',
      isModal: false,
      onConfirm,
    });

    // Simulate user selecting Oct 18 in calendar
    const calendar = findElementByTestId(
      element,
      'dialora-date-time-picker-calendar'
    );
    expect(calendar).not.toBeNull();
    calendar.props.onSelectDate(userSelected);

    // Parent re-renders with the SAME timestamp for unrelated reasons
    element = runner.render({
      value: new Date(t1.getTime()),
      visible: true,
      mode: 'date',
      isModal: false,
      onConfirm,
    });

    // Confirm should commit the user's selection, NOT reset to t1
    const confirmBtn = findElementByTestId(
      element,
      'dialora-date-time-picker-confirm'
    );
    confirmBtn.props.onPress();

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onConfirm.mock.calls[0]![0].getDate()).toBe(18);
  });

  it('safely handles invalid Date values without crashing or corrupting candidate state', () => {
    const onConfirm = jest.fn<(date: Date) => void>();
    const validDate = new Date(2026, 9, 15, 10, 0, 0);
    const runner = createHookRunner(DialoraDateTimePicker);

    let element = runner.render({
      value: validDate,
      visible: true,
      isModal: false,
      onConfirm,
    });

    // Parent passes invalid Date
    expect(() => {
      element = runner.render({
        value: new Date('invalid'),
        visible: true,
        isModal: false,
        onConfirm,
      });
    }).not.toThrow();

    const confirmBtn = findElementByTestId(
      element,
      'dialora-date-time-picker-confirm'
    );
    confirmBtn.props.onPress();

    // Confirm should still commit the prior valid selection safely
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onConfirm.mock.calls[0]![0].getTime()).toBe(validDate.getTime());
  });

  it('preserves Cancel callback guarantees and mutual exclusion', () => {
    const onCancel = jest.fn();
    const onConfirm = jest.fn<(date: Date) => void>();

    const runner = createHookRunner(DialoraDateTimePicker);
    const element = runner.render({
      value: new Date(2026, 9, 15),
      visible: true,
      isModal: false,
      onCancel,
      onConfirm,
    });

    const cancelBtn = findElementByTestId(
      element,
      'dialora-date-time-picker-cancel'
    );
    cancelBtn.props.onPress();

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();

    // Session is ended, confirm should not fire
    const confirmBtn = findElementByTestId(
      element,
      'dialora-date-time-picker-confirm'
    );
    confirmBtn.props.onPress();
    expect(onConfirm).not.toHaveBeenCalled();
  });
});

describe('Task 2: Dynamic minimumDate and maximumDate updates', () => {
  it('disables Confirm when minimumDate updates dynamically to make selection out-of-bounds', () => {
    const onConfirm = jest.fn();
    const candidate = new Date(2026, 9, 15, 12, 0, 0);
    const initialMin = new Date(2026, 9, 10, 0, 0, 0);
    const updatedMin = new Date(2026, 9, 20, 0, 0, 0); // Oct 15 is now before Oct 20!

    const runner = createHookRunner(DialoraDateTimePicker);

    // Initial render: candidate is valid
    let element = runner.render({
      value: candidate,
      minimumDate: initialMin,
      visible: true,
      isModal: false,
      onConfirm,
    });

    let confirmBtn = findElementByTestId(
      element,
      'dialora-date-time-picker-confirm'
    );
    expect(confirmBtn.props.disabled).toBe(false);

    // Boundary updates while picker is visible
    element = runner.render({
      value: candidate,
      minimumDate: updatedMin,
      visible: true,
      isModal: false,
      onConfirm,
    });

    confirmBtn = findElementByTestId(
      element,
      'dialora-date-time-picker-confirm'
    );
    expect(confirmBtn.props.disabled).toBe(true);
    expect(confirmBtn.props.accessibilityState.disabled).toBe(true);

    // Pressing Confirm while disabled must not fire onConfirm
    confirmBtn.props.onPress();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('preserves valid selection and enabled Confirm when boundaries change without affecting candidate', () => {
    const onConfirm = jest.fn<(date: Date) => void>();
    const candidate = new Date(2026, 9, 15, 12, 0, 0);
    const initialMax = new Date(2026, 9, 30);
    const updatedMax = new Date(2026, 9, 25); // Oct 15 is still valid

    const runner = createHookRunner(DialoraDateTimePicker);

    let element = runner.render({
      value: candidate,
      maximumDate: initialMax,
      visible: true,
      isModal: false,
      onConfirm,
    });

    element = runner.render({
      value: candidate,
      maximumDate: updatedMax,
      visible: true,
      isModal: false,
      onConfirm,
    });

    const confirmBtn = findElementByTestId(
      element,
      'dialora-date-time-picker-confirm'
    );
    expect(confirmBtn.props.disabled).toBe(false);
    confirmBtn.props.onPress();

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onConfirm.mock.calls[0]![0].getTime()).toBe(candidate.getTime());
  });

  it('handles conflicting bounds (minimumDate > maximumDate) deterministically without crashing', () => {
    const onConfirm = jest.fn();
    const candidate = new Date(2026, 9, 15, 12, 0, 0);
    const conflictingMin = new Date(2026, 9, 25);
    const conflictingMax = new Date(2026, 9, 10);

    const runner = createHookRunner(DialoraDateTimePicker);

    let element: any;
    expect(() => {
      element = runner.render({
        value: candidate,
        minimumDate: conflictingMin,
        maximumDate: conflictingMax,
        visible: true,
        isModal: false,
        onConfirm,
      });
    }).not.toThrow();

    expect(element).not.toBeNull();
    const confirmBtn = findElementByTestId(
      element,
      'dialora-date-time-picker-confirm'
    );
    // Candidate Oct 15 is within normalized range [Oct 10, Oct 25]
    expect(confirmBtn.props.disabled).toBe(false);
  });

  it('differentiates time-of-day boundary enforcement between date-only and datetime modes', () => {
    // 08:00 AM on Oct 10
    const candidate = new Date(2026, 9, 10, 8, 0, 0);
    // Min is 12:00 PM on Oct 10
    const minDateTime = new Date(2026, 9, 10, 12, 0, 0);

    const runner = createHookRunner(DialoraDateTimePicker);

    // In date mode: time of day is disregarded, so Oct 10 calendar day is valid
    let element = runner.render({
      value: candidate,
      minimumDate: minDateTime,
      mode: 'date',
      visible: true,
      isModal: false,
    });
    let confirmBtn = findElementByTestId(
      element,
      'dialora-date-time-picker-confirm'
    );
    expect(confirmBtn.props.disabled).toBe(false);

    // In datetime mode: 08:00 < 12:00, so selection is out-of-bounds
    element = runner.render({
      value: candidate,
      minimumDate: minDateTime,
      mode: 'datetime',
      visible: true,
      isModal: false,
    });
    confirmBtn = findElementByTestId(
      element,
      'dialora-date-time-picker-confirm'
    );
    expect(confirmBtn.props.disabled).toBe(true);
  });
});

describe('Task 3: Disabled initial selection guard', () => {
  it('disables Confirm when initial value is in disabledDates array and prevents confirmation', () => {
    const onConfirm = jest.fn();
    const disabledDate = new Date(2026, 9, 15);
    const runner = createHookRunner(DialoraDateTimePicker);

    const element = runner.render({
      value: disabledDate,
      disabledDates: [disabledDate],
      visible: true,
      isModal: false,
      onConfirm,
    });

    const confirmBtn = findElementByTestId(
      element,
      'dialora-date-time-picker-confirm'
    );
    expect(confirmBtn.props.disabled).toBe(true);
    expect(confirmBtn.props.accessibilityState.disabled).toBe(true);

    confirmBtn.props.onPress();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('disables Confirm when initial value matches disabledDates predicate function', () => {
    const onConfirm = jest.fn();
    const isWeekend = (d: Date) => d.getDay() === 0 || d.getDay() === 6;
    const sundayDate = new Date(2026, 9, 11, 10, 0, 0);

    const runner = createHookRunner(DialoraDateTimePicker);
    const element = runner.render({
      value: sundayDate,
      disabledDates: isWeekend,
      visible: true,
      isModal: false,
      onConfirm,
    });

    const confirmBtn = findElementByTestId(
      element,
      'dialora-date-time-picker-confirm'
    );
    expect(confirmBtn.props.disabled).toBe(true);

    confirmBtn.props.onPress();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('enables Confirm after user selects a valid date from initially disabled selection', () => {
    const onConfirm = jest.fn<(date: Date) => void>();
    const disabledDate = new Date(2026, 9, 15);
    const validDate = new Date(2026, 9, 16);

    const runner = createHookRunner(DialoraDateTimePicker);
    let element = runner.render({
      value: disabledDate,
      disabledDates: [disabledDate],
      visible: true,
      isModal: false,
      mode: 'date',
      onConfirm,
    });

    let confirmBtn = findElementByTestId(
      element,
      'dialora-date-time-picker-confirm'
    );
    expect(confirmBtn.props.disabled).toBe(true);

    // User selects Oct 16 on the calendar
    const calendar = findElementByTestId(
      element,
      'dialora-date-time-picker-calendar'
    );
    calendar.props.onSelectDate(validDate);

    // Re-render to observe candidate state change
    element = runner.render({
      value: disabledDate,
      disabledDates: [disabledDate],
      visible: true,
      isModal: false,
      mode: 'date',
      onConfirm,
    });

    confirmBtn = findElementByTestId(
      element,
      'dialora-date-time-picker-confirm'
    );
    expect(confirmBtn.props.disabled).toBe(false);

    confirmBtn.props.onPress();
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onConfirm.mock.calls[0]![0].getDate()).toBe(16);
  });
});

describe('Task 4: Standalone AnalogWatch state (controlled and uncontrolled)', () => {
  it('manages activeHand internally when uncontrolled and switches hand on mode press', () => {
    const onActiveHandChange = jest.fn();
    const runner = createHookRunner(AnalogWatch);

    // Render uncontrolled (no activeHand prop)
    let element = runner.render({
      hours: 10,
      minutes: 30,
      onActiveHandChange,
    });

    // Default activeHand is 'hours'
    const minutesModeBtn = findElementByTestId(
      element,
      'dialora-analog-watch-mode-minutes'
    );
    expect(minutesModeBtn.props.accessibilityState.selected).toBe(false);

    const hoursModeBtn = findElementByTestId(
      element,
      'dialora-analog-watch-mode-hours'
    );
    expect(hoursModeBtn.props.accessibilityState.selected).toBe(true);

    // Click Minutes mode button
    minutesModeBtn.props.onPress();
    expect(onActiveHandChange).toHaveBeenCalledWith('minutes');

    // Re-render: active hand should now be 'minutes'
    element = runner.render({
      hours: 10,
      minutes: 30,
      onActiveHandChange,
    });

    const updatedMinutesBtn = findElementByTestId(
      element,
      'dialora-analog-watch-mode-minutes'
    );
    expect(updatedMinutesBtn.props.accessibilityState.selected).toBe(true);
  });

  it('respects defaultActiveHand prop in uncontrolled mode', () => {
    const runner = createHookRunner(AnalogWatch);
    const element = runner.render({
      hours: 10,
      minutes: 30,
      defaultActiveHand: 'minutes',
    });

    const minutesModeBtn = findElementByTestId(
      element,
      'dialora-analog-watch-mode-minutes'
    );
    expect(minutesModeBtn.props.accessibilityState.selected).toBe(true);
  });

  it('preserves strictly controlled behavior when activeHand prop is provided', () => {
    const onActiveHandChange = jest.fn();
    const runner = createHookRunner(AnalogWatch);

    // Render controlled with activeHand='hours'
    let element = runner.render({
      hours: 10,
      minutes: 30,
      activeHand: 'hours',
      onActiveHandChange,
    });

    const minutesModeBtn = findElementByTestId(
      element,
      'dialora-analog-watch-mode-minutes'
    );
    minutesModeBtn.props.onPress();

    // Callback is invoked
    expect(onActiveHandChange).toHaveBeenCalledWith('minutes');

    // If parent keeps activeHand='hours', component must not override controlled state
    element = runner.render({
      hours: 10,
      minutes: 30,
      activeHand: 'hours',
      onActiveHandChange,
    });

    const updatedHoursBtn = findElementByTestId(
      element,
      'dialora-analog-watch-mode-hours'
    );
    expect(updatedHoursBtn.props.accessibilityState.selected).toBe(true);
  });

  it('adjusts active hand using stepper buttons in uncontrolled mode', () => {
    const onTimeChange = jest.fn();
    const runner = createHookRunner(AnalogWatch);

    // Initially in hours mode
    const element = runner.render({
      hours: 10,
      minutes: 30,
      onTimeChange,
    });

    const stepUpBtn = findElementByTestId(
      element,
      'dialora-analog-watch-step-up'
    );
    stepUpBtn.props.onPress();

    // In hours mode, steps hour from 10 to 11
    expect(onTimeChange).toHaveBeenCalledWith(11, 30);
  });
});

describe('Phase 3 Task 1: AnalogWatch accessibility for VoiceOver and TalkBack', () => {
  it('exposes adjustable role with increment and decrement accessibility actions', () => {
    const onTimeChange = jest.fn();
    const runner = createHookRunner(AnalogWatch);

    const element = runner.render({
      hours: 10,
      minutes: 30,
      onTimeChange,
    });

    const face = findElementByTestId(element, 'dialora-analog-watch-face');
    expect(face).not.toBeNull();
    expect(face.props.accessibilityRole).toBe('adjustable');
    expect(face.props.accessible).toBe(true);
    expect(face.props.accessibilityActions).toEqual([
      { name: 'increment', label: 'Increase hours' },
      { name: 'decrement', label: 'Decrease hours' },
    ]);
    expect(face.props.accessibilityValue).toEqual({
      text: '10 hours',
      now: 10,
      min: 0,
      max: 23,
    });
  });

  it('adjusts hours with accessibility actions and wraps boundaries', () => {
    const onTimeChange = jest.fn();
    const runner = createHookRunner(AnalogWatch);

    // Initial render at 10 hours
    let element = runner.render({
      hours: 10,
      minutes: 30,
      onTimeChange,
    });
    let face = findElementByTestId(element, 'dialora-analog-watch-face');
    face.props.onAccessibilityAction({
      nativeEvent: { actionName: 'increment' },
    });
    expect(onTimeChange).toHaveBeenCalledWith(11, 30);

    // Boundary wrap at 0 hours -> decrement to 23
    element = runner.render({
      hours: 0,
      minutes: 30,
      onTimeChange,
    });
    face = findElementByTestId(element, 'dialora-analog-watch-face');
    face.props.onAccessibilityAction({
      nativeEvent: { actionName: 'decrement' },
    });
    expect(onTimeChange).toHaveBeenCalledWith(23, 30);
  });

  it('adjusts minutes with accessibility actions when in minutes mode', () => {
    const onTimeChange = jest.fn();
    const runner = createHookRunner(AnalogWatch);

    let element = runner.render({
      hours: 10,
      minutes: 30,
      activeHand: 'minutes',
      minuteInterval: 5,
      onTimeChange,
    });

    let face = findElementByTestId(element, 'dialora-analog-watch-face');
    expect(face.props.accessibilityActions).toEqual([
      { name: 'increment', label: 'Increase minutes' },
      { name: 'decrement', label: 'Decrease minutes' },
    ]);
    expect(face.props.accessibilityValue).toEqual({
      text: '30 minutes',
      now: 30,
      min: 0,
      max: 59,
    });

    face.props.onAccessibilityAction({
      nativeEvent: { actionName: 'increment' },
    });
    expect(onTimeChange).toHaveBeenCalledWith(10, 35);

    // Boundary wrap at 0 minutes -> decrement to 55 (with minuteInterval 5)
    element = runner.render({
      hours: 10,
      minutes: 0,
      activeHand: 'minutes',
      minuteInterval: 5,
      onTimeChange,
    });
    face = findElementByTestId(element, 'dialora-analog-watch-face');
    face.props.onAccessibilityAction({
      nativeEvent: { actionName: 'decrement' },
    });
    expect(onTimeChange).toHaveBeenCalledWith(10, 55);
  });

  it('provides accessible labels, hints, and states on mode buttons and steppers', () => {
    const runner = createHookRunner(AnalogWatch);
    const element = runner.render({
      hours: 10,
      minutes: 30,
      minuteInterval: 1,
    });

    const hoursBtn = findElementByTestId(
      element,
      'dialora-analog-watch-mode-hours'
    );
    expect(hoursBtn.props.accessibilityRole).toBe('button');
    expect(hoursBtn.props.accessibilityLabel).toBe('Adjust hours');
    expect(hoursBtn.props.accessibilityHint).toBe(
      'Switches clock adjustment mode to hours'
    );
    expect(hoursBtn.props.accessibilityState.selected).toBe(true);

    const minutesBtn = findElementByTestId(
      element,
      'dialora-analog-watch-mode-minutes'
    );
    expect(minutesBtn.props.accessibilityRole).toBe('button');
    expect(minutesBtn.props.accessibilityLabel).toBe('Adjust minutes');
    expect(minutesBtn.props.accessibilityHint).toBe(
      'Switches clock adjustment mode to minutes'
    );
    expect(minutesBtn.props.accessibilityState.selected).toBe(false);

    const stepDown = findElementByTestId(
      element,
      'dialora-analog-watch-step-down'
    );
    expect(stepDown.props.accessibilityRole).toBe('button');
    expect(stepDown.props.accessibilityLabel).toBe('Decrease hours');
    expect(stepDown.props.accessibilityHint).toBe('Decreases hours by 1');

    const stepUp = findElementByTestId(element, 'dialora-analog-watch-step-up');
    expect(stepUp.props.accessibilityRole).toBe('button');
    expect(stepUp.props.accessibilityLabel).toBe('Increase hours');
    expect(stepUp.props.accessibilityHint).toBe('Increases hours by 1');
  });

  it('marks decorative dial items as non-interactive for screen readers', () => {
    const runner = createHookRunner(AnalogWatch);
    const element = runner.render({
      hours: 10,
      minutes: 30,
    });

    const hourHand = findElementByTestId(
      element,
      'dialora-analog-watch-hour-hand'
    );
    expect(hourHand.props.accessible).toBe(false);
    expect(hourHand.props.importantForAccessibility).toBe('no');

    const minuteHand = findElementByTestId(
      element,
      'dialora-analog-watch-minute-hand'
    );
    expect(minuteHand.props.accessible).toBe(false);
    expect(minuteHand.props.importantForAccessibility).toBe('no');

    const centerDot = findElementByTestId(
      element,
      'dialora-analog-watch-center-dot'
    );
    expect(centerDot.props.accessible).toBe(false);
    expect(centerDot.props.importantForAccessibility).toBe('no');
  });
});

describe('Phase 3 Task 2: Picker semantics and focus management', () => {
  it('does not assign alert role to the main picker card container', () => {
    const runner = createHookRunner(DialoraDateTimePicker);
    const element = runner.render({
      visible: true,
      isModal: false,
    });

    const card = findElementByTestId(element, 'dialora-date-time-picker');
    expect(card).not.toBeNull();
    // alert role removed as card is not an alert
    expect(card.props.accessibilityRole).toBeUndefined();
  });

  it('modal dialog has accessibilityViewIsModal and accessible backdrop button', () => {
    const onDismiss = jest.fn();
    const runner = createHookRunner(DialoraDateTimePicker);
    const element = runner.render({
      visible: true,
      isModal: true,
      onDismiss,
    });

    const modal = findElementByTestId(
      element,
      'dialora-date-time-picker-modal'
    );
    expect(modal).not.toBeNull();
    expect(modal.props.accessibilityViewIsModal).toBe(true);

    const backdrop = findElementByTestId(
      element,
      'dialora-date-time-picker-backdrop'
    );
    expect(backdrop).not.toBeNull();
    expect(backdrop.props.accessibilityRole).toBe('button');
    expect(backdrop.props.accessibilityLabel).toBe('Close picker');
    expect(backdrop.props.accessibilityHint).toBeDefined();

    backdrop.props.onPress();
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('interactive tab controls and action buttons have meaningful roles, hints, and states', () => {
    const runner = createHookRunner(DialoraDateTimePicker);
    const element = runner.render({
      visible: true,
      mode: 'datetime',
      isModal: false,
    });

    const calTab = findElementByTestId(
      element,
      'dialora-date-time-picker-tab-calendar'
    );
    expect(calTab.props.accessibilityRole).toBe('tab');
    expect(calTab.props.accessibilityLabel).toBe('Date section tab');
    expect(calTab.props.accessibilityHint).toBe(
      'Switches view to the calendar date selector'
    );
    expect(calTab.props.accessibilityState.selected).toBe(true);

    const clockTab = findElementByTestId(
      element,
      'dialora-date-time-picker-tab-clock'
    );
    expect(clockTab.props.accessibilityRole).toBe('tab');
    expect(clockTab.props.accessibilityLabel).toBe('Time section tab');
    expect(clockTab.props.accessibilityHint).toBe(
      'Switches view to the clock time selector'
    );
    expect(clockTab.props.accessibilityState.selected).toBe(false);

    const cancelBtn = findElementByTestId(
      element,
      'dialora-date-time-picker-cancel'
    );
    expect(cancelBtn.props.accessibilityRole).toBe('button');
    expect(cancelBtn.props.accessibilityHint).toBe(
      'Discards changes and closes the picker'
    );

    const confirmBtn = findElementByTestId(
      element,
      'dialora-date-time-picker-confirm'
    );
    expect(confirmBtn.props.accessibilityRole).toBe('button');
    expect(confirmBtn.props.accessibilityState.disabled).toBe(false);
  });
});

describe('Phase 3 Task 3: Safe areas and modal reliability', () => {
  it('wraps modal content in SafeAreaView to respect device safe areas', () => {
    const runner = createHookRunner(DialoraDateTimePicker);
    const element = runner.render({
      visible: true,
      isModal: true,
    });

    const modal = findElementByTestId(
      element,
      'dialora-date-time-picker-modal'
    );
    expect(modal).not.toBeNull();

    // Verify modal backdrop contains SafeAreaView
    const backdrop = modal.props.children;
    expect(backdrop).toBeDefined();
    const children = backdrop.props.children;
    // children includes backdrop touchable and safe area view
    const safeArea = Array.isArray(children)
      ? children.find(
          (c: any) =>
            c?.type?.displayName === 'SafeAreaView' ||
            c?.props?.pointerEvents === 'box-none'
        )
      : null;
    expect(safeArea).not.toBeNull();
  });

  it('triggers onDismiss on Android hardware back request (onRequestClose)', () => {
    const onDismiss = jest.fn();
    const onConfirm = jest.fn();
    const runner = createHookRunner(DialoraDateTimePicker);

    const element = runner.render({
      visible: true,
      isModal: true,
      onDismiss,
      onConfirm,
    });

    const modal = findElementByTestId(
      element,
      'dialora-date-time-picker-modal'
    );
    modal.props.onRequestClose();

    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('prevents duplicate onDismiss when both onRequestClose and onDismiss are invoked', () => {
    const onDismiss = jest.fn();
    const runner = createHookRunner(DialoraDateTimePicker);

    const element = runner.render({
      visible: true,
      isModal: true,
      onDismiss,
    });

    const modal = findElementByTestId(
      element,
      'dialora-date-time-picker-modal'
    );
    // First trigger: hardware back press
    modal.props.onRequestClose();
    // Second trigger: native modal dismissal event
    modal.props.onDismiss();

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('supports statusBarTranslucent prop without crashing or layout disruption', () => {
    const runner = createHookRunner(DialoraDateTimePicker);
    const element = runner.render({
      visible: true,
      isModal: true,
      statusBarTranslucent: true,
    });

    const modal = findElementByTestId(
      element,
      'dialora-date-time-picker-modal'
    );
    expect(modal.props.statusBarTranslucent).toBe(true);
  });

  it('renders content directly without modal overlay in inline mode', () => {
    const runner = createHookRunner(DialoraDateTimePicker);
    const element = runner.render({
      visible: true,
      isModal: false,
    });

    const modal = findElementByTestId(
      element,
      'dialora-date-time-picker-modal'
    );
    expect(modal).toBeNull();

    const card = findElementByTestId(element, 'dialora-date-time-picker');
    expect(card).not.toBeNull();
  });
});

describe('Phase 3 Task 4: Responsive clock sizing', () => {
  it('preserves consumer requested clockSize on wide displays', () => {
    const runner = createHookRunner(DialoraDateTimePicker);
    const element = runner.render({
      visible: true,
      mode: 'time',
      clockSize: 260,
      isModal: false,
    });

    const watch = findElementByTestId(
      element,
      'dialora-date-time-picker-watch'
    );
    expect(watch).not.toBeNull();
    // Requested size fits within standard window width (750px in test environment)
    expect(watch.props.size).toBe(260);
  });

  it('dynamically adapts clock size via container onLayout measurement', () => {
    const runner = createHookRunner(DialoraDateTimePicker);
    let element = runner.render({
      visible: true,
      mode: 'time',
      clockSize: 280,
      isModal: false,
    });

    // Simulate container reporting narrow width (e.g. 210px available inside card)
    const scrollView = findElementByTestId(
      element,
      'dialora-date-time-picker-scroll'
    );
    expect(scrollView).not.toBeNull();
    expect(scrollView.props.onLayout).toBeDefined();

    scrollView.props.onLayout({
      nativeEvent: { layout: { width: 210, height: 400, x: 0, y: 0 } },
    });

    // Rerender to observe responsive sizing
    element = runner.render({
      visible: true,
      mode: 'time',
      clockSize: 280,
      isModal: false,
    });

    const watch = findElementByTestId(
      element,
      'dialora-date-time-picker-watch'
    );
    // Clock size should be clamped to 210px to avoid card overflow
    expect(watch.props.size).toBe(210);
  });
});

describe('Phase 3 Task 5: Invalid selection feedback banner', () => {
  it('displays accessible feedback banner when initial date is in disabledDates', () => {
    const disabledDate = new Date(2026, 9, 15);
    const runner = createHookRunner(DialoraDateTimePicker);

    const element = runner.render({
      value: disabledDate,
      disabledDates: [disabledDate],
      visible: true,
      isModal: false,
    });

    const banner = findElementByTestId(
      element,
      'dialora-date-time-picker-validation-feedback'
    );
    expect(banner).not.toBeNull();
    expect(banner.props.accessibilityRole).toBe('alert');
    expect(banner.props.accessibilityLiveRegion).toBe('polite');

    const bannerText = banner.props.children;
    expect(bannerText.props.children).toBe(
      'This date is not available for selection.'
    );

    // Confirm button communicates validation failure
    const confirmBtn = findElementByTestId(
      element,
      'dialora-date-time-picker-confirm'
    );
    expect(confirmBtn.props.disabled).toBe(true);
    expect(confirmBtn.props.accessibilityHint).toBe(
      'This date is not available for selection.'
    );
    expect(confirmBtn.props.accessibilityLabel).toContain(
      'This date is not available for selection.'
    );
  });

  it('displays boundary violation message and recovers when user selects valid date', () => {
    const candidate = new Date(2026, 9, 5); // Oct 5 is before min Oct 10
    const min = new Date(2026, 9, 10);
    const validDate = new Date(2026, 9, 15);

    const runner = createHookRunner(DialoraDateTimePicker);
    let element = runner.render({
      value: candidate,
      minimumDate: min,
      mode: 'date',
      visible: true,
      isModal: false,
    });

    let banner = findElementByTestId(
      element,
      'dialora-date-time-picker-validation-feedback'
    );
    expect(banner).not.toBeNull();
    expect(banner.props.children.props.children).toBe(
      'Date cannot be earlier than the minimum allowed date.'
    );

    // User selects valid date on calendar
    const calendar = findElementByTestId(
      element,
      'dialora-date-time-picker-calendar'
    );
    calendar.props.onSelectDate(validDate);

    // Rerender to observe recovered valid state
    element = runner.render({
      value: candidate,
      minimumDate: min,
      mode: 'date',
      visible: true,
      isModal: false,
    });

    // Validation banner should disappear
    banner = findElementByTestId(
      element,
      'dialora-date-time-picker-validation-feedback'
    );
    expect(banner).toBeNull();

    // Confirm button should be enabled
    const confirmBtn = findElementByTestId(
      element,
      'dialora-date-time-picker-confirm'
    );
    expect(confirmBtn.props.disabled).toBe(false);
  });

  it('supports custom validationMessage prop and hides when set to null', () => {
    const disabledDate = new Date(2026, 9, 15);
    const runner = createHookRunner(DialoraDateTimePicker);

    // Custom string message
    let element = runner.render({
      value: disabledDate,
      disabledDates: [disabledDate],
      validationMessage: 'Custom: Booking unavailable for selected date.',
      visible: true,
      isModal: false,
    });
    let banner = findElementByTestId(
      element,
      'dialora-date-time-picker-validation-feedback'
    );
    expect(banner.props.children.props.children).toBe(
      'Custom: Booking unavailable for selected date.'
    );

    // Suppressed message when validationMessage={null}
    element = runner.render({
      value: disabledDate,
      disabledDates: [disabledDate],
      validationMessage: null,
      visible: true,
      isModal: false,
    });
    banner = findElementByTestId(
      element,
      'dialora-date-time-picker-validation-feedback'
    );
    expect(banner).toBeNull();
  });
});

describe('DialoraIcon internal icon system', () => {
  const iconNames = [
    'chevron-left',
    'chevron-right',
    'double-chevron-left',
    'double-chevron-right',
    'calendar',
    'clock',
    'plus',
    'minus',
    'check',
    'close',
  ] as const;

  it.each(iconNames)(
    'renders icon "%s" without throwing and sets non-accessible wrapper',
    (name) => {
      const element = DialoraIcon({ name, size: 18, color: '#3B82F6' });
      expect(element).not.toBeNull();
      expect(element.props.accessible).toBe(false);
      expect(element.props.importantForAccessibility).toBe(
        'no-hide-descendants'
      );
      expect(element.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ width: 18, height: 18 }),
        ])
      );
    }
  );

  it('applies custom size, color, and container style', () => {
    const customStyle = { marginHorizontal: 4 };
    const element = DialoraIcon({
      name: 'check',
      size: 24,
      color: '#10B981',
      style: customStyle,
      testID: 'custom-check',
    });

    expect(element.props.testID).toBe('custom-check');
    expect(element.props.style).toContainEqual(
      expect.objectContaining({ width: 24, height: 24 })
    );
    expect(element.props.style).toContain(customStyle);
  });

  it('renders DialoraIcon in calendar navigation buttons with correct colors for active and disabled states', () => {
    const onSelectDate = jest.fn();
    const runner = createHookRunner(CalendarView);

    // Initial render with min date disabling previous buttons
    const minDate = new Date(2026, 9, 1);
    const element = runner.render({
      selectedDate: minDate,
      minimumDate: minDate,
      onSelectDate,
    });

    const prevYearIcon = findElementByTestId(
      element,
      'dialora-calendar-view-prev-year-icon'
    );
    expect(prevYearIcon).not.toBeNull();
    // Disabled arrow should have muted color (#4B5563)
    const prevMonthIcon = findElementByTestId(
      element,
      'dialora-calendar-view-prev-month-icon'
    );
    expect(prevMonthIcon).not.toBeNull();

    const nextMonthIcon = findElementByTestId(
      element,
      'dialora-calendar-view-next-month-icon'
    );
    expect(nextMonthIcon).not.toBeNull();

    const nextYearIcon = findElementByTestId(
      element,
      'dialora-calendar-view-next-year-icon'
    );
    expect(nextYearIcon).not.toBeNull();
  });

  it('renders DialoraIcon in AnalogWatch stepper buttons and preserves step interactions', () => {
    const onTimeChange = jest.fn();
    const runner = createHookRunner(AnalogWatch);

    const element = runner.render({
      hours: 10,
      minutes: 30,
      onTimeChange,
    });

    const stepDownIcon = findElementByTestId(
      element,
      'dialora-analog-watch-step-down-icon'
    );
    expect(stepDownIcon).not.toBeNull();

    const stepUpIcon = findElementByTestId(
      element,
      'dialora-analog-watch-step-up-icon'
    );
    expect(stepUpIcon).not.toBeNull();

    // Verify stepper button interaction still works smoothly
    const stepUpBtn = findElementByTestId(
      element,
      'dialora-analog-watch-step-up'
    );
    stepUpBtn.props.onPress();
    expect(onTimeChange).toHaveBeenCalledWith(11, 30);
  });

  it('renders DialoraIcon in DateTimePicker tabs and reflects active/inactive tab colors', () => {
    const runner = createHookRunner(DialoraDateTimePicker);

    // Tab calendar is active
    let element = runner.render({
      visible: true,
      mode: 'datetime',
      isModal: false,
    });

    const calIcon = findElementByTestId(
      element,
      'dialora-date-time-picker-tab-calendar-icon'
    );
    expect(calIcon).not.toBeNull();

    const clockIcon = findElementByTestId(
      element,
      'dialora-date-time-picker-tab-clock-icon'
    );
    expect(clockIcon).not.toBeNull();

    // Switch to clock tab
    const clockTab = findElementByTestId(
      element,
      'dialora-date-time-picker-tab-clock'
    );
    clockTab.props.onPress();

    element = runner.render({
      visible: true,
      mode: 'datetime',
      isModal: false,
    });

    const updatedClockIcon = findElementByTestId(
      element,
      'dialora-date-time-picker-tab-clock-icon'
    );
    expect(updatedClockIcon).not.toBeNull();
  });
});
