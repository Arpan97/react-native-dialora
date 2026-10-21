import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { DialoraIcon } from './DialoraIcon';
import type { DialoraCalendarSectionTheme, DialoraTheme } from '../types';
import {
  addMonths,
  formatMonthYear,
  generateCalendarGrid,
  getWeekdayNames,
  isBeforeDay,
  isAfterDay,
  type DisabledDateMatcher,
  type FirstDayOfWeek,
} from '../utils/dateUtils';

export interface CalendarViewProps {
  /** The currently selected candidate date */
  selectedDate?: Date;
  /** Callback invoked when a date is selected */
  onSelectDate: (date: Date) => void;
  /** Earliest selectable date */
  minimumDate?: Date;
  /** Latest selectable date */
  maximumDate?: Date;
  /** Whether to completely hide out-of-range dates while preserving weekday alignment */
  hideOutOfRangeDates?: boolean;
  /** First day of the week (0 = Sunday, 1 = Monday, etc. Defaults to 0) */
  firstDayOfWeek?: FirstDayOfWeek;
  /** Specific dates or predicate to disable */
  disabledDates?: DisabledDateMatcher;
  /** General theme and colors */
  theme?: DialoraTheme;
  /** Dedicated calendar section theme */
  calendarTheme?: DialoraCalendarSectionTheme;
  /** Outer container style */
  style?: StyleProp<ViewStyle>;
  /** Test identifier */
  testID?: string;
}

/**
 * CalendarView
 *
 * A fully interactive, responsive monthly calendar view with leap-year support,
 * custom weekday offsets, boundary restrictions, and selected/today indicators.
 */
