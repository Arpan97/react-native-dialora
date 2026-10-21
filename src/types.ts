import type {
  ImageSourcePropType,
  StyleProp,
  TextStyle,
  ViewStyle,
} from 'react-native';
import type {
  CalendarDayCell,
  CalendarGridOptions,
  DisabledDateMatcher,
  FirstDayOfWeek,
} from './utils/dateUtils';

export type {
  CalendarDayCell,
  CalendarGridOptions,
  DisabledDateMatcher,
  FirstDayOfWeek,
};

/**
 * Valid values for image resizing modes.
 */
export type DialoraImageResizeMode =
  'center' | 'contain' | 'cover' | 'repeat' | 'stretch' | 'none';

/**
 * Operating mode for the Dialora picker.
 * - 'date': Calendar-only selection.
 * - 'time': Watch/clock-only selection.
 * - 'datetime': Combined calendar and watch selection.
 */
export type PickerMode = 'date' | 'time' | 'datetime';

/**
 * Visual display style for the clock face.
 * - 'analog': Traditional watch dial with hour, minute, and second hands.
 * - 'digital': Modern numeric readout with segmented digits.
 * - 'hybrid': Analog watch dial with synchronized digital readout overlay.
 */
export type PickerDisplay = 'analog' | 'digital' | 'hybrid';

/**
 * Action type representing what triggered the selection event.
 */
export type SelectionAction = 'change' | 'confirm' | 'cancel' | 'dismiss';

/**
 * Currently active hand mode for editing time on the watch dial.
 */
export type ActiveHand = 'hours' | 'minutes';

/**
 * Active tab when in datetime mode.
 */
export type DateTimePickerTab = 'calendar' | 'clock';

/**
 * Event payload emitted when intermediate date/time selections occur.
 */
export interface DialoraChangeEvent {
  /** The newly chosen candidate date/time */
  date: Date;
  /** Active picker mode when the change occurred */
  mode?: PickerMode;
}

/**
 * General selection event returned during picker interactions.
 */
export interface DialoraSelectionEvent {
  action: SelectionAction;
  date?: Date;
}

/**
 * Hand color palette for the analog watch dial.
 */
export interface DialoraHandColors {
  /** Hour hand color */
  hour?: string;
  /** Minute hand color */
  minute?: string;
  /** Second hand color (if rendered) */
  second?: string;
  /** Center pivot pin / cap color */
  centerDot?: string;
}

/**
 * Dedicated color and typography themes for the custom calendar view.
 */
export interface DialoraCalendarTheme {
  /** General text color for calendar section */
  textColor?: string;
  /** Primary color for selected date */
  selectedDateColor?: string;
  /** Text color for selected date */
  selectedTextColor?: string;
  /** Text color for the Month & Year header */
  headerTextColor?: string;
  /** Color for previous/next month navigation arrows */
  headerArrowColor?: string;
  /** Text color for weekday row labels (Su, Mo, Tu...) */
  weekdayTextColor?: string;
  /** Normal date number text color */
  dayTextColor?: string;
  /** Background highlight color for the selected day */
  selectedDayColor?: string;
  /** Text color for the selected day */
  selectedDayTextColor?: string;
  /** Accent outline / indicator color for today's date */
  todayColor?: string;
  /** Text color for today's date */
  todayTextColor?: string;
  /** Muted color for dates belonging to adjacent months */
  adjacentMonthDayTextColor?: string;
  /** Text color for dates disabled by boundaries or rules */
  disabledDayTextColor?: string;
  /** Background color for disabled dates */
  disabledDayBackgroundColor?: string;
}

/**
 * Comprehensive theme and styling options for the Dialora watch, calendar, and card.
 */
