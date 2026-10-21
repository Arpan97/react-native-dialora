import { Image, StyleSheet, Text, View } from 'react-native';
import type {
  ImageSourcePropType,
  StyleProp,
  TextStyle,
  ViewStyle,
} from 'react-native';
import type {
  BrandHeaderConfig,
  DialoraImageResizeMode,
  DialoraLogo,
} from '../types';

export interface BrandHeaderProps {
  /** Main brand name text (e.g. "DIALORA") */
  brandName?: string;
  /** Subtitle text displayed below brand name (e.g. "CHRONOMETER") */
  subtitle?: string;
  /** Logo image source or advanced logo configuration */
  logo?: DialoraLogo;
  /** Horizontal alignment of header elements */
  alignment?: 'left' | 'center' | 'right';
  /** Additional header configuration overrides */
  headerConfig?: BrandHeaderConfig;
  /** Primary text color */
  textColor?: string;
  /** Secondary subtitle text color */
  secondaryTextColor?: string;
  /** Custom style for brand name title */
  titleStyle?: StyleProp<TextStyle>;
  /** Custom style for subtitle */
  subtitleStyle?: StyleProp<TextStyle>;
  /** Header container style */
  style?: StyleProp<ViewStyle>;
  /** Test identifier */
  testID?: string;
}

/**
 * BrandHeader
 *
 * Renders an accessible, brand-aligned header with an optional logo emblem,
 * title, and subtitle formatted for high readability against wallpapers.
 */
export function BrandHeader({
  brandName,
  subtitle,
  logo,
  alignment = 'center',
  headerConfig,
  textColor = '#FFFFFF',
  secondaryTextColor = '#9CA3AF',
  titleStyle,
  subtitleStyle,
  style,
  testID = 'dialora-brand-header',
}: BrandHeaderProps) {
  const finalBrand = headerConfig?.brandName ?? brandName;
  const finalSubtitle = headerConfig?.subtitle ?? subtitle;
  const finalLogo = headerConfig?.logo ?? logo;
  const finalAlignment = headerConfig?.alignment ?? alignment;

  if (!finalBrand && !finalSubtitle && !finalLogo) {
    return null;
  }

  // Parse logo configuration
  let logoSource: ImageSourcePropType | null = null;
  let logoWidth = 28;
  let logoHeight = 28;
  let logoResizeMode: DialoraImageResizeMode = 'contain';
  let logoTintColor: string | undefined;

  if (finalLogo) {
    if (typeof finalLogo === 'string') {
      logoSource = { uri: finalLogo };
    } else if (
      typeof finalLogo === 'number' ||
      ('uri' in finalLogo && typeof finalLogo.uri === 'string')
    ) {
      logoSource = finalLogo as ImageSourcePropType;
    } else if (typeof finalLogo === 'object' && 'source' in finalLogo) {
      const cfg = finalLogo;
      logoSource =
        typeof cfg.source === 'string' ? { uri: cfg.source } : cfg.source;
      if (cfg.width !== undefined) {
        logoWidth = cfg.width;
      }
      if (cfg.height !== undefined) {
        logoHeight = cfg.height;
      }
      if (cfg.resizeMode) {
        logoResizeMode = cfg.resizeMode;
      }
      if (cfg.tintColor) {
        logoTintColor = cfg.tintColor;
      }
    }
  }

  const alignStyle =
    finalAlignment === 'left'
      ? styles.alignLeft
      : finalAlignment === 'right'
        ? styles.alignRight
        : styles.alignCenter;

  const textAlign = finalAlignment;

  return (
    <View
      style={[styles.container, alignStyle, headerConfig?.style, style]}
      testID={testID}
      accessibilityRole="header"
    >
      {logoSource ? (
        <Image
          source={logoSource}
          resizeMode={logoResizeMode}
          style={[
            styles.logo,
            {
              height: logoHeight,
              tintColor: logoTintColor,
              width: logoWidth,
            },
          ]}
          testID={`${testID}-logo`}
          accessibilityLabel={`${finalBrand ?? 'Brand'} logo`}
        />
      ) : null}

      {finalBrand ? (
        <Text
          style={[
            styles.brandTitle,
            { color: textColor, textAlign },
            titleStyle,
            headerConfig?.titleStyle,
          ]}
          testID={`${testID}-title`}
        >
          {finalBrand}
        </Text>
      ) : null}

      {finalSubtitle ? (
        <Text
          style={[
            styles.subtitle,
            { color: secondaryTextColor, textAlign },
            subtitleStyle,
            headerConfig?.subtitleStyle,
          ]}
          testID={`${testID}-subtitle`}
        >
          {finalSubtitle}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  alignCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  alignLeft: {
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  alignRight: {
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  container: {
    marginBottom: 10,
    width: '100%',
  },
  logo: {
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.5,
    marginTop: 2,
    textTransform: 'uppercase',
  },
});

export default BrandHeader;
