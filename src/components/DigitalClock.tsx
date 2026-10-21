import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import type { DialoraTheme, DialoraWatchTheme } from '../types';
import { resolveHourPeriod } from '../utils/clockUtils';

export type ActiveHand = 'hours' | 'minutes';

export interface DigitalClockProps {
  /** Hour value [0, 23] */
  hours: number;
  /** Minute value [0, 59] */
  minutes: number;
  /** Whether 24-hour time format is enabled */
  use24Hour?: boolean;
  /** Currently active hand mode ('hours' or 'minutes') */
  activeHand?: ActiveHand;
  /** Whether the digital clock is visible */
  visible?: boolean;
  /** Callback invoked when the user selects hours or minutes segment */
  onSelectActiveHand?: (hand: ActiveHand) => void;
  /** Callback invoked when the user toggles AM/PM in 12-hour format */
  onTogglePeriod?: () => void;
  /** General theme and color palette */
  theme?: DialoraTheme;
  /** Dedicated watch section theme */
  watchTheme?: DialoraWatchTheme;
  /** Container style */
  style?: StyleProp<ViewStyle>;
  /** Test identifier */
  testID?: string;
}

/**
 * DigitalClock
 *
 * Displays synchronized digital time with interactive segments
 * for switching between hour and minute adjustment and toggling AM/PM.
 */
export function DigitalClock({
  hours,
  minutes,
  use24Hour = false,
  activeHand,
  visible = true,
  onSelectActiveHand,
  onTogglePeriod,
  theme,
  watchTheme,
  style,
  testID = 'dialora-digital-clock',
}: DigitalClockProps) {
  if (!visible) {
    return null;
  }

  const safeH = isNaN(hours) ? 0 : ((hours % 24) + 24) % 24;
  const safeM = isNaN(minutes) ? 0 : Math.max(0, Math.min(59, minutes));

  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

  const displayHours = use24Hour
    ? pad(safeH)
    : pad(safeH % 12 === 0 ? 12 : safeH % 12);
  const displayMinutes = pad(safeM);
  const period = resolveHourPeriod(safeH);

  const accentColor =
    watchTheme?.digitalActiveColor ??
    watchTheme?.selectedTimeColor ??
    watchTheme?.accentColor ??
    theme?.watchTheme?.digitalActiveColor ??
    theme?.watchTheme?.selectedTimeColor ??
    theme?.selectedTimeColor ??
    theme?.accentColor ??
    '#6366F1';

  const textColor =
    watchTheme?.digitalTextColor ??
    watchTheme?.textColor ??
    theme?.watchTheme?.digitalTextColor ??
    theme?.watchTheme?.textColor ??
    theme?.textColor ??
    '#FFFFFF';

  const secondaryTextColor =
    watchTheme?.secondaryTextColor ??
    theme?.watchTheme?.secondaryTextColor ??
    theme?.secondaryTextColor ??
    '#9CA3AF';

  const activeBg =
    watchTheme?.digitalBackgroundColor ??
    theme?.watchTheme?.digitalBackgroundColor ??
    `${accentColor}2A`;

  const isHoursActive = activeHand === 'hours';
  const isMinutesActive = activeHand === 'minutes';

  return (
    <View style={[styles.container, style]} testID={testID}>
      <View style={styles.timeCluster}>
        {/* Hours Segment */}
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={`Select hours, current hour is ${displayHours}`}
          accessibilityState={{ selected: isHoursActive }}
          hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
          testID={`${testID}-hours`}
          activeOpacity={0.7}
          onPress={() => onSelectActiveHand?.('hours')}
          style={[
            styles.segment,
            isHoursActive && [
              styles.activeSegment,
              { backgroundColor: activeBg, borderColor: accentColor },
            ],
          ]}
        >
          <Text
            style={[
              styles.digitText,
              { color: isHoursActive ? accentColor : textColor },
            ]}
          >
            {displayHours}
          </Text>
        </TouchableOpacity>

        <Text style={[styles.colonText, { color: secondaryTextColor }]}>:</Text>

        {/* Minutes Segment */}
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={`Select minutes, current minute is ${displayMinutes}`}
          accessibilityState={{ selected: isMinutesActive }}
          hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
          testID={`${testID}-minutes`}
          activeOpacity={0.7}
          onPress={() => onSelectActiveHand?.('minutes')}
          style={[
            styles.segment,
            isMinutesActive && [
              styles.activeSegment,
              { backgroundColor: activeBg, borderColor: accentColor },
            ],
          ]}
        >
          <Text
            style={[
              styles.digitText,
              { color: isMinutesActive ? accentColor : textColor },
            ]}
          >
            {displayMinutes}
          </Text>
        </TouchableOpacity>
      </View>

      {/* AM/PM Badge */}
      {!use24Hour ? (
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={`Toggle period, currently ${period}`}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          testID={`${testID}-period`}
          activeOpacity={0.7}
          onPress={() => onTogglePeriod?.()}
          style={[styles.periodBadge, { borderColor: secondaryTextColor }]}
        >
          <Text style={[styles.periodText, { color: textColor }]}>
            {period}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  activeSegment: {
    borderWidth: 1.5,
  },
  colonText: {
    fontSize: 28,
    fontWeight: '700',
    marginHorizontal: 4,
  },
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
  },
  digitText: {
    fontFamily: 'Courier',
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: 2,
  },
  periodBadge: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    marginLeft: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  periodText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
  },
  segment: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  timeCluster: {
    alignItems: 'center',
    flexDirection: 'row',
  },
});

export default DigitalClock;
