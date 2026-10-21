import { useState } from 'react';
import {
  Button,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  AnalogWatch,
  BrandHeader,
  CalendarView,
  DigitalClock,
  DialoraDateTimePicker,
  WallpaperBackground,
  formatTime,
  setDatePreservingTime,
  setTimeOnDate,
  type ActiveHand,
  type DialoraCalendarSectionTheme,
  type DialoraTabsTheme,
  type DialoraWatchTheme,
  type MinuteInterval,
  type PickerDisplay,
  type PickerMode,
} from 'react-native-dialora';

const SAMPLE_WALLPAPERS = {
  none: undefined,
  gradient:
    'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&q=80',
  darkAbstract:
    'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&q=80',
  emeraldForest:
    'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=800&q=80',
};

const SAMPLE_LOGO = {
  source:
    'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=120&q=80',
  width: 32,
  height: 20,
};

export default function App() {
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [pickerVisible, setPickerVisible] = useState(false);
  const [use24Hour, setUse24Hour] = useState(false);
  const [minuteInterval, setMinuteInterval] = useState<MinuteInterval>(5);
  const [pickerMode, setPickerMode] = useState<PickerMode>('datetime');
  const [pickerDisplay, setPickerDisplay] = useState<PickerDisplay>('analog');
  const [wallpaperKey, setWallpaperKey] =
    useState<keyof typeof SAMPLE_WALLPAPERS>('darkAbstract');
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark');

  // UI Enhancements Controls
  const [useIndependentThemes, setUseIndependentThemes] = useState(true);
  const [autoAdvanceToMinutes, setAutoAdvanceToMinutes] = useState(true);
  const [enableBounds, setEnableBounds] = useState(true);
  const [hideOutOfRangeDates, setHideOutOfRangeDates] = useState(false);
  const [showTopHeaderLogo, setShowTopHeaderLogo] = useState(false);
  const [watchLogoPosition, setWatchLogoPosition] = useState<
    'top' | 'center' | 'bottom'
  >('top');

  // Standalone inline demo state
  const [inlineDate, setInlineDate] = useState(() => new Date());
  const [inlineActiveHand, setInlineActiveHand] = useState<ActiveHand>('hours');

  const inlineHours = inlineDate.getHours();
  const inlineMinutes = inlineDate.getMinutes();

  const handleInlineTimeChange = (h: number, m: number) => {
    setInlineDate((prev) => setTimeOnDate(prev, h, m));
  };

  const handleInlineDateSelect = (d: Date) => {
    setInlineDate((prev) => setDatePreservingTime(prev, d));
  };

  const handleInlineTogglePeriod = () => {
    const nextH = inlineHours >= 12 ? inlineHours - 12 : inlineHours + 12;
    handleInlineTimeChange(nextH, inlineMinutes);
  };

  const isDark = themeMode === 'dark';
  const activeWallpaper = SAMPLE_WALLPAPERS[wallpaperKey];

  // Boundaries: 3 days ago to 14 days in future
  const minimumDate = enableBounds
    ? new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    : undefined;
  const maximumDate = enableBounds
    ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    : undefined;

  // Independent Calendar Theme (Emerald Palette)
  const calendarTheme: DialoraCalendarSectionTheme | undefined =
    useIndependentThemes
      ? {
          backgroundColor: '#064E3B',
          textColor: '#ECFDF5',
          headerTextColor: '#A7F3D0',
          headerArrowColor: '#6EE7B7',
          weekdayTextColor: '#6EE7B7',
          dayTextColor: '#F0FDF4',
          selectedDateColor: '#10B981',
          selectedDayColor: '#10B981',
          selectedDayTextColor: '#FFFFFF',
          todayColor: '#34D399',
          todayTextColor: '#6EE7B7',
          adjacentMonthDayTextColor: '#047857',
          disabledDayTextColor: '#065F46',
          disabledDayBackgroundColor: 'rgba(6, 78, 59, 0.4)',
        }
      : undefined;

  // Independent Watch Theme (Cyber Cyan Palette)
  const watchTheme: DialoraWatchTheme | undefined = useIndependentThemes
    ? {
        backgroundColor: '#0F172A',
        faceColor: '#090D16',
        bezelColor: '#1E293B',
        hourHandColor: '#F8FAFC',
        minuteHandColor: '#22D3EE',
        secondHandColor: '#38BDF8',
        centerDotColor: '#22D3EE',
        numeralColor: '#38BDF8',
        markerColor: '#0284C7',
        textColor: '#F8FAFC',
        secondaryTextColor: '#94A3B8',
        accentColor: '#22D3EE',
        digitalTextColor: '#22D3EE',
        digitalActiveColor: '#38BDF8',
        digitalBackgroundColor: 'rgba(34, 211, 238, 0.15)',
        selectedTimeColor: '#22D3EE',
      }
    : undefined;

  // Custom Tabs Theme
  const tabsTheme: DialoraTabsTheme | undefined = useIndependentThemes
    ? {
        activeBackgroundColor: '#22D3EE',
        activeTextColor: '#0F172A',
        inactiveBackgroundColor: 'rgba(15, 23, 42, 0.6)',
        inactiveTextColor: '#94A3B8',
        borderColor: '#1E293B',
        borderWidth: 1,
        borderRadius: 14,
        containerBackgroundColor: 'rgba(15, 23, 42, 0.5)',
      }
    : undefined;

  const currentTheme = isDark
    ? {
        backgroundColor: '#111827',
        dialColor: '#1F2937',
        bezelColor: '#374151',
        textColor: '#FFFFFF',
        secondaryTextColor: '#9CA3AF',
        accentColor: '#6366F1',
        confirmButtonColor: '#6366F1',
        cancelButtonColor: '#374151',
        calendar: {
          headerTextColor: '#FFFFFF',
          selectedDayColor: '#6366F1',
          todayColor: '#818CF8',
          dayTextColor: '#F3F4F6',
        },
        handColors: {
          hour: '#FFFFFF',
          minute: '#818CF8',
          centerDot: '#6366F1',
        },
      }
    : {
        backgroundColor: '#FFFFFF',
        dialColor: '#F3F4F6',
        bezelColor: '#E5E7EB',
        textColor: '#111827',
        secondaryTextColor: '#4B5563',
        accentColor: '#4F46E5',
        confirmButtonColor: '#4F46E5',
        cancelButtonColor: '#E5E7EB',
        confirmTextColor: '#FFFFFF',
        cancelTextColor: '#374151',
        calendar: {
          headerTextColor: '#111827',
          selectedDayColor: '#4F46E5',
          todayColor: '#6366F1',
          dayTextColor: '#1F2937',
        },
        handColors: {
          hour: '#1F2937',
          minute: '#4F46E5',
          centerDot: '#4F46E5',
        },
      };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <Text style={styles.headerTitle}>Dialora DateTime Picker</Text>
        <Text style={styles.headerSubtitle}>
          Custom Themes, In-Dial Branding & Auto-Navigation
        </Text>

        {/* Committed Value Card */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Committed Picker Value</Text>
          <Text style={styles.valueText}>
            {formatTime(
              selectedDate.getHours(),
              selectedDate.getMinutes(),
              use24Hour
            )}
          </Text>
          <Text style={styles.dateSubtext}>
            {selectedDate.toLocaleDateString(undefined, {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </Text>
          <View style={styles.buttonSpacer}>
            <Button
              title="Open Dialora Picker Modal"
              onPress={() => setPickerVisible(true)}
              color="#6366F1"
            />
          </View>
        </View>

        {/* Feature Toggles Card */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>UI & Interaction Enhancements</Text>

          <View style={styles.switchRow}>
            <View style={styles.switchLabelContainer}>
              <Text style={styles.settingLabel}>Independent Themes</Text>
              <Text style={styles.switchSubtext}>
                Emerald Calendar vs Cyber Cyan Watch Face
              </Text>
            </View>
            <Switch
              value={useIndependentThemes}
              onValueChange={setUseIndependentThemes}
              trackColor={{ false: '#D1D5DB', true: '#6366F1' }}
            />
          </View>

          <View style={styles.switchRow}>
            <View style={styles.switchLabelContainer}>
              <Text style={styles.settingLabel}>Auto-Advance to Minutes</Text>
              <Text style={styles.switchSubtext}>
                Automatically switch hands after selecting hour
              </Text>
            </View>
            <Switch
              value={autoAdvanceToMinutes}
              onValueChange={setAutoAdvanceToMinutes}
              trackColor={{ false: '#D1D5DB', true: '#6366F1' }}
            />
          </View>

          <View style={styles.switchRow}>
            <View style={styles.switchLabelContainer}>
              <Text style={styles.settingLabel}>Min/Max Date Bounds</Text>
              <Text style={styles.switchSubtext}>
                [-3 days, +14 days] boundary window
              </Text>
            </View>
            <Switch
              value={enableBounds}
              onValueChange={setEnableBounds}
              trackColor={{ false: '#D1D5DB', true: '#6366F1' }}
            />
          </View>

          <View style={styles.switchRow}>
            <View style={styles.switchLabelContainer}>
              <Text style={styles.settingLabel}>Hide Out-of-Range Dates</Text>
              <Text style={styles.switchSubtext}>
                Hide vs disable out-of-range calendar dates
              </Text>
            </View>
            <Switch
              value={hideOutOfRangeDates}
              onValueChange={setHideOutOfRangeDates}
              disabled={!enableBounds}
              trackColor={{ false: '#D1D5DB', true: '#6366F1' }}
            />
          </View>

          <View style={styles.switchRow}>
            <View style={styles.switchLabelContainer}>
              <Text style={styles.settingLabel}>Top Header Logo</Text>
              <Text style={styles.switchSubtext}>
                Hide top logo while watch dial retains brand emblem
              </Text>
            </View>
            <Switch
              value={showTopHeaderLogo}
              onValueChange={setShowTopHeaderLogo}
              trackColor={{ false: '#D1D5DB', true: '#6366F1' }}
            />
          </View>

          {/* Watch Logo Position */}
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Dial Logo Position:</Text>
            <View style={styles.pillGroup}>
              {(['top', 'center', 'bottom'] as const).map((pos) => (
                <TouchableOpacity
                  key={`pos-${pos}`}
                  style={[
                    styles.togglePill,
                    watchLogoPosition === pos && styles.togglePillActive,
                  ]}
                  onPress={() => setWatchLogoPosition(pos)}
                >
                  <Text
                    style={[
                      styles.togglePillText,
                      watchLogoPosition === pos && styles.togglePillTextActive,
                    ]}
                  >
                    {pos}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Configuration Controls */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Picker Configuration</Text>

          {/* Mode */}
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Mode:</Text>
            <View style={styles.pillGroup}>
              {(['date', 'time', 'datetime'] as PickerMode[]).map((m) => (
                <TouchableOpacity
                  key={`mode-${m}`}
                  style={[
                    styles.togglePill,
                    pickerMode === m && styles.togglePillActive,
                  ]}
                  onPress={() => setPickerMode(m)}
                >
                  <Text
                    style={[
                      styles.togglePillText,
                      pickerMode === m && styles.togglePillTextActive,
                    ]}
                  >
                    {m}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Display */}
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Display:</Text>
            <View style={styles.pillGroup}>
              {(['analog', 'digital', 'hybrid'] as PickerDisplay[]).map((d) => (
                <TouchableOpacity
                  key={`disp-${d}`}
                  style={[
                    styles.togglePill,
                    pickerDisplay === d && styles.togglePillActive,
                  ]}
                  onPress={() => setPickerDisplay(d)}
                >
                  <Text
                    style={[
                      styles.togglePillText,
                      pickerDisplay === d && styles.togglePillTextActive,
                    ]}
                  >
                    {d}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Format */}
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Format:</Text>
            <View style={styles.pillGroup}>
              <TouchableOpacity
                style={[
                  styles.togglePill,
                  !use24Hour && styles.togglePillActive,
                ]}
                onPress={() => setUse24Hour(false)}
              >
                <Text
                  style={[
                    styles.togglePillText,
                    !use24Hour && styles.togglePillTextActive,
                  ]}
                >
                  12-Hour
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.togglePill,
                  use24Hour && styles.togglePillActive,
                ]}
                onPress={() => setUse24Hour(true)}
              >
                <Text
                  style={[
                    styles.togglePillText,
                    use24Hour && styles.togglePillTextActive,
                  ]}
                >
                  24-Hour
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Minute Interval */}
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Interval:</Text>
            <View style={styles.pillGroup}>
              {([1, 5, 10, 15] as MinuteInterval[]).map((interval) => (
                <TouchableOpacity
                  key={`min-${interval}`}
                  style={[
                    styles.togglePill,
                    minuteInterval === interval && styles.togglePillActive,
                  ]}
                  onPress={() => setMinuteInterval(interval)}
                >
                  <Text
                    style={[
                      styles.togglePillText,
                      minuteInterval === interval &&
                        styles.togglePillTextActive,
                    ]}
                  >
                    {interval}m
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Theme */}
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Theme Mode:</Text>
            <View style={styles.pillGroup}>
              <TouchableOpacity
                style={[styles.togglePill, isDark && styles.togglePillActive]}
                onPress={() => setThemeMode('dark')}
              >
                <Text
                  style={[
                    styles.togglePillText,
                    isDark && styles.togglePillTextActive,
                  ]}
                >
                  Dark
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.togglePill, !isDark && styles.togglePillActive]}
                onPress={() => setThemeMode('light')}
              >
                <Text
                  style={[
                    styles.togglePillText,
                    !isDark && styles.togglePillTextActive,
                  ]}
                >
                  Light
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Wallpaper */}
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Wallpaper:</Text>
            <View style={styles.pillGroup}>
              {(
                Object.keys(SAMPLE_WALLPAPERS) as Array<
                  keyof typeof SAMPLE_WALLPAPERS
                >
              ).map((wk) => (
                <TouchableOpacity
                  key={`wall-${wk}`}
                  style={[
                    styles.togglePill,
                    wallpaperKey === wk && styles.togglePillActive,
                  ]}
                  onPress={() => setWallpaperKey(wk)}
                >
                  <Text
                    style={[
                      styles.togglePillText,
                      wallpaperKey === wk && styles.togglePillTextActive,
                    ]}
                  >
                    {wk}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Inline Component Showcase */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Inline Watch & Brand Showcase</Text>
          <Text style={styles.helperText}>
            Direct rendering of AnalogWatch with in-dial brand logo and
            independent cyber theme:
          </Text>

          <WallpaperBackground
            wallpaper={activeWallpaper}
            fallbackBackgroundColor="#0F172A"
            borderRadius={16}
          >
            <View style={styles.showcaseInner}>
              <BrandHeader
                brandName="DIALORA"
                subtitle="INDEPENDENT WATCH ENGINE"
                alignment="center"
              />

              <CalendarView
                selectedDate={inlineDate}
                onSelectDate={handleInlineDateSelect}
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                hideOutOfRangeDates={hideOutOfRangeDates}
                theme={currentTheme}
                calendarTheme={calendarTheme}
              />

              <DigitalClock
                hours={inlineHours}
                minutes={inlineMinutes}
                use24Hour={use24Hour}
                activeHand={inlineActiveHand}
                onSelectActiveHand={setInlineActiveHand}
                onTogglePeriod={handleInlineTogglePeriod}
                theme={currentTheme}
                watchTheme={watchTheme}
              />

              <AnalogWatch
                hours={inlineHours}
                minutes={inlineMinutes}
                minuteInterval={minuteInterval}
                activeHand={inlineActiveHand}
                onTimeChange={handleInlineTimeChange}
                onActiveHandChange={setInlineActiveHand}
                onHourSelectionComplete={() => {
                  if (autoAdvanceToMinutes) {
                    setInlineActiveHand('minutes');
                  }
                }}
                size={230}
                use24Hour={use24Hour}
                brandName="Dialora Chrono"
                logo={SAMPLE_LOGO}
                logoPosition={watchLogoPosition}
                theme={currentTheme}
                watchTheme={watchTheme}
              />
            </View>
          </WallpaperBackground>
        </View>
      </ScrollView>

      {/* Modal Picker */}
      <DialoraDateTimePicker
        visible={pickerVisible}
        value={selectedDate}
        mode={pickerMode}
        display={pickerDisplay}
        wallpaper={activeWallpaper}
        logo={SAMPLE_LOGO}
        watchLogo={SAMPLE_LOGO}
        showTopHeaderLogo={showTopHeaderLogo}
        watchLogoPosition={watchLogoPosition}
        autoAdvanceToMinutes={autoAdvanceToMinutes}
        minimumDate={minimumDate}
        maximumDate={maximumDate}
        hideOutOfRangeDates={hideOutOfRangeDates}
        brandName="DIALORA"
        subtitle="CHRONOMETER"
        title="Select Date & Time"
        use24Hour={use24Hour}
        minuteInterval={minuteInterval}
        clockSize={230}
        theme={currentTheme}
        calendarTheme={calendarTheme}
        watchTheme={watchTheme}
        tabsTheme={tabsTheme}
        onConfirm={(date) => {
          setSelectedDate(date);
          setPickerVisible(false);
        }}
        onCancel={() => {
          setPickerVisible(false);
        }}
        onDismiss={() => {
          setPickerVisible(false);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  buttonSpacer: {
    marginTop: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    elevation: 2,
    marginBottom: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    width: '100%',
  },
  cardLabel: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  dateSubtext: {
    color: '#6B7280',
    fontSize: 14,
  },
  headerSubtitle: {
    color: '#6B7280',
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
  headerTitle: {
    color: '#111827',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 4,
    textAlign: 'center',
  },
  helperText: {
    color: '#4B5563',
    fontSize: 13,
    marginBottom: 12,
  },
  pillGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  safeArea: {
    backgroundColor: '#F3F4F6',
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    padding: 16,
    paddingBottom: 40,
  },
  settingLabel: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
  },
  settingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 6,
  },
  showcaseInner: {
    alignItems: 'center',
    padding: 16,
  },
  switchLabelContainer: {
    flex: 1,
    paddingRight: 10,
  },
  switchRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  switchSubtext: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 2,
  },
  togglePill: {
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  togglePillActive: {
    backgroundColor: '#6366F1',
  },
  togglePillText: {
    color: '#4B5563',
    fontSize: 12,
    fontWeight: '600',
  },
  togglePillTextActive: {
    color: '#FFFFFF',
  },
  valueText: {
    color: '#111827',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 1,
    marginVertical: 4,
  },
});