export function CalendarView({
  selectedDate,
  onSelectDate,
  minimumDate,
  maximumDate,
  hideOutOfRangeDates = false,
  firstDayOfWeek = 0,
  disabledDates,
  theme,
  calendarTheme,
  style,
  testID = 'dialora-calendar-view',
}: CalendarViewProps) {
  // Safe initial year and month
  const initialRef =
    selectedDate instanceof Date && !isNaN(selectedDate.getTime())
      ? selectedDate
      : new Date();

  const [viewState, setViewState] = useState(() => ({
    year: initialRef.getFullYear(),
    month: initialRef.getMonth(),
  }));

  // Synchronize viewed month if selectedDate changes drastically
  useEffect(() => {
    if (selectedDate instanceof Date && !isNaN(selectedDate.getTime())) {
      setViewState((prev) => {
        if (
          prev.year === selectedDate.getFullYear() &&
          prev.month === selectedDate.getMonth()
        ) {
          return prev;
        }
        return {
          year: selectedDate.getFullYear(),
          month: selectedDate.getMonth(),
        };
      });
    }
  }, [selectedDate]);

  const { year, month } = viewState;

  // Month navigation
  const handleMonthShift = (delta: number) => {
    const next = addMonths(year, month, delta);
    setViewState(next);
  };

  const handleYearShift = (delta: number) => {
    setViewState((prev) => ({ ...prev, year: prev.year + delta }));
  };

  // Safe min/max boundaries (handles invalid min > max safely)
  let safeMin = minimumDate;
  let safeMax = maximumDate;
  if (
    minimumDate &&
    maximumDate &&
    minimumDate.getTime() > maximumDate.getTime()
  ) {
    safeMin = maximumDate;
    safeMax = minimumDate;
  }

  // Navigation boundary checks
  const prevMonthInfo = addMonths(year, month, -1);
  const prevMonthEndDate = new Date(
    prevMonthInfo.year,
    prevMonthInfo.month + 1,
    0
  );
  const isPrevMonthDisabled = Boolean(
    safeMin && isBeforeDay(prevMonthEndDate, safeMin)
  );

  const nextMonthInfo = addMonths(year, month, 1);
  const nextMonthStartDate = new Date(
    nextMonthInfo.year,
    nextMonthInfo.month,
    1
  );
  const isNextMonthDisabled = Boolean(
    safeMax && isAfterDay(nextMonthStartDate, safeMax)
  );

  const prevYearEndDate = new Date(year - 1, 11, 31);
  const isPrevYearDisabled = Boolean(
    safeMin && isBeforeDay(prevYearEndDate, safeMin)
  );

  const nextYearStartDate = new Date(year + 1, 0, 1);
  const isNextYearDisabled = Boolean(
    safeMax && isAfterDay(nextYearStartDate, safeMax)
  );

  // Calendar Theme resolution
  const calTheme = calendarTheme ?? theme?.calendarTheme ?? theme?.calendar;
  const accentColor = theme?.accentColor ?? '#6366F1';
  const headerTextColor =
    calTheme?.headerTextColor ??
    calTheme?.textColor ??
    theme?.textColor ??
    '#FFFFFF';
  const headerArrowColor =
    calTheme?.headerArrowColor ?? theme?.secondaryTextColor ?? '#9CA3AF';
  const weekdayTextColor =
    calTheme?.weekdayTextColor ?? theme?.secondaryTextColor ?? '#9CA3AF';
  const dayTextColor =
    calTheme?.dayTextColor ??
    calTheme?.textColor ??
    theme?.textColor ??
    '#E5E7EB';
  const selectedDayColor =
    calTheme?.selectedDayColor ??
    calTheme?.selectedDateColor ??
    theme?.calendarSelectedColor ??
    theme?.selectedDateColor ??
    accentColor;
  const selectedDayTextColor =
    calTheme?.selectedDayTextColor ?? calTheme?.selectedTextColor ?? '#FFFFFF';
  const todayColor =
    calTheme?.todayColor ?? theme?.calendarTodayColor ?? accentColor;
  const todayTextColor = calTheme?.todayTextColor ?? todayColor;
  const adjacentMonthDayTextColor =
    calTheme?.adjacentMonthDayTextColor ?? '#4B5563';
  const disabledDayTextColor = calTheme?.disabledDayTextColor ?? '#374151';
  const disabledDayBackgroundColor = calTheme?.disabledDayBackgroundColor;

  // Grid cells and weekday headers
  const weekdayNames = getWeekdayNames(firstDayOfWeek, 'narrow');
  const cells = generateCalendarGrid({
    year,
    month,
    selectedDate,
    firstDayOfWeek,
    minimumDate: safeMin,
    maximumDate: safeMax,
    disabledDates,
    hideOutOfRangeDates,
  });

  return (
    <View style={[styles.container, style]} testID={testID}>
      {/* Month & Year Navigation Header */}
      <View style={styles.headerRow}>
        <View style={styles.navGroup}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Previous year"
            disabled={isPrevYearDisabled}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            onPress={() => handleYearShift(-1)}
            style={[
              styles.arrowButton,
              isPrevYearDisabled && styles.disabledButton,
            ]}
            testID={`${testID}-prev-year`}
          >
            <DialoraIcon
              name="double-chevron-left"
              size={14}
              color={isPrevYearDisabled ? '#4B5563' : headerArrowColor}
              testID={`${testID}-prev-year-icon`}
            />
          </TouchableOpacity>

          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Previous month"
            disabled={isPrevMonthDisabled}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            onPress={() => handleMonthShift(-1)}
            style={[
              styles.arrowButton,
              isPrevMonthDisabled && styles.disabledButton,
            ]}
            testID={`${testID}-prev-month`}
          >
            <DialoraIcon
              name="chevron-left"
              size={14}
              color={isPrevMonthDisabled ? '#4B5563' : headerArrowColor}
              testID={`${testID}-prev-month-icon`}
            />
          </TouchableOpacity>
        </View>

        <Text
          style={[styles.headerTitle, { color: headerTextColor }]}
          testID={`${testID}-month-year`}
        >
          {formatMonthYear(year, month)}
        </Text>

        <View style={styles.navGroup}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Next month"
            disabled={isNextMonthDisabled}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            onPress={() => handleMonthShift(1)}
            style={[
              styles.arrowButton,
              isNextMonthDisabled && styles.disabledButton,
            ]}
            testID={`${testID}-next-month`}
          >
            <DialoraIcon
              name="chevron-right"
              size={14}
              color={isNextMonthDisabled ? '#4B5563' : headerArrowColor}
              testID={`${testID}-next-month-icon`}
            />
          </TouchableOpacity>

          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Next year"
            disabled={isNextYearDisabled}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            onPress={() => handleYearShift(1)}
            style={[
              styles.arrowButton,
              isNextYearDisabled && styles.disabledButton,
            ]}
            testID={`${testID}-next-year`}
          >
            <DialoraIcon
              name="double-chevron-right"
              size={14}
              color={isNextYearDisabled ? '#4B5563' : headerArrowColor}
              testID={`${testID}-next-year-icon`}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Weekday Row */}
      <View style={styles.weekdayRow}>
        {weekdayNames.map((name, idx) => (
          <View key={`weekday-${name}-${idx}`} style={styles.cellWrapper}>
            <Text style={[styles.weekdayText, { color: weekdayTextColor }]}>
              {name}
            </Text>
          </View>
        ))}
      </View>

      {/* Days Grid */}
      <View style={styles.daysGrid}>
        {cells.map((cell, idx) => {
          const {
            isSelected,
            isToday,
            isCurrentMonth,
            isDisabled,
            isHidden,
            dayNumber,
            date,
          } = cell;

          const cellTestId = `${testID}-day-${date.getFullYear()}-${date.getMonth() + 1}-${dayNumber}`;

          if (isHidden) {
            return (
              <View
                key={`cell-hidden-${idx}-${date.toISOString()}`}
                style={styles.cellWrapper}
                pointerEvents="none"
                accessibilityElementsHidden={true}
                importantForAccessibility="no-hide-descendants"
                testID={`${cellTestId}-hidden`}
              />
            );
          }

          let textColor = dayTextColor;
          if (isDisabled) {
            textColor = disabledDayTextColor;
          } else if (isSelected) {
            textColor = selectedDayTextColor;
          } else if (isToday) {
            textColor = todayTextColor;
          } else if (!isCurrentMonth) {
            textColor = adjacentMonthDayTextColor;
          }

          return (
            <View
              key={`cell-${idx}-${date.toISOString()}`}
              style={styles.cellWrapper}
            >
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={`${formatMonthYear(cell.year, cell.month)} ${dayNumber}${isSelected ? ', selected' : ''}${isToday ? ', today' : ''}${isDisabled ? ', disabled' : ''}`}
                accessibilityState={{
                  selected: isSelected,
                  disabled: isDisabled,
                }}
                disabled={isDisabled}
                hitSlop={{ top: 2, bottom: 2, left: 2, right: 2 }}
                onPress={() => {
                  onSelectDate(date);
                  // If user clicked adjacent month, slide calendar view to that month
                  if (!isCurrentMonth) {
                    setViewState({ year: cell.year, month: cell.month });
                  }
                }}
                style={[
                  styles.dayButton,
                  isDisabled && disabledDayBackgroundColor
                    ? { backgroundColor: disabledDayBackgroundColor }
                    : null,
                  isSelected && [
                    styles.selectedDayButton,
                    { backgroundColor: selectedDayColor },
                  ],
                  isToday &&
                    !isSelected && [
                      styles.todayButton,
                      { borderColor: todayColor },
                    ],
                ]}
                testID={cellTestId}
              >
                <Text
                  style={[
                    styles.dayText,
                    { color: textColor },
                    isSelected && styles.selectedDayText,
                    isToday && styles.todayText,
                  ]}
                >
                  {dayNumber}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  arrowButton: {
    alignItems: 'center',
    borderRadius: 8,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  arrowText: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 22,
  },
  disabledArrowText: {
    color: '#374151',
  },
  cellWrapper: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: '14.285%',
  },
  container: {
    alignItems: 'center',
    paddingVertical: 8,
    width: '100%',
  },
  dayButton: {
    alignItems: 'center',
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
    width: '100%',
  },
  disabledButton: {
    opacity: 0.3,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 4,
    width: '100%',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  navGroup: {
    flexDirection: 'row',
    gap: 4,
  },
  selectedDayButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  selectedDayText: {
    fontWeight: '700',
  },
  todayButton: {
    borderWidth: 1.5,
  },
  todayText: {
    fontWeight: '700',
  },
  weekdayRow: {
    borderBottomColor: 'rgba(156, 163, 175, 0.15)',
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingBottom: 6,
    width: '100%',
  },
  weekdayText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
});

export default CalendarView;
