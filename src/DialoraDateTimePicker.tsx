import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import type { LayoutChangeEvent } from 'react-native';
import { AnalogWatch } from './components/AnalogWatch';
import { BrandHeader } from './components/BrandHeader';
import { CalendarView } from './components/CalendarView';
import { DigitalClock } from './components/DigitalClock';
import type { ActiveHand } from './components/DigitalClock';
import { DialoraIcon } from './components/DialoraIcon';
import { WallpaperBackground } from './components/WallpaperBackground';
import { DialoraSession } from './session';
import type { DateTimePickerTab, DialoraDateTimePickerProps } from './types';
import { setTimeOnDate, toggleHourPeriod } from './utils/clockUtils';
import {
  getSelectionValidationMessage,
  isSelectionDisabled,
  setDatePreservingTime,
} from './utils/dateUtils';

/**
 * DialoraDateTimePicker
 *
 * Production-ready React Native analog watch & calendar date-time picker component.
 * Integrates an analog watch engine, calendar view, wallpaper background, brand header,
 * theme bindings, accessibility roles, and strict callback guarantees.
 */
export function DialoraDateTimePicker({
  value,
  visible = true,
  mode = 'datetime',
  display = 'analog',
  wallpaper,
  calendarWallpaper,
  watchWallpaper,
  logo,
  calendarLogo,
  watchLogo,
  showTopHeaderLogo = true,
  watchLogoPosition = 'top',
  watchLogoOffsetY = 0,
  brandName,
  subtitle,
  brandTextStyle,
  headerConfig,
  minimumDate,
  maximumDate,
  hideOutOfRangeDates = false,
  autoAdvanceToMinutes = true,
  firstDayOfWeek = 0,
  disabledDates,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isModal = true,
  statusBarTranslucent = false,
  validationMessage,
  style,
  theme,
  calendarTheme,
  watchTheme,
  tabsTheme,
  title,
  testID = 'dialora-date-time-picker',
  use24Hour = false,
  minuteInterval = 1,
  clockSize = 240,
  showDigital = true,
  initialActiveHand = 'hours',
  activeTab: controlledActiveTab,
  onTabChange,
  onChange,
  onConfirm,
  onCancel,
  onDismiss,
}: DialoraDateTimePickerProps) {
  const [candidateDate, setCandidateDate] = useState<Date>(() => {
    return value instanceof Date && !isNaN(value.getTime())
      ? new Date(value.getTime())
      : new Date();
  });
  const [activeHand, setActiveHand] = useState<ActiveHand>(initialActiveHand);
  const [internalTab, setInternalTab] = useState<DateTimePickerTab>(
    mode === 'time' ? 'clock' : 'calendar'
  );

  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const [containerWidth, setContainerWidth] = useState<number | null>(null);

  const handleContainerLayout = (event: LayoutChangeEvent) => {
    const width = Math.round(event.nativeEvent.layout.width);
    if (width > 0 && Math.abs((containerWidth ?? 0) - width) >= 2) {
      setContainerWidth(width);
    }
  };

  const effectiveClockSize = useMemo(() => {
    const availableWidth = containerWidth
      ? containerWidth
      : Math.max(160, Math.floor(windowWidth - (isModal ? 72 : 40)));

    const availableHeight =
      windowHeight < 500
        ? Math.max(160, Math.floor(windowHeight * 0.45))
        : availableWidth;

    const maxFit = Math.min(availableWidth, availableHeight);
    return Math.max(160, Math.min(clockSize, maxFit));
  }, [containerWidth, windowWidth, windowHeight, isModal, clockSize]);

  const currentTab = controlledActiveTab ?? internalTab;

  const callbacksRef = useRef({ onConfirm, onCancel, onDismiss, onChange });
  callbacksRef.current = { onConfirm, onCancel, onDismiss, onChange };

  const sessionRef = useRef<DialoraSession | null>(null);
  const prevVisibleRef = useRef(visible);

  // Track previous external prop timestamps to detect genuine changes and avoid overwriting user interaction
  const prevPropValueRef = useRef<number | undefined>(
    value instanceof Date && !isNaN(value.getTime())
      ? value.getTime()
      : undefined
  );
  const prevMinTimeRef = useRef<number | undefined>(
    minimumDate instanceof Date && !isNaN(minimumDate.getTime())
      ? minimumDate.getTime()
      : undefined
  );
  const prevMaxTimeRef = useRef<number | undefined>(
    maximumDate instanceof Date && !isNaN(maximumDate.getTime())
      ? maximumDate.getTime()
      : undefined
  );

  const getOrCreateSession = (initial?: Date) => {
    if (!sessionRef.current) {
      const initDate = initial ?? candidateDate;
      sessionRef.current = new DialoraSession({
        initialValue: initDate,
        onConfirm: (finalDate) => callbacksRef.current.onConfirm?.(finalDate),
        onCancel: () => callbacksRef.current.onCancel?.(),
        onDismiss: () => callbacksRef.current.onDismiss?.(),
        onChange: (event, date) => {
          if (date) {
            setCandidateDate(date);
          }
          callbacksRef.current.onChange?.(event, date);
        },
      });
    }
    return sessionRef.current;
  };

  // Session lifecycle when picker opens, reopens, or closes
  useEffect(() => {
    const wasVisible = prevVisibleRef.current;
    prevVisibleRef.current = visible;

    if (
      visible &&
      (!wasVisible || !sessionRef.current || sessionRef.current.isEnded())
    ) {
      const initial =
        value instanceof Date && !isNaN(value.getTime())
          ? new Date(value.getTime())
          : new Date();

      setCandidateDate(initial);
      setActiveHand(initialActiveHand);
      setInternalTab(mode === 'time' ? 'clock' : 'calendar');

      sessionRef.current = new DialoraSession({
        initialValue: initial,
        onConfirm: (finalDate) => callbacksRef.current.onConfirm?.(finalDate),
        onCancel: () => callbacksRef.current.onCancel?.(),
        onDismiss: () => callbacksRef.current.onDismiss?.(),
        onChange: (event, date) => {
          if (date) {
            setCandidateDate(date);
          }
          callbacksRef.current.onChange?.(event, date);
        },
      });

      prevPropValueRef.current =
        value instanceof Date && !isNaN(value.getTime())
          ? value.getTime()
          : undefined;
    } else if (!visible && wasVisible) {
      sessionRef.current = null;
    }
  }, [visible, value, mode, initialActiveHand]);

  /**
   * External value synchronization policy:
   * 1. A genuinely new external Date (detected via timestamp comparison with prevPropValueRef)
   *    is synchronized into candidateDate and the active session.
   * 2. Synchronization uses session.syncCandidateDate to avoid emitting an onChange callback
   *    feedback loop back to the parent.
   * 3. Invalid Date instances (NaN) or undefined values are safely ignored without throwing.
   * 4. Unrelated parent re-renders that pass the same timestamp or date instance do NOT
   *    reset the user's in-progress touch selection.
   * 5. The selection is NOT silently clamped, ensuring time and date selections are preserved.
   *    Out-of-range or disabled candidates are guarded by isSelectionDisabled on Confirm.
   */
  useEffect(() => {
    if (value instanceof Date && !isNaN(value.getTime())) {
      const newTime = value.getTime();
      const prevTime = prevPropValueRef.current;

      // Only synchronize if the external prop has genuinely changed
      if (prevTime !== newTime) {
        prevPropValueRef.current = newTime;

        setCandidateDate((currentCandidate) => {
          if (currentCandidate.getTime() === newTime) {
            return currentCandidate;
          }
          const nextDate = new Date(newTime);
          sessionRef.current?.syncCandidateDate(nextDate);
          return nextDate;
        });
      }
    }
  }, [value]);

  /**
   * Dynamic boundary change policy:
   * When minimumDate or maximumDate updates dynamically while the picker is open:
   * 1. The selection is NOT silently clamped to prevent changing selected time unexpectedly.
   * 2. Candidate state and session state remain synchronized.
   * 3. isConfirmDisabled is re-evaluated immediately via useMemo, disabling Confirm if
   *    the candidate falls outside the updated boundaries.
   * 4. If boundaries change without affecting the selection, the selection remains valid.
   * 5. Conflicting boundaries (min > max) are deterministically handled without crashing.
   */
  useEffect(() => {
    const minTime =
      minimumDate instanceof Date && !isNaN(minimumDate.getTime())
        ? minimumDate.getTime()
        : undefined;
    const maxTime =
      maximumDate instanceof Date && !isNaN(maximumDate.getTime())
        ? maximumDate.getTime()
        : undefined;

    prevMinTimeRef.current = minTime;
    prevMaxTimeRef.current = maxTime;
  }, [minimumDate, maximumDate]);

  const isConfirmDisabled = useMemo(() => {
    return isSelectionDisabled(candidateDate, mode, {
      minimumDate,
      maximumDate,
      disabledDates,
    });
  }, [candidateDate, mode, minimumDate, maximumDate, disabledDates]);

  const autoValidationMessage = useMemo(() => {
    if (!isConfirmDisabled) {
      return null;
    }
    return getSelectionValidationMessage(candidateDate, mode, {
      minimumDate,
      maximumDate,
      disabledDates,
    });
  }, [
    isConfirmDisabled,
    candidateDate,
    mode,
    minimumDate,
    maximumDate,
    disabledDates,
  ]);

  const validationError =
    validationMessage !== undefined ? validationMessage : autoValidationMessage;

  if (!visible) {
    return null;
  }

  const hours = candidateDate.getHours();
  const minutes = candidateDate.getMinutes();

  // Date selection in CalendarView: preserves candidate hours/minutes
  const handleDateSelect = (selectedDay: Date) => {
    const updated = setDatePreservingTime(candidateDate, selectedDay);
    setCandidateDate(updated);
    getOrCreateSession().setCandidateDate(updated);
  };

  // Time selection in Watch/Clock: preserves candidate year/month/day
  const handleTimeChange = (nextHours: number, nextMinutes: number) => {
    const updated = setTimeOnDate(candidateDate, nextHours, nextMinutes);
    setCandidateDate(updated);
    getOrCreateSession().setCandidateDate(updated);
  };

  const handleTogglePeriod = () => {
    const toggledHour = toggleHourPeriod(hours);
    handleTimeChange(toggledHour, minutes);
  };

  const handleTabSwitch = (tab: DateTimePickerTab) => {
    setInternalTab(tab);
    onTabChange?.(tab);
  };

  const handleConfirm = () => {
    const session = getOrCreateSession();
    if (
      session.isEnded() ||
      isSelectionDisabled(candidateDate, mode, {
        minimumDate,
        maximumDate,
        disabledDates,
      })
    ) {
      return;
    }
    session.confirm();
  };

  const handleCancel = () => {
    const session = getOrCreateSession();
    if (session.isEnded()) {
      return;
    }
    session.cancel();
  };

  const handleDismiss = () => {
    if (sessionRef.current && !sessionRef.current.isEnded()) {
      sessionRef.current.dismiss();
    }
  };

  // View flags
  const showTabSelector = mode === 'datetime';
  const isCalendarActive =
    mode === 'date' || (mode === 'datetime' && currentTab === 'calendar');
  const isClockActive =
    mode === 'time' || (mode === 'datetime' && currentTab === 'clock');

  const shouldRenderAnalog = isClockActive && display !== 'digital';
  const shouldRenderDigital =
    isClockActive && (showDigital || display === 'digital');

  // Independent active section theme & styling
  const activeWallpaper = isCalendarActive
    ? (calendarWallpaper ?? wallpaper)
    : (watchWallpaper ?? wallpaper);

  const activeContainerBg = isCalendarActive
    ? (calendarTheme?.backgroundColor ??
      theme?.calendarTheme?.backgroundColor ??
      theme?.backgroundColor ??
      '#1A1C23')
    : (watchTheme?.backgroundColor ??
      theme?.watchTheme?.backgroundColor ??
      theme?.backgroundColor ??
      '#1A1C23');

  const activeTextColor = isCalendarActive
    ? (calendarTheme?.textColor ??
      theme?.calendarTheme?.textColor ??
      theme?.textColor ??
      '#FFFFFF')
    : (watchTheme?.textColor ??
      theme?.watchTheme?.textColor ??
      theme?.textColor ??
      '#FFFFFF');

  const secondaryTextColor = theme?.secondaryTextColor ?? '#9CA3AF';
  const accentColor = theme?.accentColor ?? '#6366F1';
  const confirmBtnBg = theme?.confirmButtonColor ?? '#3B82F6';
  const confirmTxtColor = theme?.confirmTextColor ?? '#FFFFFF';
  const cancelBtnBg = theme?.cancelButtonColor ?? '#374151';
  const cancelTxtColor = theme?.cancelTextColor ?? '#E5E7EB';
  const borderRadius = theme?.cardBorderRadius ?? 20;

  // Header branding: top header logo can be hidden while watch face keeps its logo
  const headerLogo = showTopHeaderLogo
    ? isCalendarActive
      ? (calendarLogo ?? logo)
      : (watchLogo ?? logo)
    : undefined;

  // Tabs Theme resolution
  const tabContainerBg =
    tabsTheme?.containerBackgroundColor ??
    theme?.tabsTheme?.containerBackgroundColor ??
    'rgba(0, 0, 0, 0.25)';
  const tabBorderColor =
    tabsTheme?.borderColor ?? theme?.tabsTheme?.borderColor ?? 'transparent';
  const tabBorderWidth =
    tabsTheme?.borderWidth ?? theme?.tabsTheme?.borderWidth ?? 0;
  const tabBorderRadius =
    tabsTheme?.borderRadius ?? theme?.tabsTheme?.borderRadius ?? 10;

  const calTabActiveBg =
    tabsTheme?.activeBackgroundColor ??
    theme?.tabsTheme?.activeBackgroundColor ??
    calendarTheme?.selectedDateColor ??
    calendarTheme?.selectedDayColor ??
    theme?.calendarSelectedColor ??
    theme?.selectedDateColor ??
    accentColor;

  const clockTabActiveBg =
    tabsTheme?.activeBackgroundColor ??
    theme?.tabsTheme?.activeBackgroundColor ??
    watchTheme?.selectedTimeColor ??
    watchTheme?.accentColor ??
    theme?.selectedTimeColor ??
    accentColor;

  const tabInactiveBg =
    tabsTheme?.inactiveBackgroundColor ??
    theme?.tabsTheme?.inactiveBackgroundColor ??
    'transparent';

  const tabActiveTextColor =
    tabsTheme?.activeTextColor ??
    theme?.tabsTheme?.activeTextColor ??
    '#FFFFFF';
  const tabInactiveTextColor =
    tabsTheme?.inactiveTextColor ??
    theme?.tabsTheme?.inactiveTextColor ??
    '#9CA3AF';

  const content = (
    <View
      style={[
        styles.card,
        {
          borderRadius,
          maxWidth: Math.max(
            300,
            Math.min(clockSize + 60, windowWidth - (isModal ? 32 : 0))
          ),
        },
        style,
      ]}
      testID={testID}
      accessibilityViewIsModal={isModal}
      onStartShouldSetResponder={() => true}
    >
      <WallpaperBackground
        wallpaper={activeWallpaper}
        fallbackBackgroundColor={activeContainerBg}
        borderRadius={borderRadius}
        style={styles.wallpaperWrapper}
        testID={`${testID}-wallpaper`}
      >
        <ScrollView
          style={styles.cardScroll}
          contentContainerStyle={styles.innerContent}
          bounces={false}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onLayout={handleContainerLayout}
          testID={`${testID}-scroll`}
        >
          {/* Brand Header */}
          <BrandHeader
            brandName={brandName}
            subtitle={subtitle}
            logo={headerLogo}
            titleStyle={brandTextStyle}
            headerConfig={headerConfig}
            textColor={activeTextColor}
            secondaryTextColor={secondaryTextColor}
            testID={`${testID}-brand-header`}
          />

          {title ? (
            <Text style={[styles.titleText, { color: activeTextColor }]}>
              {title}
            </Text>
          ) : null}

          {/* Mode Switcher Tabs for Datetime */}
          {showTabSelector ? (
            <View
              style={[
                styles.tabContainer,
                {
                  backgroundColor: tabContainerBg,
                  borderColor: tabBorderColor,
                  borderWidth: tabBorderWidth,
                  borderRadius: tabBorderRadius,
                },
                tabsTheme?.style,
              ]}
              testID={`${testID}-tabs`}
              accessibilityRole="tablist"
            >
              <TouchableOpacity
                accessibilityRole="tab"
                accessibilityLabel="Date section tab"
                accessibilityHint="Switches view to the calendar date selector"
                accessibilityState={{ selected: currentTab === 'calendar' }}
                testID={`${testID}-tab-calendar`}
                hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
                onPress={() => handleTabSwitch('calendar')}
                style={[
                  styles.tabButton,
                  tabsTheme?.tabStyle,
                  currentTab === 'calendar'
                    ? [
                        styles.tabButtonActive,
                        { backgroundColor: calTabActiveBg },
                      ]
                    : { backgroundColor: tabInactiveBg },
                ]}
              >
                <DialoraIcon
                  name="calendar"
                  size={14}
                  color={
                    currentTab === 'calendar'
                      ? tabActiveTextColor
                      : tabInactiveTextColor
                  }
                  testID={`${testID}-tab-calendar-icon`}
                />
                <Text
                  style={[
                    styles.tabText,
                    tabsTheme?.textStyle,
                    currentTab === 'calendar'
                      ? [
                          styles.tabTextActive,
                          { color: tabActiveTextColor },
                          tabsTheme?.activeTextStyle,
                        ]
                      : [
                          styles.tabTextInactive,
                          { color: tabInactiveTextColor },
                          tabsTheme?.inactiveTextStyle,
                        ],
                  ]}
                >
                  Date
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                accessibilityRole="tab"
                accessibilityLabel="Time section tab"
                accessibilityHint="Switches view to the clock time selector"
                accessibilityState={{ selected: currentTab === 'clock' }}
                testID={`${testID}-tab-clock`}
                hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
                onPress={() => handleTabSwitch('clock')}
                style={[
                  styles.tabButton,
                  tabsTheme?.tabStyle,
                  currentTab === 'clock'
                    ? [
                        styles.tabButtonActive,
                        { backgroundColor: clockTabActiveBg },
                      ]
                    : { backgroundColor: tabInactiveBg },
                ]}
              >
                <DialoraIcon
                  name="clock"
                  size={14}
                  color={
                    currentTab === 'clock'
                      ? tabActiveTextColor
                      : tabInactiveTextColor
                  }
                  testID={`${testID}-tab-clock-icon`}
                />
                <Text
                  style={[
                    styles.tabText,
                    tabsTheme?.textStyle,
                    currentTab === 'clock'
                      ? [
                          styles.tabTextActive,
                          { color: tabActiveTextColor },
                          tabsTheme?.activeTextStyle,
                        ]
                      : [
                          styles.tabTextInactive,
                          { color: tabInactiveTextColor },
                          tabsTheme?.inactiveTextStyle,
                        ],
                  ]}
                >
                  Time
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {/* Calendar View Component */}
          {isCalendarActive ? (
            <CalendarView
              selectedDate={candidateDate}
              onSelectDate={handleDateSelect}
              minimumDate={minimumDate}
              maximumDate={maximumDate}
              hideOutOfRangeDates={hideOutOfRangeDates}
              firstDayOfWeek={firstDayOfWeek}
              disabledDates={disabledDates}
              theme={theme}
              calendarTheme={calendarTheme}
              testID={`${testID}-calendar`}
            />
          ) : null}

          {/* Synchronized Digital Readout */}
          {shouldRenderDigital ? (
            <DigitalClock
              hours={hours}
              minutes={minutes}
              use24Hour={use24Hour}
              activeHand={activeHand}
              onSelectActiveHand={setActiveHand}
              onTogglePeriod={handleTogglePeriod}
              theme={theme}
              watchTheme={watchTheme}
              testID={`${testID}-digital`}
            />
          ) : null}

          {/* Analog Watch Engine */}
          {shouldRenderAnalog ? (
            <AnalogWatch
              hours={hours}
              minutes={minutes}
              minuteInterval={minuteInterval}
              activeHand={activeHand}
              onTimeChange={handleTimeChange}
              onActiveHandChange={setActiveHand}
              onHourSelectionComplete={() => {
                if (autoAdvanceToMinutes !== false) {
                  setActiveHand('minutes');
                }
              }}
              size={effectiveClockSize}
              use24Hour={use24Hour}
              theme={theme}
              watchTheme={watchTheme}
              logo={watchLogo ?? logo}
              logoPosition={watchLogoPosition}
              logoOffsetY={watchLogoOffsetY}
              brandName={brandName}
              brandTextStyle={brandTextStyle}
              testID={`${testID}-watch`}
            />
          ) : null}

          {/* Summary readout in date-only mode */}
          {mode === 'date' ? (
            <Text
              style={[styles.summaryText, { color: secondaryTextColor }]}
              testID={`${testID}-summary`}
            >
              {candidateDate.toLocaleDateString(undefined, {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </Text>
          ) : null}

          {/* Validation Feedback Banner */}
          {validationError ? (
            <View
              style={styles.validationBanner}
              testID={`${testID}-validation-feedback`}
              accessibilityRole="alert"
              accessibilityLiveRegion="polite"
            >
              <Text
                style={[
                  styles.validationBannerText,
                  { color: theme?.validationTextColor ?? '#F87171' },
                ]}
              >
                {validationError}
              </Text>
            </View>
          ) : null}

          {/* Action Row */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              testID={`${testID}-cancel`}
              accessibilityRole="button"
              accessibilityLabel={cancelText}
              accessibilityHint="Discards changes and closes the picker"
              onPress={handleCancel}
              style={[styles.button, { backgroundColor: cancelBtnBg }]}
              activeOpacity={0.7}
            >
              <Text style={[styles.buttonText, { color: cancelTxtColor }]}>
                {cancelText}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              testID={`${testID}-confirm`}
              accessibilityRole="button"
              accessibilityLabel={
                isConfirmDisabled && validationError
                  ? `${confirmText}, disabled: ${validationError}`
                  : confirmText
              }
              accessibilityState={{ disabled: isConfirmDisabled }}
              accessibilityHint={
                isConfirmDisabled
                  ? (validationError ?? 'Current selection is not valid')
                  : 'Confirms the selected date and time'
              }
              disabled={isConfirmDisabled}
              onPress={handleConfirm}
              style={[
                styles.button,
                { backgroundColor: confirmBtnBg },
                isConfirmDisabled && styles.disabledButton,
              ]}
              activeOpacity={isConfirmDisabled ? 1 : 0.7}
            >
              <Text
                style={[
                  styles.buttonText,
                  { color: confirmTxtColor },
                  isConfirmDisabled && styles.disabledButtonText,
                ]}
              >
                {confirmText}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </WallpaperBackground>
    </View>
  );

  if (isModal) {
    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={handleDismiss}
        onDismiss={handleDismiss}
        accessibilityViewIsModal={true}
        statusBarTranslucent={statusBarTranslucent}
        testID={`${testID}-modal`}
      >
        <View style={styles.backdrop}>
          <TouchableOpacity
            style={styles.backdropDismiss}
            activeOpacity={1}
            onPress={handleDismiss}
            testID={`${testID}-backdrop`}
            accessibilityRole="button"
            accessibilityLabel="Close picker"
            accessibilityHint="Dismisses the date and time picker without saving changes"
          />
          <SafeAreaView style={styles.modalSafeArea} pointerEvents="box-none">
            {content}
          </SafeAreaView>
        </View>
      </Modal>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
    width: '100%',
  },
  backdrop: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  backdropDismiss: {
    ...StyleSheet.absoluteFill,
  },
  button: {
    alignItems: 'center',
    borderRadius: 10,
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 12,
  },
  disabledButton: {
    backgroundColor: '#4B5563',
    opacity: 0.6,
  },
  disabledButtonText: {
    color: '#9CA3AF',
  },
  modalSafeArea: {
    alignItems: 'center',
    justifyContent: 'center',
    maxHeight: '100%',
    width: '100%',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  card: {
    alignItems: 'center',
    elevation: 8,
    maxHeight: '92%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    width: '100%',
  },
  cardScroll: {
    maxHeight: '100%',
    width: '100%',
  },
  innerContent: {
    alignItems: 'center',
    padding: 18,
    width: '100%',
  },
  summaryText: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginTop: 8,
  },
  tabButton: {
    alignItems: 'center',
    borderRadius: 8,
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    paddingVertical: 6,
  },
  tabButtonActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  tabContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: 10,
    flexDirection: 'row',
    marginBottom: 12,
    padding: 3,
    width: '100%',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  tabTextInactive: {
    color: '#9CA3AF',
  },
  titleText: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 8,
  },
  validationBanner: {
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.25)',
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    width: '100%',
  },
  validationBannerText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  wallpaperWrapper: {
    maxHeight: '100%',
    width: '100%',
  },
});

export default DialoraDateTimePicker;
