/**
 * Card Component
 * بطاقة عرض قابلة لإعادة الاستخدام
 */

import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native';
import { Colors, Spacing, Shadow } from '@/constants';

export type CardVariant = 'default' | 'elevated' | 'outlined';

export interface CardProps {
  /** محتوى البطاقة */
  children: React.ReactNode;
  /** نوع البطاقة */
  variant?: CardVariant;
  /** قابلة للضغط */
  pressable?: boolean;
  /** دالة عند الضغط */
  onPress?: () => void;
  /** custom styles */
  style?: ViewStyle;
  /** custom container styles */
  containerStyle?: ViewStyle;
  /** TouchableOpacity props */
  touchableProps?: Omit<TouchableOpacityProps, 'style' | 'onPress'>;
}

/**
 * Card Component
 */
export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  pressable = false,
  onPress,
  style,
  containerStyle,
  touchableProps,
}) => {
  const variantStyle = getVariantStyle(variant);

  const cardContent = (
    <View style={[styles.card, variantStyle, containerStyle]}>
      <View style={style}>{children}</View>
    </View>
  );

  if (pressable || onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        {...touchableProps}
      >
        {cardContent}
      </TouchableOpacity>
    );
  }

  return cardContent;
};

/**
 * Card Header Component
 */
export interface CardHeaderProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, style }) => {
  return <View style={[styles.header, style]}>{children}</View>;
};

/**
 * Card Body Component
 */
export interface CardBodyProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const CardBody: React.FC<CardBodyProps> = ({ children, style }) => {
  return <View style={[styles.body, style]}>{children}</View>;
};

/**
 * Card Footer Component
 */
export interface CardFooterProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, style }) => {
  return <View style={[styles.footer, style]}>{children}</View>;
};

/**
 * Get variant styles
 */
const getVariantStyle = (variant: CardVariant): ViewStyle => {
  switch (variant) {
    case 'default':
      return styles.variantDefault;
    case 'elevated':
      return styles.variantElevated;
    case 'outlined':
      return styles.variantOutlined;
    default:
      return styles.variantDefault;
  }
};

const styles = StyleSheet.create({
  // Card
  card: {
    borderRadius: 12,
    overflow: 'hidden',
  },

  // Variants
  variantDefault: {
    backgroundColor: Colors.light.background,
    ...Shadow.sm,
  },
  variantElevated: {
    backgroundColor: Colors.light.background,
    ...Shadow.md,
  },
  variantOutlined: {
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },

  // Card Sections
  header: {
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  body: {
    padding: Spacing.md,
  },
  footer: {
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
});