export interface DialoraTheme {
  /** Primary accent color used for selections and active indicators */
  accentColor?: string;
  /** Background color for the picker modal / container card */
  backgroundColor?: string;
  /** Dial face color */
  dialColor?: string;
  /** Border / bezel color surrounding the dial */
  bezelColor?: string;
  /** Hour and minute hand colors */
  handColors?: DialoraHandColors;
  /** Color of numbers / roman numerals on the dial */
  numberColor?: string;
  /** Color of minute / hour ticks on the dial */
  tickColor?: string;
  /** Primary text color */
  textColor?: string;
  /** Secondary / muted text color */
  secondaryTextColor?: string;
  /** Color highlighting selected calendar day */
  calendarSelectedColor?: string;
  /** Color highlighting today's date */
  calendarTodayColor?: string;
  /** Specific styling for the calendar component */
  calendar?: DialoraCalendarTheme;
  /** Dedicated calendar section theme */
  calendarTheme?: DialoraCalendarSectionTheme;
  /** Dedicated watch section theme */
  watchTheme?: DialoraWatchTheme;
  /** Dedicated tabs styling theme */
  tabsTheme?: DialoraTabsTheme;
  /** Primary color for selected calendar day */
  selectedDateColor?: string;
  /** Primary color for selected time / active hand */
  selectedTimeColor?: string;
  /** Active tab background or accent color */
  activeTabColor?: string;
  /** Inactive tab text or background color */
  inactiveTabColor?: string;
  /** Color for wallpaper overlay (default: 'rgba(0,0,0,0.5)') */
  wallpaperOverlayColor?: string;
  /** Opacity for wallpaper overlay (0.0 - 1.0) */
  wallpaperOverlayOpacity?: number;
  /** Confirm button background color */
  confirmButtonColor?: string;
  /** Confirm button text color */
  confirmTextColor?: string;
  /** Cancel button background color */
  cancelButtonColor?: string;
  /** Cancel button text color */
  cancelTextColor?: string;
  /** Corner radius for the card container */
  cardBorderRadius?: number;
  /** Color for validation error / feedback message (default: '#F87171') */
  validationTextColor?: string;
}

/**
 * Advanced configuration for wallpaper image displayed behind the picker.
 */
export interface DialoraWallpaperConfig {
  /** Image source (local require, object { uri: string }, or remote URL string) */
  source: ImageSourcePropType | string;
  /** Opacity of the wallpaper image (0.0 - 1.0) */
  opacity?: number;
  /** Blur radius applied to the wallpaper */
  blurRadius?: number;
  /** Resize mode for wallpaper image */
  resizeMode?: DialoraImageResizeMode;
  /** Custom overlay color on top of wallpaper (e.g. 'rgba(0,0,0,0.5)') */
  overlayColor?: string;
  /** Overlay opacity factor */
  overlayOpacity?: number;
}

/**
 * Wallpaper prop accepting either a direct image source, remote URL string, or advanced configuration object.
 */
export type DialoraWallpaper =
  ImageSourcePropType | string | DialoraWallpaperConfig;

/**
 * Advanced configuration for branding logo displayed on the picker header or dial.
 */
export interface DialoraLogoConfig {
  /** Image source for the brand logo */
  source: ImageSourcePropType | string;
  /** Width of the logo in points */
  width?: number;
  /** Height of the logo in points */
  height?: number;
  /** Resize mode for logo image */
  resizeMode?: DialoraImageResizeMode;
  /** Tint color applied to the logo */
  tintColor?: string;
}

/**
 * Logo prop accepting either a direct image source, URL string, or advanced configuration object.
 */
export type DialoraLogo = ImageSourcePropType | string | DialoraLogoConfig;

/**
 * Comprehensive configuration for the brand header at the top of the picker.
 */
export interface BrandHeaderConfig {
  /** Brand name string */
  brandName?: string;
  /** Optional subtitle string */
  subtitle?: string;
  /** Optional brand logo */
  logo?: DialoraLogo;
  /** Header content alignment */
  alignment?: 'left' | 'center' | 'right';
  /** Header container style */
  style?: StyleProp<ViewStyle>;
  /** Title text style */
  titleStyle?: StyleProp<TextStyle>;
  /** Subtitle text style */
  subtitleStyle?: StyleProp<TextStyle>;
}

/**
 * Dedicated styling configuration for Date and Time section switcher tabs.
 */
