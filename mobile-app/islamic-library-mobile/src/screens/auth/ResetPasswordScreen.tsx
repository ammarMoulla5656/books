/**
 * ResetPasswordScreen
 * شاشة إعادة تعيين كلمة المرور
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Input, ErrorMessage, LoadingOverlay, LoadingSpinner } from '@/components';
import { Colors, Spacing, FontSize } from '@/constants';
import { isStrongPassword } from '@/utils/validators';

interface ResetPasswordScreenProps {
  // Token من URL/deep link
  token?: string;
}

type Step = 'loading' | 'form' | 'success' | 'error';

export const ResetPasswordScreen: React.FC<ResetPasswordScreenProps> = ({
  token,
}) => {
  // State
  const [step, setStep] = useState<Step>('loading');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);

  /**
   * Validate token on mount
   */
  useEffect(() => {
    validateToken();
  }, [token]);

  /**
   * Validate reset token
   */
  const validateToken = async () => {
    setStep('loading');

    try {
      // TODO: Implement token validation API call
      console.log('Validating token:', token);
      // await validateResetToken(token);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setTokenValid(true);
      setStep('form');
    } catch (error: any) {
      setGeneralError(
        error.message ||
          'رابط إعادة التعيين غير صالح أو منتهي الصلاحية'
      );
      setStep('error');
    }
  };

  /**
   * Validate form
   */
  const validateForm = (): boolean => {
    let isValid = true;

    // Reset errors
    setPasswordError('');
    setConfirmPasswordError('');
    setGeneralError('');

    // Validate password
    if (!password) {
      setPasswordError('كلمة المرور مطلوبة');
      isValid = false;
    } else if (!isStrongPassword(password)) {
      setPasswordError(
        'كلمة المرور يجب أن تحتوي على 8 أحرف، حرف كبير، حرف صغير، ورقم'
      );
      isValid = false;
    }

    // Validate confirm password
    if (!confirmPassword) {
      setConfirmPasswordError('تأكيد كلمة المرور مطلوب');
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('كلمات المرور غير متطابقة');
      isValid = false;
    }

    return isValid;
  };

  /**
   * Handle reset password
   */
  const handleResetPassword = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Implement reset password API call
      console.log('Reset password with token:', token);
      // await resetPassword(token, password);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setStep('success');
    } catch (error: any) {
      setGeneralError(
        error.message || 'فشل إعادة تعيين كلمة المرور. يرجى المحاولة مرة أخرى.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle back to login
   */
  const handleBackToLogin = () => {
    // TODO: Navigate to LoginScreen
    console.log('Navigate to Login');
  };

  /**
   * Handle request new link
   */
  const handleRequestNewLink = () => {
    // TODO: Navigate to ForgotPasswordScreen
    console.log('Navigate to ForgotPassword');
  };

  /**
   * Calculate password strength
   */
  const getPasswordStrength = (): {
    strength: number;
    label: string;
    color: string;
  } => {
    if (!password) {
      return { strength: 0, label: '', color: Colors.light.border };
    }

    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 15;
    if (/[a-z]/.test(password)) strength += 20;
    if (/[A-Z]/.test(password)) strength += 20;
    if (/[0-9]/.test(password)) strength += 20;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 20;

    let label = '';
    let color = Colors.light.border;

    if (strength < 40) {
      label = 'ضعيفة';
      color = Colors.light.error;
    } else if (strength < 70) {
      label = 'متوسطة';
      color = '#FFA500';
    } else {
      label = 'قوية';
      color = Colors.light.success;
    }

    return { strength, label, color };
  };

  const passwordStrength = getPasswordStrength();

  /**
   * Render loading step
   */
  const renderLoadingStep = () => (
    <View style={styles.centeredContent}>
      <LoadingSpinner
        size="large"
        message="جاري التحقق من صلاحية الرابط..."
      />
    </View>
  );

  /**
   * Render form step
   */
  const renderFormStep = () => (
    <>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.icon}>🔑</Text>
        <Text style={styles.title}>إعادة تعيين كلمة المرور</Text>
        <Text style={styles.subtitle}>
          أدخل كلمة المرور الجديدة لحسابك
        </Text>
      </View>

      {/* Form */}
      <View style={styles.form}>
        {/* General Error */}
        {generalError && (
          <ErrorMessage
            variant="inline"
            message={generalError}
            showRetry={false}
            containerStyle={styles.errorMessage}
          />
        )}

        {/* Password Input */}
        <Input
          label="كلمة المرور الجديدة"
          placeholder="********"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setPasswordError('');
            setGeneralError('');
          }}
          error={!!passwordError}
          errorText={passwordError}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="newPassword"
          leftIcon={<Text style={styles.inputIcon}>🔒</Text>}
        />

        {/* Password Strength Indicator */}
        {password && (
          <View style={styles.passwordStrengthContainer}>
            <View style={styles.passwordStrengthBar}>
              <View
                style={[
                  styles.passwordStrengthFill,
                  {
                    width: `${passwordStrength.strength}%`,
                    backgroundColor: passwordStrength.color,
                  },
                ]}
              />
            </View>
            <Text
              style={[
                styles.passwordStrengthText,
                { color: passwordStrength.color },
              ]}
            >
              {passwordStrength.label}
            </Text>
          </View>
        )}

        {/* Confirm Password Input */}
        <Input
          label="تأكيد كلمة المرور"
          placeholder="********"
          value={confirmPassword}
          onChangeText={(text) => {
            setConfirmPassword(text);
            setConfirmPasswordError('');
            setGeneralError('');
          }}
          error={!!confirmPasswordError}
          errorText={confirmPasswordError}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="newPassword"
          leftIcon={<Text style={styles.inputIcon}>🔒</Text>}
        />

        {/* Reset Button */}
        <Button
          title="تعيين كلمة المرور الجديدة"
          onPress={handleResetPassword}
          loading={isLoading}
          disabled={isLoading}
          fullWidth
          size="large"
          style={styles.resetButton}
        />
      </View>
    </>
  );

  /**
   * Render success step
   */
  const renderSuccessStep = () => (
    <View style={styles.centeredContent}>
      <Text style={styles.successIcon}>✅</Text>
      <Text style={styles.title}>تم بنجاح!</Text>
      <Text style={styles.successMessage}>
        تم إعادة تعيين كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول باستخدام
        كلمة المرور الجديدة.
      </Text>

      <Button
        title="تسجيل الدخول"
        onPress={handleBackToLogin}
        fullWidth
        size="large"
        style={styles.loginButton}
      />
    </View>
  );

  /**
   * Render error step
   */
  const renderErrorStep = () => (
    <View style={styles.centeredContent}>
      <ErrorMessage
        title="رابط غير صالح"
        message={
          generalError ||
          'رابط إعادة التعيين غير صالح أو منتهي الصلاحية. يرجى طلب رابط جديد.'
        }
        icon={<Text style={styles.errorIcon}>❌</Text>}
        showRetry={false}
        fullScreen={false}
      />

      <Button
        title="طلب رابط جديد"
        onPress={handleRequestNewLink}
        fullWidth
        size="large"
        style={styles.requestButton}
      />

      <Button
        title="العودة إلى تسجيل الدخول"
        onPress={handleBackToLogin}
        variant="outline"
        fullWidth
        size="large"
        style={styles.backButton}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {step === 'loading' && renderLoadingStep()}
          {step === 'form' && renderFormStep()}
          {step === 'success' && renderSuccessStep()}
          {step === 'error' && renderErrorStep()}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Loading Overlay */}
      <LoadingOverlay
        visible={isLoading}
        message="جاري إعادة تعيين كلمة المرور..."
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  centeredContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },

  // Header
  header: {
    alignItems: 'center',
    paddingBottom: Spacing.xl,
  },
  icon: {
    fontSize: 64,
    marginBottom: Spacing.md,
  },
  successIcon: {
    fontSize: 80,
    marginBottom: Spacing.md,
  },
  errorIcon: {
    fontSize: 64,
  },
  title: {
    fontSize: FontSize['3xl'],
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    paddingHorizontal: Spacing.md,
  },

  // Form
  form: {
    flex: 1,
  },
  errorMessage: {
    marginBottom: Spacing.md,
  },
  inputIcon: {
    fontSize: 20,
  },
  resetButton: {
    marginTop: Spacing.lg,
  },

  // Password Strength
  passwordStrengthContainer: {
    marginTop: -Spacing.xs,
    marginBottom: Spacing.md,
  },
  passwordStrengthBar: {
    height: 4,
    backgroundColor: Colors.light.border,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: Spacing.xs,
  },
  passwordStrengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  passwordStrengthText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },

  // Success
  successMessage: {
    fontSize: FontSize.md,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  loginButton: {
    width: '100%',
  },

  // Error
  requestButton: {
    width: '100%',
    marginTop: Spacing.xl,
  },
  backButton: {
    width: '100%',
    marginTop: Spacing.md,
  },
});
