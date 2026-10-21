# react-native-dialora

Production-ready, highly customizable analog watch and calendar date-time picker for React Native.

Features a responsive geometric analog watch engine, synchronized digital readout, interactive monthly calendar, personalized wallpaper backgrounds, and in-dial brand emblems.

## Installation

### Expo Projects (Expo Go, Development Builds & Prebuild)

```sh
npx expo install react-native-dialora
```

### Bare React Native CLI

```sh
npm install react-native-dialora
# or
yarn add react-native-dialora
```

> **Note**: `react-native-dialora` is a pure TypeScript/JavaScript library with zero custom native code. No `pod install` or native module linking is required. Works out of the box in Expo Go.

## Features

- **Geometric Analog Watch Engine**: Native touch and drag interactions for hours and minutes, accessible steppers, 12/24-hour modes, and configurable minute intervals.
- **In-Dial Brand Emblems (`WatchFaceBrand`)**: Render custom brand logos and text inside the circular watch face, layered beneath sweeping clock hands and center pivot.
- **Independent Section Branding**: Allow the Calendar section and Watch/Time section to feature completely separate wallpapers, logos, and color palettes.
- **Automatic Hour-to-Minute Navigation**: Intuitively auto-advances from hour selection to minute adjustment once an hour gesture finishes.
- **Custom Section Switcher Tabs**: Configurable active and inactive tab backgrounds, text colors, borders, and typography.
- **Date Range Restrictions & Out-of-Range Hiding**: Support `minimumDate`, `maximumDate`, and `hideOutOfRangeDates` (preserves weekday column alignment).
- **Candidate State Synchronization**: Full mutual exclusion and state preservation across tab switches, with guaranteed Confirm, Cancel, and Dismiss lifecycles.

---

## Basic Usage

```tsx
import React, { useState } from 'react';
import { View, Button, Text } from 'react-native';
import { DialoraDateTimePicker } from 'react-native-dialora';

export default function App() {
  const [visible, setPickerVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Selected: {selectedDate.toLocaleString()}</Text>
      <Button title="Open Picker" onPress={() => setPickerVisible(true)} />

      <DialoraDateTimePicker
        visible={visible}
        value={selectedDate}
        mode="datetime"
        display="analog"
        onConfirm={(confirmedDate) => {
          setSelectedDate(confirmedDate);
          setPickerVisible(false);
        }}
        onCancel={() => setPickerVisible(false)}
        onDismiss={() => setPickerVisible(false)}
      />
    </View>
  );
}
```

---

## Advanced Customization

### 1. Independent Calendar & Watch Themes

```tsx
<DialoraDateTimePicker
  visible={visible}
  value={selectedDate}
  mode="datetime"
  // Emerald Theme for Calendar
  calendarTheme={{
    backgroundColor: '#064E3B',
    textColor: '#ECFDF5',
    headerTextColor: '#A7F3D0',
    selectedDateColor: '#10B981',
    dayTextColor: '#F0FDF4',
    todayColor: '#34D399',
  }}
  // Cyber Cyan Theme for Watch Face
  watchTheme={{
    faceColor: '#090D16',
    bezelColor: '#1E293B',
    hourHandColor: '#F8FAFC',
    minuteHandColor: '#22D3EE',
    numeralColor: '#38BDF8',
    selectedTimeColor: '#22D3EE',
    digitalTextColor: '#22D3EE',
  }}
  // Custom Section Switcher Tabs
  tabsTheme={{
    activeBackgroundColor: '#22D3EE',
    activeTextColor: '#0F172A',
    inactiveBackgroundColor: 'rgba(15, 23, 42, 0.6)',
    inactiveTextColor: '#94A3B8',
    borderRadius: 12,
  }}
  onConfirm={(date) => {
    setSelectedDate(date);
    setPickerVisible(false);
  }}
  onCancel={() => setPickerVisible(false)}
/>
```

### 2. In-Dial Logo & Header Independence

Place your brand logo inside the circular watch face, beneath the clock hands:

```tsx
<DialoraDateTimePicker
  visible={visible}
  value={selectedDate}
  mode="time"
  brandName="CHRONO"
  watchLogo={{
    source: require('./assets/brand-logo.png'),
    width: 36,
    height: 22,
  }}
  watchLogoPosition="top" // 'top' | 'center' | 'bottom'
  showTopHeaderLogo={false} // Hide top header logo while dial retains its emblem
  onConfirm={(date) => {
    setSelectedDate(date);
    setPickerVisible(false);
  }}
/>
```

