import { useRef, useState } from 'react';
import {
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { DialoraIcon } from './DialoraIcon';
import type {
  GestureResponderEvent,
  StyleProp,
  TextStyle,
  ViewStyle,
} from 'react-native';
import type {
  DialoraLogo,
  DialoraTheme,
  DialoraWatchTheme,
  MinuteInterval,
} from '../types';
import {
  angleToHours,
  angleToMinutes,
  getHourHandAngle,
  getMinuteHandAngle,
  pointerToAngle,
} from '../utils/clockUtils';
import type { ActiveHand } from './DigitalClock';
import { WatchFaceBrand } from './WatchFaceBrand';

export interface AnalogWatchProps {
  /** Selected hour [0, 23] */
  hours: number;
  /** Selected minute [0, 59] */
  minutes: number;
  /** Granularity of minute selection (default: 1) */
  minuteInterval?: MinuteInterval;
  /** Currently active hand ('hours' | 'minutes') in controlled mode */
  activeHand?: ActiveHand;
  /** Initial active hand when used in uncontrolled mode (default: 'hours') */
  defaultActiveHand?: ActiveHand;
  /** Callback invoked when hours or minutes change */
  onTimeChange?: (hours: number, minutes: number) => void;
  /** Callback invoked when the active hand mode is toggled */
  onActiveHandChange?: (hand: ActiveHand) => void;
  /** Callback invoked when an hour selection interaction is completed (tap/drag release or step) */
  onHourSelectionComplete?: () => void;
  /** Clock diameter in points (default: 240) */
  size?: number;
  /** Whether 24-hour time is active */
  use24Hour?: boolean;
  /** Custom theme and styling */
  theme?: DialoraTheme;
  /** Dedicated theme configuration for the watch */
  watchTheme?: DialoraWatchTheme;
  /** Brand emblem / logo image displayed inside the circular watch face */
  logo?: DialoraLogo;
  /** Vertical placement of brand logo or text within dial ('top' | 'center' | 'bottom') */
  logoPosition?: 'top' | 'center' | 'bottom';
  /** Additional vertical offset for brand logo or text within dial */
  logoOffsetY?: number;
  /** Brand name displayed on dial */
  brandName?: string;
  /** Custom style for brand name */
  brandTextStyle?: StyleProp<TextStyle>;
  /** Outer container style */
  style?: StyleProp<ViewStyle>;
  /** Test identifier */
  testID?: string;
}

/**
 * AnalogWatch
 *
 * A fully functional, responsive analog watch engine drawn purely
 * using React Native components and geometric transformations.
 * Supports direct touch/drag interaction, accessible steppers,
 * and both controlled and uncontrolled activeHand state management.
 */
export function AnalogWatch({
  hours,
  minutes,
  minuteInterval = 1,
  activeHand: controlledActiveHand,
  defaultActiveHand = 'hours',
  onTimeChange,
  onActiveHandChange,
  onHourSelectionComplete,
  size = 240,
  use24Hour = false,
  theme,
  watchTheme,
  logo,
  logoPosition = 'top',
  logoOffsetY = 0,
  brandName,
  brandTextStyle,
  style,
  testID = 'dialora-analog-watch',
}: AnalogWatchProps) {
  // Support both controlled and uncontrolled activeHand modes
  const [uncontrolledActiveHand, setUncontrolledActiveHand] =
    useState<ActiveHand>(defaultActiveHand);
  const isControlled = controlledActiveHand !== undefined;
  const currentActiveHand = isControlled
    ? controlledActiveHand
    : uncontrolledActiveHand;

  const handleModeSwitch = (hand: ActiveHand) => {
    if (!isControlled) {
      setUncontrolledActiveHand(hand);
    }
    onActiveHandChange?.(hand);
  };

  const center = size / 2;
  const radius = center;

  // Compute theme colors with fallbacks from watchTheme, theme.watchTheme, and theme
  const dialColor =
    watchTheme?.faceColor ??
    theme?.watchTheme?.faceColor ??
    theme?.dialColor ??
    '#1E222D';
  const bezelColor =
    watchTheme?.bezelColor ??
    theme?.watchTheme?.bezelColor ??
    theme?.bezelColor ??
    '#374151';
  const numberColor =
    watchTheme?.numeralColor ??
    watchTheme?.numberColor ??
    theme?.watchTheme?.numeralColor ??
    theme?.numberColor ??
    '#E5E7EB';
  const tickColor =
    watchTheme?.markerColor ??
    watchTheme?.tickColor ??
    theme?.watchTheme?.markerColor ??
    theme?.tickColor ??
    '#6B7280';
  const accentColor =
    watchTheme?.accentColor ??
    watchTheme?.selectedTimeColor ??
    theme?.selectedTimeColor ??
    theme?.accentColor ??
    '#6366F1';
  const hourHandColor =
    watchTheme?.hourHandColor ??
    theme?.watchTheme?.hourHandColor ??
    theme?.handColors?.hour ??
    '#FFFFFF';
  const minuteHandColor =
    watchTheme?.minuteHandColor ??
    theme?.watchTheme?.minuteHandColor ??
    theme?.handColors?.minute ??
    accentColor;
  const centerDotColor =
    watchTheme?.centerDotColor ??
    theme?.watchTheme?.centerDotColor ??
    theme?.handColors?.centerDot ??
    accentColor;

  // Hand geometry
  const hourHandLength = radius * 0.52;
  const hourHandWidth = Math.max(4, Math.round(size * 0.024));
  const minuteHandLength = radius * 0.72;
  const minuteHandWidth = Math.max(2.5, Math.round(size * 0.015));
  const centerDotSize = Math.max(12, Math.round(size * 0.06));

  // Angles
  const hourAngle = getHourHandAngle(hours, minutes, true);
  const minuteAngle = getMinuteHandAngle(minutes, 0, false);

  const activeHandRef = useRef(currentActiveHand);
  activeHandRef.current = currentActiveHand;

  const onHourSelectionCompleteRef = useRef(onHourSelectionComplete);
  onHourSelectionCompleteRef.current = onHourSelectionComplete;

  const hoursInteractedInGestureRef = useRef(false);

  // Process pointer event to update time
  const handlePointerUpdate = (evt: GestureResponderEvent) => {
    const localX = evt.nativeEvent.locationX;
    const localY = evt.nativeEvent.locationY;

    const angle = pointerToAngle(localX, localY, center, center);
    if (angle === null) {
      return;
    }

    if (activeHandRef.current === 'hours') {
      const nextHour = angleToHours(angle, hours, use24Hour);
      onTimeChange?.(nextHour, minutes);
    } else {
      const nextMinute = angleToMinutes(angle, minuteInterval);
      onTimeChange?.(hours, nextMinute);
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        hoursInteractedInGestureRef.current = activeHandRef.current === 'hours';
        handlePointerUpdate(evt);
      },
      onPanResponderMove: (evt) => {
        handlePointerUpdate(evt);
      },
      onPanResponderRelease: () => {
        if (hoursInteractedInGestureRef.current) {
          hoursInteractedInGestureRef.current = false;
          if (!isControlled) {
            setUncontrolledActiveHand('minutes');
            onActiveHandChange?.('minutes');
          }
          onHourSelectionCompleteRef.current?.();
        }
      },
      onPanResponderTerminate: () => {
        hoursInteractedInGestureRef.current = false;
      },
      onPanResponderTerminationRequest: () => false,
    })
  ).current;

  // Accessible stepper actions
  const handleStep = (direction: 1 | -1) => {
    if (currentActiveHand === 'hours') {
      const nextHour = (hours + direction + 24) % 24;
      onTimeChange?.(nextHour, minutes);
      onHourSelectionComplete?.();
    } else {
      const step = minuteInterval;
      const nextMinute = (minutes + direction * step + 60) % 60;
      onTimeChange?.(hours, nextMinute);
    }
  };

  // Render 12 hour numbers
  const numberRadius = radius * 0.76;
  const hourNumbers = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const numberItems = hourNumbers.map((num) => {
    const angleDeg = (num % 12) * 30;
    const angleRad = (angleDeg * Math.PI) / 180;
    const numX = center + numberRadius * Math.sin(angleRad);
    const numY = center - numberRadius * Math.cos(angleRad);
    const itemSize = Math.max(24, Math.round(size * 0.11));
    const isCurrentHour = hours % 12 === num % 12;

    return (
      <View
        key={`num-${num}`}
        style={[
          styles.numberContainer,
          {
            left: numX - itemSize / 2,
            top: numY - itemSize / 2,
            width: itemSize,
            height: itemSize,
          },
          isCurrentHour &&
            currentActiveHand === 'hours' && [
              styles.selectedNumberContainer,
              { backgroundColor: `${accentColor}33` },
            ],
        ]}
        pointerEvents="none"
        accessible={false}
        importantForAccessibility="no"
      >
        <Text
          accessible={false}
          importantForAccessibility="no"
          style={[
            styles.numberText,
            {
              color:
                isCurrentHour && currentActiveHand === 'hours'
                  ? accentColor
                  : numberColor,
              fontSize: Math.max(12, Math.round(size * 0.065)),
            },
          ]}
        >
          {num}
        </Text>
      </View>
    );
  });

  // Render 12 major hour tick markers
  const tickRadius = radius * 0.92;
  const tickItems = hourNumbers.map((num) => {
    const angleDeg = (num % 12) * 30;
    const angleRad = (angleDeg * Math.PI) / 180;
    const tickX = center + tickRadius * Math.sin(angleRad);
    const tickY = center - tickRadius * Math.cos(angleRad);
    const tickSize = Math.max(4, Math.round(size * 0.016));

    return (
      <View
        key={`tick-${num}`}
        style={[
          styles.tick,
          {
            backgroundColor: tickColor,
            left: tickX - tickSize / 2,
            top: tickY - tickSize / 2,
            width: tickSize,
            height: tickSize,
            borderRadius: tickSize / 2,
          },
        ]}
        pointerEvents="none"
        accessible={false}
        importantForAccessibility="no"
      />
    );
  });

  return (
    <View style={[styles.wrapper, style]} testID={testID}>
      {/* Mode Selector Header */}
      <View style={styles.selectorRow}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Adjust hours"
          accessibilityHint="Switches clock adjustment mode to hours"
          accessibilityState={{ selected: currentActiveHand === 'hours' }}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          testID={`${testID}-mode-hours`}
          onPress={() => handleModeSwitch('hours')}
          style={[
            styles.modePill,
            currentActiveHand === 'hours' && [
              styles.activeModePill,
              { backgroundColor: accentColor },
            ],
          ]}
        >
          <Text
            style={[
              styles.modePillText,
              currentActiveHand === 'hours'
                ? styles.modePillTextActive
                : styles.modePillTextInactive,
            ]}
          >
            Hours
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Adjust minutes"
          accessibilityHint="Switches clock adjustment mode to minutes"
          accessibilityState={{ selected: currentActiveHand === 'minutes' }}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          testID={`${testID}-mode-minutes`}
          onPress={() => handleModeSwitch('minutes')}
          style={[
            styles.modePill,
            currentActiveHand === 'minutes' && [
              styles.activeModePill,
              { backgroundColor: accentColor },
            ],
          ]}
        >
          <Text
            style={[
              styles.modePillText,
              currentActiveHand === 'minutes'
                ? styles.modePillTextActive
                : styles.modePillTextInactive,
            ]}
          >
            Minutes
          </Text>
        </TouchableOpacity>
      </View>

      {/* Clock Face with PanResponder and Screen Reader Adjustable Actions */}
      <View
        {...panResponder.panHandlers}
        accessible={true}
        accessibilityRole="adjustable"
        accessibilityLabel={`Analog clock face. Currently set to ${hours} hours and ${minutes} minutes. Drag or swipe to set ${currentActiveHand}.`}
        accessibilityValue={{
          text:
            currentActiveHand === 'hours'
              ? `${hours} hours`
              : `${minutes} minutes`,
          now: currentActiveHand === 'hours' ? hours : minutes,
          min: 0,
          max: currentActiveHand === 'hours' ? 23 : 59,
        }}
        accessibilityActions={[
          { name: 'increment', label: `Increase ${currentActiveHand}` },
          { name: 'decrement', label: `Decrease ${currentActiveHand}` },
        ]}
        onAccessibilityAction={(event) => {
          const action = event.nativeEvent.actionName;
          if (action === 'increment') {
            handleStep(1);
          } else if (action === 'decrement') {
            handleStep(-1);
          }
        }}
        testID={`${testID}-face`}
        style={[
          styles.clockFace,
          {
            backgroundColor: dialColor,
            borderColor: bezelColor,
            borderRadius: radius,
            height: size,
            width: size,
          },
        ]}
      >
        {/* Ticks and Numbers */}
        {tickItems}
        {numberItems}

        {/* Brand Logo and Text inside circular clock face */}
        <WatchFaceBrand
          logo={logo}
          brandName={brandName}
          brandTextStyle={brandTextStyle}
          textColor={numberColor}
          clockSize={size}
          position={logoPosition}
          offsetY={logoOffsetY}
          testID={`${testID}-brand`}
        />

        {/* Hour Hand Layer */}
        <View
          style={[
            styles.handLayer,
            {
              height: size,
              transform: [{ rotate: `${hourAngle}deg` }],
              width: size,
            },
          ]}
          pointerEvents="none"
          accessible={false}
          importantForAccessibility="no"
          testID={`${testID}-hour-hand`}
        >
          <View
            style={[
              styles.hand,
              {
                backgroundColor: hourHandColor,
                borderRadius: hourHandWidth / 2,
                height: hourHandLength,
                left: center - hourHandWidth / 2,
                top: center - hourHandLength,
                width: hourHandWidth,
              },
            ]}
          />
        </View>

        {/* Minute Hand Layer */}
        <View
          style={[
            styles.handLayer,
            {
              height: size,
              transform: [{ rotate: `${minuteAngle}deg` }],
              width: size,
            },
          ]}
          pointerEvents="none"
          accessible={false}
          importantForAccessibility="no"
          testID={`${testID}-minute-hand`}
        >
          <View
            style={[
              styles.hand,
              {
                backgroundColor: minuteHandColor,
                borderRadius: minuteHandWidth / 2,
                height: minuteHandLength,
                left: center - minuteHandWidth / 2,
                top: center - minuteHandLength,
                width: minuteHandWidth,
              },
            ]}
          />
        </View>

        {/* Center Pivot Pin */}
        <View
          style={[
            styles.centerDot,
            {
              backgroundColor: centerDotColor,
              borderRadius: centerDotSize / 2,
              height: centerDotSize,
              left: center - centerDotSize / 2,
              top: center - centerDotSize / 2,
              width: centerDotSize,
            },
          ]}
          pointerEvents="none"
          accessible={false}
          importantForAccessibility="no"
          testID={`${testID}-center-dot`}
        />
      </View>

      {/* Accessible Stepper Controls */}
      <View style={styles.stepperRow}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={`Decrease ${currentActiveHand}`}
          accessibilityHint={`Decreases ${currentActiveHand} by ${
            currentActiveHand === 'hours' ? 1 : minuteInterval
          }`}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          testID={`${testID}-step-down`}
          onPress={() => handleStep(-1)}
          style={[styles.stepperButton, { borderColor: bezelColor }]}
          activeOpacity={0.7}
        >
          <DialoraIcon
            name="minus"
            size={14}
            color="#FFFFFF"
            testID={`${testID}-step-down-icon`}
          />
        </TouchableOpacity>

        <Text
          style={[styles.stepperInfo, { color: numberColor }]}
          accessible={true}
          accessibilityLabel={`Current adjustment mode: ${currentActiveHand}`}
        >
          Adjust {currentActiveHand}
        </Text>

        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={`Increase ${currentActiveHand}`}
          accessibilityHint={`Increases ${currentActiveHand} by ${
            currentActiveHand === 'hours' ? 1 : minuteInterval
          }`}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          testID={`${testID}-step-up`}
          onPress={() => handleStep(1)}
          style={[styles.stepperButton, { borderColor: bezelColor }]}
          activeOpacity={0.7}
        >
          <DialoraIcon
            name="plus"
            size={14}
            color="#FFFFFF"
            testID={`${testID}-step-up-icon`}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  activeModePill: {
    borderColor: 'transparent',
  },
  brandContainer: {
    alignItems: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
  },
  brandText: {
    fontWeight: '700',
    letterSpacing: 2,
    opacity: 0.85,
    textTransform: 'uppercase',
  },
  centerDot: {
    borderColor: '#FFFFFF',
    borderWidth: 2,
    position: 'absolute',
  },
  clockFace: {
    alignItems: 'center',
    borderWidth: 2,
    elevation: 4,
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  hand: {
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 3,
  },
  handLayer: {
    left: 0,
    position: 'absolute',
    top: 0,
  },
  modePill: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#374151',
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  modePillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  modePillTextActive: {
    color: '#FFFFFF',
  },
  modePillTextInactive: {
    color: '#9CA3AF',
  },
  numberContainer: {
    alignItems: 'center',
    borderRadius: 14,
    justifyContent: 'center',
    position: 'absolute',
  },
  numberText: {
    fontWeight: '600',
  },
  selectedNumberContainer: {
    borderRadius: 14,
  },
  selectorRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  stepperButton: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    height: 36,
    justifyContent: 'center',
    width: 44,
  },
  stepperInfo: {
    fontSize: 13,
    fontWeight: '500',
  },
  stepperRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'center',
    marginTop: 12,
  },
  stepperText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 22,
  },
  tick: {
    position: 'absolute',
  },
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AnalogWatch;
