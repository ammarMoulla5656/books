/**
 * ErrorMessage Component
 * رسالة خطأ مع خيار إعادة المحاولة
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Colors, Spacing, FontSize } from '@/constants';
import { Button } from './Button';

export type ErrorVariant = 'default' | 'inline' | 'card';

export interface ErrorMessageProps {
  /** رسالة الخطأ */
  message: string;
  /** عنوان الخطأ */
  title?: string;
  /** نوع العرض */
  variant?: ErrorVariant;
  /** إظهار زر إعادة المحاولة */
  showRetry?: boolean;
  /** دالة إعادة المحاولة */
  onRetry?: () => void;
  /** نص زر إعادة المحاولة */
  retryText?: string;
  /** أيقونة مخصصة */
  icon?: React.ReactNode;
  /** ملء الشاشة */
  fullScreen?: boolean;
  /** custom container styles */
  containerStyle?: ViewStyle;
  /** custom title styles */
  titleStyle?: TextStyle;
  /** custom message styles */
  messageStyle?: TextStyle;
}

/**
 * ErrorMessage Component
 */
export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  title = 'حدث خطأ',
  variant = 'default',
  showRetry = true,
  onRetry,
  retryText = 'إعادة المحاولة',
  icon,
  fullScreen = false,
  containerStyle,
  titleStyle,
  messageStyle,
}) => {
  const variantStyle = getVariantStyle(variant);

  return (
    <View
      style={[
        styles.container,
        variantStyle,
        fullScreen && styles.fullScreen,
        containerStyle,
      ]}
    >
      {/* Icon */}
      {icon ? (
        <View style={styles.iconContainer}>{icon}</View>
      ) : (
        <Text style={styles.defaultIcon}>⚠️</Text>
      )}

      {/* Title */}
      {title && (
        <Text style={[styles.title, getSizeTitleStyle(variant), titleStyle]}>
          {title}
        </Text>
      )}

      {/* Message */}
      <Text style={[styles.message, getSizeMessageStyle(variant), messageStyle]}>
        {message}
      </Text>

      {/* Retry Button */}
      {showRetry && onRetry && (
        <Button
          title={retryText}
          onPress={onRetry}
          variant="primary"
          size={variant === 'inline' ? 'small' : 'medium'}
          style={styles.retryButton}
        />
      )}
    </View>
  );
};

/**
 * Get variant styles
 */
const getVariantStyle = (variant: ErrorVariant): ViewStyle => {
  switch (variant) {
    case 'default':
      return styles.variantDefault;
    case 'inline':
      return styles.variantInline;
    case 'card':
      return styles.variantCard;
    default:
      return styles.variantDefault;
  }
};

/**
 * Get size title styles
 */
const getSizeTitleStyle = (variant: ErrorVariant): TextStyle => {
  switch (variant) {
    case 'default':
      return styles.titleDefault;
    case 'inline':
      return styles.titleInline;
    case 'card':
      return styles.titleCard;
    default:
      return styles.titleDefault;
  }
};

/**
 * Get size message styles
 */
const getSizeMessageStyle = (variant: ErrorVariant): TextStyle => {
  switch (variant) {
    case 'default':
      return styles.messageDefault;
    case 'inline':
      return styles.messageInline;
    case 'card':
      return styles.messageCard;
    default:
      return styles.messageDefault;
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

  // Variants
  variantDefault: {
    backgroundColor: 'transparent',
  },
  variantInline: {
    backgroundColor: Colors.light.errorBackground,
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.error,
    borderRadius: 8,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  variantCard: {
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.error,
    borderRadius: 12,
    padding: Spacing.xl,
    ...StyleSheet.create({
      shadow: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 3,
      },
    }).shadow,
  },

  // Icon
  iconContainer: {
    marginBottom: Spacing.md,
  },
  defaultIcon: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },

  // Title
  title: {
    fontWeight: 'bold',
    color: Colors.light.error,
    textAlign: 'center',
  },
  titleDefault: {
    fontSize: FontSize.xl,
    marginBottom: Spacing.sm,
  },
  titleInline: {
    fontSize: FontSize.md,
    marginBottom: Spacing.xs,
  },
  titleCard: {
    fontSize: FontSize.lg,
    marginBottom: Spacing.sm,
  },

  // Message
  message: {
    color: Colors.light.text,
    textAlign: 'center',
  },
  messageDefault: {
    fontSize: FontSize.md,
    marginBottom: Spacing.lg,
  },
  messageInline: {
    fontSize: FontSize.sm,
    marginBottom: Spacing.sm,
  },
  messageCard: {
    fontSize: FontSize.md,
    marginBottom: Spacing.md,
  },

  // Retry Button
  retryButton: {
    marginTop: Spacing.md,
    minWidth: 150,
  },
});