### 3. Automatic Navigation & Min/Max Date Bounds

```tsx
<DialoraDateTimePicker
  visible={visible}
  value={selectedDate}
  mode="datetime"
  // Auto-switch hands from hours to minutes once hour selection finishes
  autoAdvanceToMinutes={true}
  // Boundary window: only allow dates in the allowed range
  minimumDate={new Date(2026, 9, 1)}
  maximumDate={new Date(2026, 9, 25)}
  // Hide out-of-range dates while preserving Sunday-Saturday column alignment
  hideOutOfRangeDates={true}
  onConfirm={(date) => {
    setSelectedDate(date);
    setPickerVisible(false);
  }}
  onCancel={() => setPickerVisible(false)}
/>
```

---

## Configuration Reference

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `Date` | `new Date()` | Currently selected candidate date/time value. |
| `visible` | `boolean` | `true` | Whether the picker modal is presented. |
| `mode` | `'date' \| 'time' \| 'datetime'` | `'datetime'` | Operating mode of the picker. |
| `display` | `'analog' \| 'digital' \| 'hybrid'` | `'analog'` | Watch face display style. |
| `theme` | `DialoraTheme` | `undefined` | Comprehensive theme and color palette. |
| `calendarTheme` | `DialoraCalendarSectionTheme` | `undefined` | Dedicated colors for calendar section. |
| `watchTheme` | `DialoraWatchTheme` | `undefined` | Dedicated colors for watch section. |
| `tabsTheme` | `DialoraTabsTheme` | `undefined` | Styling for section switcher tabs. |
| `calendarWallpaper` | `DialoraWallpaper` | `undefined` | Wallpaper displayed in calendar section. |
| `watchWallpaper` | `DialoraWallpaper` | `undefined` | Wallpaper displayed in watch section. |
| `watchLogo` | `DialoraLogo` | `undefined` | Logo displayed inside circular watch dial. |
| `calendarLogo` | `DialoraLogo` | `undefined` | Logo displayed in calendar section header. |
| `showTopHeaderLogo` | `boolean` | `true` | Whether to show logo in top header. |
| `watchLogoPosition` | `'top' \| 'center' \| 'bottom'` | `'top'` | Vertical placement inside dial. |
| `watchLogoOffsetY` | `number` | `0` | Fine-tuned vertical offset points. |
| `autoAdvanceToMinutes`| `boolean` | `true` | Auto-switch from hours to minutes on selection. |
| `minimumDate` | `Date` | `undefined` | Earliest selectable date boundary. |
| `maximumDate` | `Date` | `undefined` | Latest selectable date boundary. |
| `hideOutOfRangeDates`| `boolean` | `false` | Completely hide out-of-range dates while preserving grid columns. |
| `firstDayOfWeek` | `FirstDayOfWeek` | `0` | First day of the week for calendar (0 = Sunday). |
| `disabledDates` | `DisabledDateMatcher` | `undefined` | Dates or predicate function to disable in calendar. |
| `use24Hour` | `boolean` | `false` | Whether to display 24-hour time format. |
| `minuteInterval` | `MinuteInterval` | `1` | Minute granularity (1, 5, 10, 15, etc.). |
| `clockSize` | `number` | `240` | Diameter in points for analog watch dial. |
| `isModal` | `boolean` | `true` | Whether the picker is presented in a modal overlay or inline. |
| `statusBarTranslucent`| `boolean` | `false` | Translucent status bar on Android during modal display. |
| `validationMessage` | `string \| null` | `undefined` | Custom validation error banner text (null to hide, auto-generated if undefined). |
| `confirmText` | `string` | `'Confirm'` | Confirm button text label. |
| `cancelText` | `string` | `'Cancel'` | Cancel button text label. |
| `onChange` | `(event, date) => void` | `undefined` | Invoked on intermediate date/time changes. |
| `onConfirm` | `(date: Date) => void` | `undefined` | Invoked on explicit confirmation. |
| `onCancel` | `() => void` | `undefined` | Invoked on explicit cancellation. |
| `onDismiss` | `() => void` | `undefined` | Invoked when backdrop/back button dismissed. |

---

## Standalone Components

You can also use Dialora's underlying engine components standalone:

- `AnalogWatch`
- `WatchFaceBrand`
- `CalendarView`
- `DigitalClock`
- `BrandHeader`
- `WallpaperBackground`
- `DialoraIcon`
- `DialoraSession`

## License

MIT
