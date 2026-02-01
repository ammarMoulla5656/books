/**
 * Input Component
 * حقل إدخال قابل لإعادة الاستخدام مع دعم التحقق والأيقونات
 */

import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import { Colors, Spacing, FontSize } from '@/constants';

export interface InputProps extends TextInputProps {
  /** تسمية الحقل */
  label?: string;
  /** نص المساعدة */
  helperText?: string;
  /** رسالة الخطأ */
  errorText?: string;
  /** أيقونة يسار النص */
  leftIcon?: React.ReactNode;
  /** أيقونة يمين النص */
  rightIcon?: React.ReactNode;
  /** إظهار/إخفاء النص (للـ password) */
  secureTextEntry?: boolean;
  /** عرض كامل */
  fullWidth?: boolean;
  /** حالة الخطأ */
  error?: boolean;
  /** تعطيل الحقل */
  disabled?: boolean;
  /** عدد الأسطر (للـ multiline) */
  numberOfLines?: number;
  /** custom container styles */
  containerStyle?: ViewStyle;
  /** custom input styles */
  inputStyle?: TextStyle;
  /** custom label styles */
  labelStyle?: TextStyle;
}

/**
 * Input Component
 */
export const Input: React.FC<InputProps> = ({
  label,
  helperText,
  errorText,
  leftIcon,
  rightIcon,
  secureTextEntry = false,
  fullWidth = true,
  error = false,
  disabled = false,
  numberOfLines = 1,
  containerStyle,
  inputStyle,
  labelStyle,
  value,
  onChangeText,
  placeholder,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const hasError = error || !!errorText;
  const isMultiline = numberOfLines > 1;

  return (
    <View style={[styles.container, fullWidth && styles.fullWidth, containerStyle]}>
      {/* Label */}
      {label && (
        <Text style={[styles.label, hasError && styles.labelError, labelStyle]}>
          {label}
        </Text>
      )}

      {/* Input Container */}
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
          hasError && styles.inputContainerError,
          disabled && styles.inputContainerDisabled,
          isMultiline && styles.inputContainerMultiline,
        ]}
      >
        {/* Left Icon */}
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

        {/* Text Input */}
        <TextInput
          style={[
            styles.input,
            leftIcon && styles.inputWithLeftIcon,
            rightIcon && styles.inputWithRightIcon,
            isMultiline && styles.inputMultiline,
            disabled && styles.inputDisabled,
            inputStyle,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.light.textMuted}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          editable={!disabled}
          secureTextEntry={secureTextEntry && !showPassword}
          multiline={isMultiline}
          numberOfLines={numberOfLines}
          textAlignVertical={isMultiline ? 'top' : 'center'}
          {...props}
        />

        {/* Right Icon or Password Toggle */}
        {secureTextEntry ? (
          <TouchableOpacity
            style={styles.rightIcon}
            onPress={() => setShowPassword(!showPassword)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.passwordToggle}>
              {showPassword ? '🙈' : '👁️'}
            </Text>
          </TouchableOpacity>
        ) : rightIcon ? (
          <View style={styles.rightIcon}>{rightIcon}</View>
        ) : null}
      </View>

      {/* Helper Text or Error Text */}
      {hasError && errorText ? (
        <Text style={styles.errorText}>{errorText}</Text>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  // Container
  container: {
    marginBottom: Spacing.md,
  },
  fullWidth: {
    width: '100%',
  },

  // Label
  label: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  labelError: {
    color: Colors.light.error,
  },

  // Input Container
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 8,
    paddingHorizontal: Spacing.md,
    minHeight: 44,
  },
  inputContainerFocused: {
    borderColor: Colors.light.primary,
    borderWidth: 2,
  },
  inputContainerError: {
    borderColor: Colors.light.error,
  },
  inputContainerDisabled: {
    backgroundColor: Colors.light.backgroundSecondary,
    borderColor: Colors.light.border,
  },
  inputContainerMultiline: {
    minHeight: 100,
    paddingVertical: Spacing.sm,
  },

  // Input
  input: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.light.text,
    paddingVertical: Spacing.sm,
  },
  inputWithLeftIcon: {
    marginLeft: Spacing.xs,
  },
  inputWithRightIcon: {
    marginRight: Spacing.xs,
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  inputDisabled: {
    color: Colors.light.textMuted,
  },

  // Icons
  leftIcon: {
    marginRight: Spacing.xs,
  },
  rightIcon: {
    marginLeft: Spacing.xs,
  },
  passwordToggle: {
    fontSize: 20,
  },

  // Helper & Error Text
  helperText: {
    fontSize: FontSize.sm,
    color: Colors.light.textSecondary,
    marginTop: Spacing.xs,
  },
  errorText: {
    fontSize: FontSize.sm,
    color: Colors.light.error,
    marginTop: Spacing.xs,
  },
});
