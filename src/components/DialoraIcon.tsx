import { StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

export type DialoraIconName =
  | 'chevron-left'
  | 'chevron-right'
  | 'double-chevron-left'
  | 'double-chevron-right'
  | 'calendar'
  | 'clock'
  | 'plus'
  | 'minus'
  | 'check'
  | 'close';

export interface DialoraIconProps {
  /** Name of the icon to display */
  name: DialoraIconName;
  /** Size in points (width and height). Defaults to 16. */
  size?: number;
  /** Color of the icon lines and shapes. Defaults to '#FFFFFF'. */
  color?: string;
  /** Optional container style */
  style?: StyleProp<ViewStyle>;
  /** Test identifier */
  testID?: string;
}

/**
 * DialoraIcon
 *
 * Lightweight, zero-dependency icon renderer drawn purely using
 * standard React Native View primitives and geometric transforms.
 *
 * Guarantees 100% consistent rendering across iOS, Android, Expo Go,
 * and bare React Native projects without font-linking or native dependencies.
 */
export function DialoraIcon({
  name,
  size = 16,
  color = '#FFFFFF',
  style,
  testID = `dialora-icon-${name}`,
}: DialoraIconProps) {
  const stroke = Math.max(1.5, Math.round(size * 0.12));

  const renderIcon = () => {
    switch (name) {
      case 'chevron-left': {
        const armSize = Math.max(5, Math.round(size * 0.42));
        return (
          <View
            style={[
              styles.chevronLeft,
              {
                borderColor: color,
                borderLeftWidth: stroke,
                borderTopWidth: stroke,
                height: armSize,
                marginLeft: Math.round(size * 0.14),
                width: armSize,
              },
            ]}
          />
        );
      }
      case 'chevron-right': {
        const armSize = Math.max(5, Math.round(size * 0.42));
        return (
          <View
            style={[
              styles.chevronRight,
              {
                borderColor: color,
                borderRightWidth: stroke,
                borderTopWidth: stroke,
                height: armSize,
                marginRight: Math.round(size * 0.14),
                width: armSize,
              },
            ]}
          />
        );
      }
      case 'double-chevron-left': {
        const armSize = Math.max(4, Math.round(size * 0.34));
        const overlap = Math.max(2, Math.round(armSize * 0.35));
        return (
          <View style={styles.doubleChevronRow}>
            <View
              style={[
                styles.chevronLeft,
                {
                  borderColor: color,
                  borderLeftWidth: stroke,
                  borderTopWidth: stroke,
                  height: armSize,
                  width: armSize,
                },
              ]}
            />
            <View
              style={[
                styles.chevronLeft,
                {
                  borderColor: color,
                  borderLeftWidth: stroke,
                  borderTopWidth: stroke,
                  height: armSize,
                  marginLeft: -overlap,
                  width: armSize,
                },
              ]}
            />
          </View>
        );
      }
      case 'double-chevron-right': {
        const armSize = Math.max(4, Math.round(size * 0.34));
        const overlap = Math.max(2, Math.round(armSize * 0.35));
        return (
          <View style={styles.doubleChevronRow}>
            <View
              style={[
                styles.chevronRight,
                {
                  borderColor: color,
                  borderRightWidth: stroke,
                  borderTopWidth: stroke,
                  height: armSize,
                  width: armSize,
                },
              ]}
            />
            <View
              style={[
                styles.chevronRight,
                {
                  borderColor: color,
                  borderRightWidth: stroke,
                  borderTopWidth: stroke,
                  height: armSize,
                  marginLeft: -overlap,
                  width: armSize,
                },
              ]}
            />
          </View>
        );
      }
      case 'calendar': {
        const calWidth = Math.round(size * 0.85);
        const calHeight = Math.round(size * 0.8);
        const topBarHeight = Math.max(3, Math.round(calHeight * 0.32));
        const dotSize = Math.max(2, Math.round(size * 0.11));
        return (
          <View
            style={[
              styles.calendarContainer,
              {
                borderColor: color,
                borderRadius: Math.max(2, Math.round(size * 0.15)),
                borderWidth: stroke,
                height: calHeight,
                width: calWidth,
              },
            ]}
          >
            {/* Top header strip */}
            <View
              style={[
                styles.calendarTopBar,
                { backgroundColor: color, height: topBarHeight },
              ]}
            />
            {/* Calendar grid dots */}
            <View style={styles.calendarDotsRow}>
              <View
                style={[
                  styles.calendarDot,
                  {
                    backgroundColor: color,
                    height: dotSize,
                    width: dotSize,
                  },
                ]}
              />
              <View
                style={[
                  styles.calendarDot,
                  {
                    backgroundColor: color,
                    height: dotSize,
                    width: dotSize,
                  },
                ]}
              />
              <View
                style={[
                  styles.calendarDot,
                  {
                    backgroundColor: color,
                    height: dotSize,
                    width: dotSize,
                  },
                ]}
              />
            </View>
          </View>
        );
      }
      case 'clock': {
        const clockDiameter = Math.round(size * 0.88);
        const center = clockDiameter / 2;
        const minuteLength = Math.round(clockDiameter * 0.32);
        const hourLength = Math.round(clockDiameter * 0.24);
        return (
          <View
            style={[
              styles.clockContainer,
              {
                borderColor: color,
                borderRadius: clockDiameter / 2,
                borderWidth: stroke,
                height: clockDiameter,
                width: clockDiameter,
              },
            ]}
          >
            {/* Minute hand pointing 12 o'clock */}
            <View
              style={[
                styles.clockMinuteHand,
                {
                  backgroundColor: color,
                  height: minuteLength,
                  left: center - stroke / 2,
                  top: center - minuteLength,
                  width: stroke,
                },
              ]}
            />
            {/* Hour hand pointing ~3 o'clock */}
            <View
              style={[
                styles.clockHourHand,
                {
                  backgroundColor: color,
                  height: stroke,
                  left: center - stroke / 2,
                  top: center - stroke / 2,
                  width: hourLength,
                },
              ]}
            />
          </View>
        );
      }
      case 'plus': {
        const barLength = Math.round(size * 0.65);
        return (
          <View style={styles.centered}>
            <View
              style={[
                styles.horizontalBar,
                {
                  backgroundColor: color,
                  height: stroke,
                  width: barLength,
                },
              ]}
            />
            <View
              style={[
                styles.verticalBar,
                {
                  backgroundColor: color,
                  height: barLength,
                  width: stroke,
                },
              ]}
            />
          </View>
        );
      }
      case 'minus': {
        const barLength = Math.round(size * 0.65);
        return (
          <View style={styles.centered}>
            <View
              style={[
                styles.horizontalBar,
                {
                  backgroundColor: color,
                  height: stroke,
                  width: barLength,
                },
              ]}
            />
          </View>
        );
      }
      case 'check': {
        const checkW = Math.round(size * 0.32);
        const checkH = Math.round(size * 0.58);
        return (
          <View
            style={[
              styles.checkMark,
              {
                borderColor: color,
                borderBottomWidth: stroke,
                borderRightWidth: stroke,
                height: checkH,
                marginBottom: Math.round(size * 0.12),
                width: checkW,
              },
            ]}
          />
        );
      }
      case 'close': {
        const barLength = Math.round(size * 0.7);
        return (
          <View style={styles.centered}>
            <View
              style={[
                styles.closeBar1,
                {
                  backgroundColor: color,
                  height: stroke,
                  width: barLength,
                },
              ]}
            />
            <View
              style={[
                styles.closeBar2,
                {
                  backgroundColor: color,
                  height: stroke,
                  width: barLength,
                },
              ]}
            />
          </View>
        );
      }
    }
  };

  return (
    <View
      style={[
        styles.iconWrapper,
        {
          height: size,
          width: size,
        },
        style,
      ]}
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
      testID={testID}
    >
      {renderIcon()}
    </View>
  );
}

const styles = StyleSheet.create({
  calendarContainer: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    overflow: 'hidden',
  },
  calendarDot: {
    borderRadius: 1,
  },
  calendarDotsRow: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 2,
    width: '100%',
  },
  calendarTopBar: {
    width: '100%',
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  checkMark: {
    transform: [{ rotate: '45deg' }],
  },
  chevronLeft: {
    transform: [{ rotate: '-45deg' }],
  },
  chevronRight: {
    transform: [{ rotate: '45deg' }],
  },
  clockContainer: {
    position: 'relative',
  },
  clockHourHand: {
    borderRadius: 1,
    position: 'absolute',
  },
  clockMinuteHand: {
    borderRadius: 1,
    position: 'absolute',
  },
  closeBar1: {
    borderRadius: 1,
    position: 'absolute',
    transform: [{ rotate: '45deg' }],
  },
  closeBar2: {
    borderRadius: 1,
    position: 'absolute',
    transform: [{ rotate: '-45deg' }],
  },
  doubleChevronRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  horizontalBar: {
    borderRadius: 1,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  verticalBar: {
    borderRadius: 1,
    position: 'absolute',
  },
});

export default DialoraIcon;