export interface DialoraTabsTheme {
  /** Background color for the active tab */
  activeBackgroundColor?: string;
  /** Text color for the active tab */
  activeTextColor?: string;
  /** Background color for the inactive tab */
  inactiveBackgroundColor?: string;
  /** Text color for the inactive tab */
  inactiveTextColor?: string;
  /** Border color around tabs container or tabs */
  borderColor?: string;
  /** Border width for tabs container or tabs */
  borderWidth?: number;
  /** Corner radius for tabs container */
  borderRadius?: number;
  /** Background color of the container wrapping both tabs */
  containerBackgroundColor?: string;
  /** Container view style */
  style?: StyleProp<ViewStyle>;
  /** Tab button style */
  tabStyle?: StyleProp<ViewStyle>;
  /** Typography / text style for tab labels */
  textStyle?: StyleProp<TextStyle>;
  /** Specific text style for active tab */
  activeTextStyle?: StyleProp<TextStyle>;
  /** Specific text style for inactive tab */
  inactiveTextStyle?: StyleProp<TextStyle>;
}

/**
 * Dedicated theme configuration for the Time / Watch section.
 */
export interface DialoraWatchTheme {
  /** Background color for the watch container card */
  backgroundColor?: string;
  /** Clock face background color */
  faceColor?: string;
  /** Outer bezel / ring border color */
  bezelColor?: string;
  /** Hour hand color */
  hourHandColor?: string;
  /** Minute hand color */
  minuteHandColor?: string;
  /** Optional second hand color */
  secondHandColor?: string;
  /** Center pivot pin / cap color */
  centerDotColor?: string;
  /** Color for tick markers */
  markerColor?: string;
  /** Color for hour numbers / numerals */
  numeralColor?: string;
  /** Color for tick markers (alias for markerColor) */
  tickColor?: string;
  /** Color for hour numbers (alias for numeralColor) */
  numberColor?: string;
  /** General text color for watch section */
  textColor?: string;
  /** Secondary / muted text color */
  secondaryTextColor?: string;
  /** Accent color for active state indicators */
  accentColor?: string;
  /** Digital clock numbers text color */
  digitalTextColor?: string;
  /** Digital clock active segment highlight color */
  digitalActiveColor?: string;
  /** Digital clock segment background */
  digitalBackgroundColor?: string;
  /** Selected time highlight color */
  selectedTimeColor?: string;
}

/**
 * Dedicated theme configuration for the Calendar / Date section.
 */
export interface DialoraCalendarSectionTheme {
  /** Container background color for calendar section */
  backgroundColor?: string;
  /** General text color for calendar section */
  textColor?: string;
  /** Highlight color for selected date */
  selectedDateColor?: string;
  /** Text color for selected date */
  selectedTextColor?: string;
  /** Text color for the Month & Year header */
  headerTextColor?: string;
  /** Color for previous/next navigation arrows */
  headerArrowColor?: string;
  /** Text color for weekday row labels (Su, Mo, Tu...) */
  weekdayTextColor?: string;
  /** Normal date number text color */
  dayTextColor?: string;
  /** Background highlight color for the selected day */
  selectedDayColor?: string;
  /** Text color for the selected day */
  selectedDayTextColor?: string;
  /** Accent outline / indicator color for today's date */
  todayColor?: string;
  /** Text color for today's date */
  todayTextColor?: string;
  /** Muted color for dates belonging to adjacent months */
  adjacentMonthDayTextColor?: string;
  /** Text color for dates disabled by boundaries or rules */
  disabledDayTextColor?: string;
  /** Background color for disabled dates */
  disabledDayBackgroundColor?: string;
}

/**
 * Granularity of minutes selectable on the watch dial.
 */
export type MinuteInterval = 1 | 2 | 3 | 4 | 5 | 6 | 10 | 12 | 15 | 20 | 30;

