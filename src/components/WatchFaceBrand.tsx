import { Image, StyleSheet, Text, View } from 'react-native';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import type { DialoraLogo, DialoraLogoConfig } from '../types';

export interface WatchFaceBrandProps {
  /** Logo image source, URL, or configuration object */
  logo?: DialoraLogo;
  /** Brand name string displayed on dial */
  brandName?: string;
  /** Custom text style for brand name */
  brandTextStyle?: StyleProp<TextStyle>;
  /** Default text color for brand text */
  textColor?: string;
  /** Clock diameter in points */
  clockSize: number;
  /** Vertical placement relative to center pivot ('top' | 'center' | 'bottom') */
  position?: 'top' | 'center' | 'bottom';
  /** Additional vertical offset in points */
  offsetY?: number;
  /** Custom container style */
  style?: StyleProp<ViewStyle>;
  /** Test identifier */
  testID?: string;
}

function isLogoConfig(logo: DialoraLogo): logo is DialoraLogoConfig {
  return typeof logo === 'object' && logo !== null && 'source' in logo;
}

/**
 * WatchFaceBrand
 *
 * Renders an integrated brand logo and/or brand text inside the circular analog watch face.
 * Layered beneath clock hands and pivot pin to preserve interactive time adjustment.
 */
export function WatchFaceBrand({
  logo,
  brandName,
  brandTextStyle,
  textColor = '#E5E7EB',
  clockSize,
  position = 'top',
  offsetY = 0,
  style,
  testID = 'dialora-watch-face-brand',
}: WatchFaceBrandProps) {
  if (!logo && !brandName) {
    return null;
  }

  const center = clockSize / 2;

  // Determine vertical offset based on position preset
  let baseTop = center - clockSize * 0.24; // 'top'
  if (position === 'bottom') {
    baseTop = center + clockSize * 0.12;
  } else if (position === 'center') {
    baseTop = center - clockSize * 0.08;
  }

  const calculatedTop = baseTop + offsetY;

  // Image source and dimensions
  let imageSource = null;
  let logoWidth = Math.max(20, Math.round(clockSize * 0.16));
  let logoHeight = Math.max(14, Math.round(clockSize * 0.11));
  let tintColor: string | undefined;
  let resizeMode: 'contain' | 'cover' | 'center' = 'contain';

  if (logo) {
    if (isLogoConfig(logo)) {
      imageSource =
        typeof logo.source === 'string' ? { uri: logo.source } : logo.source;
      if (logo.width) logoWidth = logo.width;
      if (logo.height) logoHeight = logo.height;
      if (logo.tintColor) tintColor = logo.tintColor;
      if (
        logo.resizeMode &&
        logo.resizeMode !== 'none' &&
        logo.resizeMode !== 'repeat' &&
        logo.resizeMode !== 'stretch'
      ) {
        resizeMode = logo.resizeMode as 'contain' | 'cover' | 'center';
      }
    } else if (typeof logo === 'string') {
      imageSource = { uri: logo };
    } else {
      imageSource = logo;
    }
  }

  const fontSize = Math.max(9, Math.round(clockSize * 0.046));

  return (
    <View
      style={[
        styles.container,
        {
          top: calculatedTop,
          maxWidth: clockSize * 0.65,
        },
        style,
      ]}
      pointerEvents="none"
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      testID={testID}
    >
      {imageSource ? (
        <Image
          source={imageSource}
          style={[
            styles.logoImage,
            {
              width: logoWidth,
              height: logoHeight,
              tintColor,
            },
          ]}
          resizeMode={resizeMode}
          testID={`${testID}-image`}
        />
      ) : null}

      {brandName ? (
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          style={[
            styles.brandText,
            {
              color: textColor,
              fontSize,
            },
            brandTextStyle,
          ]}
          testID={`${testID}-text`}
        >
          {brandName}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  brandText: {
    fontWeight: '700',
    letterSpacing: 2,
    marginTop: 2,
    opacity: 0.88,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  container: {
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    zIndex: 2,
  },
  logoImage: {
    marginBottom: 2,
  },
});

export default WatchFaceBrand;
