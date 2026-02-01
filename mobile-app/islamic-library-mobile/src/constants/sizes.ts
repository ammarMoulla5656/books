/**
 * نظام الأحجام والمسافات للتطبيق
 */

import { Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
};

export const FontSize = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 20,
  '3xl': 24,
  '4xl': 28,
  '5xl': 32,
  '6xl': 36,
};

export const LineHeight = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
  loose: 2,
};

export const FontWeight = {
  light: '300' as const,
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const IconSize = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const ButtonHeight = {
  sm: 32,
  md: 40,
  lg: 48,
  xl: 56,
};

export const Screen = {
  width,
  height,
  isSmallDevice: width < 375,
  isLargeDevice: width >= 768,
};

export const Layout = {
  // Container Padding
  containerHorizontal: Spacing.md,
  containerVertical: Spacing.md,

  // Card
  cardPadding: Spacing.md,
  cardRadius: BorderRadius.lg,

  // Header Height
  headerHeight: Platform.select({
    ios: 44,
    android: 56,
    default: 56,
  }),

  // Tab Bar Height
  tabBarHeight: Platform.select({
    ios: 49,
    android: 56,
    default: 56,
  }),

  // Safe Area
  safeAreaTop: Platform.select({
    ios: 44,
    android: 0,
    default: 0,
  }),
};

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
    elevation: 12,
  },
};