/**
 * Documented Callback Contract:
 *
 * 1. `onConfirm(selectedDate: Date)`:
 *    - MUST be invoked when the user explicitly commits their choice via the Confirm button.
 *    - Returns the committed `Date`.
 *    - Neither `onCancel` nor `onDismiss` will be called if `onConfirm` is invoked.
 *
 * 2. `onCancel()`:
 *    - MUST be invoked when the user explicitly taps the Cancel button.
 *    - Discards any intermediate or pending date/time choice.
 *    - `onConfirm` will NOT be called.
 *
 * 3. `onDismiss()`:
 *    - MUST be invoked when the picker modal is dismissed via backdrop touch, hardware back button, or swipe.
 *    - NEVER accidentally confirms a selection.
 *    - Guarantees `onConfirm` is NOT executed.
 *
 * 4. Mutual Exclusion:
 *    - Callbacks are mutually exclusive per interaction lifecycle; duplicate or ambiguous invocations are prevented.
 */
export interface DialoraDateTimePickerProps {
  /**
   * The currently selected Date value.
   * Defaults to `new Date()`.
   */
  value?: Date;

  /**
   * Whether the picker is currently visible.
   * Defaults to `true`.
   */
  visible?: boolean;

  /**
   * Operating mode: 'date' | 'time' | 'datetime'.
   * Defaults to `'datetime'`.
   */
  mode?: PickerMode;

  /**
   * Clock display style: 'analog' | 'digital' | 'hybrid'.
   * Defaults to `'analog'`.
   */
  display?: PickerDisplay;

  /**
   * Custom wallpaper or background image covering the picker surface.
   */
  wallpaper?: DialoraWallpaper;

  /**
   * Dedicated wallpaper displayed when in the calendar/date section.
   * Falls back to `wallpaper` if omitted.
   */
  calendarWallpaper?: DialoraWallpaper;

  /**
   * Dedicated wallpaper displayed when in the watch/time section.
   * Falls back to `wallpaper` if omitted.
   */
  watchWallpaper?: DialoraWallpaper;

  /**
   * Brand emblem / logo image displayed on the picker header or watch dial.
   */
  logo?: DialoraLogo;

  /**
   * Dedicated logo displayed in the calendar/date section header.
   * Falls back to `logo` if omitted.
   */
  calendarLogo?: DialoraLogo;

  /**
   * Dedicated logo displayed inside the circular watch face.
   * Falls back to `logo` if omitted.
   */
  watchLogo?: DialoraLogo;

  /**
   * Whether to display the brand logo in the top brand header.
   * Allows showing the logo inside the watch dial while hiding it in the header.
   * Defaults to `true`.
   */
  showTopHeaderLogo?: boolean;

  /**
   * Vertical positioning of the brand logo or text inside the circular watch face.
   * Defaults to `'top'`.
   */
  watchLogoPosition?: 'top' | 'center' | 'bottom';

  /**
   * Custom vertical offset in points for the watch face brand logo / text.
   */
  watchLogoOffsetY?: number;

  /**
   * Brand name string displayed at the top or on the dial (e.g. "DIALORA").
   */
  brandName?: string;

  /**
   * Subtitle text displayed below the brand name (e.g. "CHRONOMETER").
   */
  subtitle?: string;

  /**
   * Optional custom style for the brand name text.
   */
  brandTextStyle?: StyleProp<TextStyle>;

  /**
   * Optional dedicated configuration object for the brand header.
   */
  headerConfig?: BrandHeaderConfig;

  /**
   * Minimum selectable date/time boundary.
   */
  minimumDate?: Date;

  /**
   * Maximum selectable date/time boundary.
   */
  maximumDate?: Date;

  /**
   * Whether to completely hide dates outside the [minimumDate, maximumDate] boundary
   * while preserving correct Sunday-Saturday column alignment.
   * When false (default), out-of-range dates remain visible but disabled.
   */
  hideOutOfRangeDates?: boolean;

  /**
   * First day of the week for the calendar (0 = Sunday, 1 = Monday, etc. Defaults to 0).
   */
  firstDayOfWeek?: FirstDayOfWeek;

  /**
   * Dates or predicate function to disable in the calendar.
   */
  disabledDates?: DisabledDateMatcher;

