/**
 * RegisterScreen
 * شاشة التسجيل
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Input, ErrorMessage, LoadingOverlay } from '@/components';
import { Colors, Spacing, FontSize } from '@/constants';
import { useAuthStore } from '@/stores';
import { isValidEmail, isStrongPassword } from '@/utils/validators';

export const RegisterScreen: React.FC = () => {
  const { isLoading } = useAuthStore();

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Error State
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');

  // UI State
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  /**
   * Validate form
   */
  const validateForm = (): boolean => {
    let isValid = true;

    // Reset errors
    setNameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');
    setGeneralError('');

    // Validate name
    if (!name.trim()) {
      setNameError('الاسم مطلوب');
      isValid = false;
    } else if (name.trim().length < 3) {
      setNameError('الاسم يجب أن يكون 3 أحرف على الأقل');
      isValid = false;
    }

    // Validate email
    if (!email.trim()) {
      setEmailError('البريد الإلكتروني مطلوب');
      isValid = false;
    } else if (!isValidEmail(email)) {
      setEmailError('البريد الإلكتروني غير صحيح');
      isValid = false;
    }

    // Validate password
    if (!password) {
      setPasswordError('كلمة المرور مطلوبة');
      isValid = false;
    } else if (!isStrongPassword(password)) {
      setPasswordError('كلمة المرور يجب أن تحتوي على 8 أحرف، حرف كبير، حرف صغير، ورقم');
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

    // Validate terms
    if (!acceptedTerms) {
      setGeneralError('يرجى الموافقة على الشروط والأحكام');
      isValid = false;
    }

    return isValid;
  };

  /**
   * Handle register
   */
  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      // TODO: Implement register API call
      console.log('Register:', { name: name.trim(), email: email.trim() });
      // await register(name.trim(), email.trim(), password);
    } catch (error: any) {
      setGeneralError(error.message || 'فشل التسجيل. يرجى المحاولة مرة أخرى.');
    }
  };

  /**
   * Handle login navigation
   */
  const handleLogin = () => {
    // TODO: Navigate to LoginScreen
    console.log('Navigate to Login');
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
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.logo}>📚</Text>
            <Text style={styles.title}>إنشاء حساب جديد</Text>
            <Text style={styles.subtitle}>انضم إلى المكتبة الإسلامية</Text>
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

            {/* Name Input */}
            <Input
              label="الاسم الكامل"
              placeholder="أدخل اسمك الكامل"
              value={name}
              onChangeText={(text) => {
                setName(text);
                setNameError('');
                setGeneralError('');
              }}
              error={!!nameError}
              errorText={nameError}
              autoCapitalize="words"
              autoCorrect={false}
              textContentType="name"
              leftIcon={<Text style={styles.inputIcon}>👤</Text>}
            />

            {/* Email Input */}
            <Input
              label="البريد الإلكتروني"
              placeholder="example@email.com"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setEmailError('');
                setGeneralError('');
              }}
              error={!!emailError}
              errorText={emailError}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              textContentType="emailAddress"
              leftIcon={<Text style={styles.inputIcon}>✉️</Text>}
            />

            {/* Password Input */}
            <Input
              label="كلمة المرور"
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

            {/* Terms and Conditions */}
            <TouchableOpacity
              style={styles.termsContainer}
              onPress={() => {
                setAcceptedTerms(!acceptedTerms);
                setGeneralError('');
              }}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.checkbox,
                  acceptedTerms && styles.checkboxChecked,
                ]}
              >
                {acceptedTerms && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.termsText}>
                أوافق على{' '}
                <Text style={styles.termsLink}>الشروط والأحكام</Text> و
                <Text style={styles.termsLink}>سياسة الخصوصية</Text>
              </Text>
            </TouchableOpacity>

            {/* Register Button */}
            <Button
              title="إنشاء الحساب"
              onPress={handleRegister}
              loading={isLoading}
              disabled={isLoading}
              fullWidth
              size="large"
              style={styles.registerButton}
            />

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>أو</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Login Link */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>لديك حساب بالفعل؟ </Text>
              <TouchableOpacity
                onPress={handleLogin}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.loginLink}>تسجيل الدخول</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Loading Overlay */}
      <LoadingOverlay visible={isLoading} message="جاري إنشاء الحساب..." />
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
  },

  // Header
  header: {
    alignItems: 'center',
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  logo: {
    fontSize: 48,
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: FontSize['3xl'],
    fontWeight: 'bold',
    color: Colors.light.primary,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },

  // Form
  form: {
    flex: 1,
    paddingBottom: Spacing.xl,
  },
  errorMessage: {
    marginBottom: Spacing.md,
  },
  inputIcon: {
    fontSize: 20,
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

  // Terms
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: Colors.light.border,
    borderRadius: 4,
    marginRight: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  checkmark: {
    color: Colors.light.background,
    fontSize: 14,
    fontWeight: 'bold',
  },
  termsText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.light.textSecondary,
    lineHeight: 20,
  },
  termsLink: {
    color: Colors.light.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },

  // Register Button
  registerButton: {
    marginTop: Spacing.md,
  },

  // Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.light.border,
  },
  dividerText: {
    marginHorizontal: Spacing.md,
    fontSize: FontSize.sm,
    color: Colors.light.textSecondary,
  },

  // Login
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: FontSize.md,
    color: Colors.light.textSecondary,
  },
  loginLink: {
    fontSize: FontSize.md,
    color: Colors.light.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
