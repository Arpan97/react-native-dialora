import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import type { ImageSourcePropType, StyleProp, ViewStyle } from 'react-native';
import type { DialoraImageResizeMode, DialoraWallpaper } from '../types';

export interface WallpaperBackgroundProps {
  /** Wallpaper image source or advanced configuration */
  wallpaper?: DialoraWallpaper;
  /** Background color fallback when image is omitted or fails to load */
  fallbackBackgroundColor?: string;
  /** Border radius matching the outer card container */
  borderRadius?: number;
  /** Outer container style */
  style?: StyleProp<ViewStyle>;
  /** Foreground content rendered above the wallpaper and overlay */
  children?: ReactNode;
  /** Test identifier */
  testID?: string;
}

/**
 * WallpaperBackground
 *
 * Provides a responsive background layer supporting local image assets,
 * remote URLs, semi-transparent color overlays for legibility, and graceful
 * fallback to solid colors if an image fails to load.
 */
export function WallpaperBackground({
  wallpaper,
  fallbackBackgroundColor = '#1A1C23',
  borderRadius = 20,
  style,
  children,
  testID = 'dialora-wallpaper-background',
}: WallpaperBackgroundProps) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [wallpaper]);

  // Parse wallpaper configuration
  let imageSource: ImageSourcePropType | null = null;
  let opacity = 0.85;
  let blurRadius: number | undefined;
  let resizeMode: DialoraImageResizeMode = 'cover';
  let overlayColor = 'rgba(0, 0, 0, 0.45)';
  let overlayOpacity = 1;

  if (wallpaper) {
    if (typeof wallpaper === 'string') {
      imageSource = { uri: wallpaper };
    } else if (
      typeof wallpaper === 'number' ||
      ('uri' in wallpaper && typeof wallpaper.uri === 'string')
    ) {
      imageSource = wallpaper as ImageSourcePropType;
    } else if (typeof wallpaper === 'object' && 'source' in wallpaper) {
      const config = wallpaper;
      if (typeof config.source === 'string') {
        imageSource = { uri: config.source };
      } else {
        imageSource = config.source;
      }
      if (config.opacity !== undefined) {
        opacity = config.opacity;
      }
      if (config.blurRadius !== undefined) {
        blurRadius = config.blurRadius;
      }
      if (config.resizeMode) {
        resizeMode = config.resizeMode;
      }
      if (config.overlayColor !== undefined) {
        overlayColor = config.overlayColor;
      }
      if (config.overlayOpacity !== undefined) {
        overlayOpacity = config.overlayOpacity;
      }
    }
  }

  const showImage = Boolean(imageSource && !hasError);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: fallbackBackgroundColor, borderRadius },
        style,
      ]}
      testID={testID}
    >
      {/* Background Image Layer */}
      {showImage && imageSource ? (
        <Image
          source={imageSource}
          resizeMode={resizeMode}
          blurRadius={blurRadius}
          onError={() => setHasError(true)}
          style={[
            StyleSheet.absoluteFill,
            {
              borderRadius,
              opacity,
            },
          ]}
          testID={`${testID}-image`}
        />
      ) : null}

      {/* Contrast Overlay Layer */}
      {showImage ? (
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: overlayColor,
              borderRadius,
              opacity: overlayOpacity,
            },
          ]}
          pointerEvents="none"
          testID={`${testID}-overlay`}
        />
      ) : null}

      {/* Foreground Children */}
      <View style={styles.contentContainer} pointerEvents="box-none">
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
  },
  contentContainer: {
    position: 'relative',
    width: '100%',
    zIndex: 1,
  },
});

export default WallpaperBackground;
