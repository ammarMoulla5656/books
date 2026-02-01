/**
 * Button Component
 * زر قابل لإعادة الاستخدام مع variants و sizes مختلفة
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from 'react-native';
import { Colors, Spacing, FontSize } from '@/constants';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  /** نص الزر */
  title: string;
  /** نوع الزر */
  variant?: ButtonVariant;
  /** حجم الزر */
  size?: ButtonSize;
  /** حالة التحميل */
  loading?: boolean;
  /** تعطيل الزر */
  disabled?: boolean;
  /** أيقونة يسار النص */
  leftIcon?: React.ReactNode;
  /** أيقونة يمين النص */
  rightIcon?: React.ReactNode;
  /** عرض كامل */
  fullWidth?: boolean;
  /** custom styles */
  style?: ViewStyle;
  /** custom text styles */
  textStyle?: TextStyle;
}

/**
 * Button Component
 */
export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  style,
  textStyle,
  onPress,
  ...props
}) => {
  const isDisabled = disabled || loading;

  // Get variant styles
  const variantStyle = getVariantStyle(variant, isDisabled);
  const variantTextStyle = getVariantTextStyle(variant, isDisabled);

  // Get size styles
  const sizeStyle = getSizeStyle(size);
  const sizeTextStyle = getSizeTextStyle(size);

  return (
    <TouchableOpacity
      style={[
        styles.button,
        variantStyle,
        sizeStyle,
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' || variant === 'ghost' ? Colors.light.primary : Colors.light.background}
          size={size === 'small' ? 'small' : 'large'}
        />
      ) : (
        <>
          {leftIcon && <>{leftIcon}</>}
          <Text
            style={[
              styles.text,
              variantTextStyle,
              sizeTextStyle,
              (leftIcon || rightIcon) && styles.textWithIcon,
              textStyle,
            ]}
          >
            {title}
          </Text>
          {rightIcon && <>{rightIcon}</>}
        </>
      )}
    </TouchableOpacity>
  );
};

/**
 * Get variant styles
 */
const getVariantStyle = (variant: ButtonVariant, disabled: boolean): ViewStyle => {
  if (disabled) {
    return styles.variantDisabled;
  }

  switch (variant) {
    case 'primary':
      return styles.variantPrimary;
    case 'secondary':
      return styles.variantSecondary;
    case 'outline':
      return styles.variantOutline;
    case 'ghost':
      return styles.variantGhost;
    case 'danger':
      return styles.variantDanger;
    default:
      return styles.variantPrimary;
  }
};

/**
 * Get variant text styles
 */
const getVariantTextStyle = (variant: ButtonVariant, disabled: boolean): TextStyle => {
  if (disabled) {
    return styles.textDisabled;
  }

  switch (variant) {
    case 'primary':
      return styles.textPrimary;
    case 'secondary':
      return styles.textSecondary;
    case 'outline':
      return styles.textOutline;
    case 'ghost':
      return styles.textGhost;
    case 'danger':
      return styles.textDanger;
    default:
      return styles.textPrimary;
  }
};

/**
 * Get size styles
 */
const getSizeStyle = (size: ButtonSize): ViewStyle => {
  switch (size) {
    case 'small':
      return styles.sizeSmall;
    case 'medium':
      return styles.sizeMedium;
    case 'large':
      return styles.sizeLarge;
    default:
      return styles.sizeMedium;
  }
};

/**
 * Get size text styles
 */
const getSizeTextStyle = (size: ButtonSize): TextStyle => {
  switch (size) {
    case 'small':
      return styles.textSmall;
    case 'medium':
      return styles.textMedium;
    case 'large':
      return styles.textLarge;
    default:
      return styles.textMedium;
  }
};

const styles = StyleSheet.create({
  // Base styles
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingHorizontal: Spacing.lg,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  textWithIcon: {
    marginHorizontal: Spacing.xs,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },

  // Variant styles
  variantPrimary: {
    backgroundColor: Colors.light.primary,
  },
  variantSecondary: {
    backgroundColor: Colors.light.secondary,
  },
  variantOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.light.primary,
  },
  variantGhost: {
    backgroundColor: 'transparent',
  },
  variantDanger: {
    backgroundColor: Colors.light.error,
  },
  variantDisabled: {
    backgroundColor: Colors.light.border,
  },

  // Variant text styles
  textPrimary: {
    color: Colors.light.background,
  },
  textSecondary: {
    color: Colors.light.background,
  },
  textOutline: {
    color: Colors.light.primary,
  },
  textGhost: {
    color: Colors.light.primary,
  },
  textDanger: {
    color: Colors.light.background,
  },
  textDisabled: {
    color: Colors.light.textMuted,
  },

  // Size styles
  sizeSmall: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    minHeight: 32,
  },
  sizeMedium: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    minHeight: 44,
  },
  sizeLarge: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    minHeight: 52,
  },

  // Size text styles
  textSmall: {
    fontSize: FontSize.sm,
  },
  textMedium: {
    fontSize: FontSize.md,
  },
  textLarge: {
    fontSize: FontSize.lg,
  },
});
