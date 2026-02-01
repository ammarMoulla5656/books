/**
 * LoadingSpinner Component
 * مؤشر التحميل مع رسالة اختيارية
 */

import React from 'react';
import {
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Colors, Spacing, FontSize } from '@/constants';

export type LoadingSize = 'small' | 'medium' | 'large';

export interface LoadingSpinnerProps {
  /** حجم المؤشر */
  size?: LoadingSize;
  /** رسالة التحميل */
  message?: string;
  /** لون المؤشر */
  color?: string;
  /** ملء الشاشة */
  fullScreen?: boolean;
  /** custom container styles */
  containerStyle?: ViewStyle;
  /** custom text styles */
  textStyle?: TextStyle;
}

/**
 * LoadingSpinner Component
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  message,
  color = Colors.light.primary,
  fullScreen = false,
  containerStyle,
  textStyle,
}) => {
  const spinnerSize = getSpinnerSize(size);

  return (
    <View
      style={[
        styles.container,
        fullScreen && styles.fullScreen,
        containerStyle,
      ]}
    >
      <ActivityIndicator size={spinnerSize} color={color} />
      {message && (
        <Text style={[styles.message, getSizeTextStyle(size), textStyle]}>
          {message}
        </Text>
      )}
    </View>
  );
};

/**
 * Loading Overlay Component
 * طبقة تحميل شفافة تغطي المحتوى
 */
export interface LoadingOverlayProps {
  /** إظهار الطبقة */
  visible: boolean;
  /** رسالة التحميل */
  message?: string;
  /** لون الخلفية */
  backgroundColor?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  message,
  backgroundColor = 'rgba(0, 0, 0, 0.5)',
}) => {
  if (!visible) return null;

  return (
    <View style={[styles.overlay, { backgroundColor }]}>
      <View style={styles.overlayContent}>
        <ActivityIndicator size="large" color={Colors.light.background} />
        {message && <Text style={styles.overlayMessage}>{message}</Text>}
      </View>
    </View>
  );
};

/**
 * Get spinner size
 */
const getSpinnerSize = (size: LoadingSize): 'small' | 'large' => {
  switch (size) {
    case 'small':
      return 'small';
    case 'medium':
    case 'large':
      return 'large';
    default:
      return 'large';
  }
};

/**
 * Get size text styles
 */
const getSizeTextStyle = (size: LoadingSize): TextStyle => {
  switch (size) {
    case 'small':
      return styles.messageSmall;
    case 'medium':
      return styles.messageMedium;
    case 'large':
      return styles.messageLarge;
    default:
      return styles.messageMedium;
  }
};

const styles = StyleSheet.create({
  // Container
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  fullScreen: {
    flex: 1,
    width: '100%',
    height: '100%',
  },

  // Message
  message: {
    marginTop: Spacing.md,
    color: Colors.light.text,
    textAlign: 'center',
  },
  messageSmall: {
    fontSize: FontSize.sm,
  },
  messageMedium: {
    fontSize: FontSize.md,
  },
  messageLarge: {
    fontSize: FontSize.lg,
  },

  // Overlay
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  overlayContent: {
    backgroundColor: Colors.light.primary,
    padding: Spacing.xl,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...StyleSheet.create({
      shadow: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
      },
    }).shadow,
  },
  overlayMessage: {
    marginTop: Spacing.md,
    color: Colors.light.background,
    fontSize: FontSize.md,
    textAlign: 'center',
  },
});