  /**
   * Whether to format hours in 24-hour time.
   * Defaults to `false` (12-hour AM/PM format).
   */
  use24Hour?: boolean;

  /**
   * Minute step granularity (e.g. 1, 5, 15).
   * Defaults to `1`.
   */
  minuteInterval?: MinuteInterval;

  /**
   * Clock diameter in points for the analog watch.
   * Defaults to `240`.
   */
  clockSize?: number;

  /**
   * Whether to display the digital clock readout alongside the analog watch.
   * Defaults to `true`.
   */
  showDigital?: boolean;

  /**
   * Initial hand mode to adjust when the watch opens ('hours' | 'minutes').
   * Defaults to `'hours'`.
   */
  initialActiveHand?: ActiveHand;

  /**
   * Active tab in datetime mode ('calendar' | 'clock').
   */
  activeTab?: DateTimePickerTab;

  /**
   * Callback invoked when switching between calendar and clock tabs in datetime mode.
   */
  onTabChange?: (tab: DateTimePickerTab) => void;

  /**
   * Whether to automatically advance the active selection from hours to minutes
   * immediately after an hour selection is completed.
   * Defaults to `true`.
   */
  autoAdvanceToMinutes?: boolean;

  /**
   * Custom theme and color palette.
   */
  theme?: DialoraTheme;

  /**
   * Dedicated theme configuration for the calendar/date section.
   * Overrides equivalent properties in `theme`.
   */
  calendarTheme?: DialoraCalendarSectionTheme;

  /**
   * Dedicated theme configuration for the watch/time section.
   * Overrides equivalent properties in `theme`.
   */
  watchTheme?: DialoraWatchTheme;

  /**
   * Dedicated theme configuration for the section switcher tabs.
   * Overrides equivalent properties in `theme`.
   */
  tabsTheme?: DialoraTabsTheme;

  /**
   * Title shown at the top of the picker modal.
   */
  title?: string;

  /**
   * Text label for the Confirm button.
   * Defaults to `'Confirm'`.
   */
  confirmText?: string;

  /**
   * Text label for the Cancel button.
   * Defaults to `'Cancel'`.
   */
  cancelText?: string;

  /**
   * Whether the picker is rendered inside a modal overlay or inline.
   * Defaults to `true`.
   */
  isModal?: boolean;

  /**
   * Whether the status bar should be translucent on Android when the modal is presented.
   * Defaults to `false`.
   */
  statusBarTranslucent?: boolean;

  /**
   * Optional custom validation message to display when the current candidate selection is disabled.
   * If omitted or undefined, Dialora automatically generates a descriptive, accessible message.
   * If set to null, the validation message banner is hidden.
   */
  validationMessage?: string | null;

  /**
   * Custom outer container style.
   */
  style?: StyleProp<ViewStyle>;

  /**
   * Optional test ID for automation.
   */
  testID?: string;

  /**
   * Invoked whenever an intermediate date or time change occurs before confirmation.
   */
  onChange?: (event: DialoraSelectionEvent, selectedDate?: Date) => void;

  /**
   * Invoked when the user confirms their selection.
   * Guaranteed to receive the final confirmed `Date`.
   */
  onConfirm?: (selectedDate: Date) => void;

  /**
   * Invoked when the user cancels the selection.
   * Discards temporary choices without committing.
   */
  onCancel?: () => void;

  /**
   * Invoked when the picker is dismissed without pressing Confirm or Cancel.
   *
   * Modal presentation (`isModal: true`):
   * Triggered when the user taps the backdrop, presses the Android hardware back button,
   * or performs an iOS swipe/system dismissal.
   *
   * Inline presentation (`isModal: false`):
   * In inline presentation, there is no modal backdrop or system back handler; dismissal
   * is typically driven by the host container toggling visibility or unmounting. If invoked
   * programmatically, pending candidate selections are discarded.
   *
   * In all cases, `onDismiss` is guaranteed to be mutually exclusive with `onConfirm` and `onCancel`,
   * and will NEVER accidentally confirm an uncommitted candidate selection.
   */
  onDismiss?: () => void;
}
