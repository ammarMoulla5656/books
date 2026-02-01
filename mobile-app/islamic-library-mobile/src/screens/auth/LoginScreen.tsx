/**
 * LoginScreen
 * شاشة تسجيل الدخول
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
import { isValidEmail } from '@/utils/validators';

export const LoginScreen: React.FC = () => {
  const { login, error: authError, isLoading } = useAuthStore();

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');

  /**
   * Validate form
   */
  const validateForm = (): boolean => {
    let isValid = true;

    // Reset errors
    setEmailError('');
    setPasswordError('');
    setGeneralError('');

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
    } else if (password.length < 6) {
      setPasswordError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      isValid = false;
    }

    return isValid;
  };

  /**
   * Handle login
   */
  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await login(email.trim(), password);
      // Navigation will be handled by the navigation system
    } catch (error: any) {
      setGeneralError(error.message || 'فشل تسجيل الدخول. يرجى المحاولة مرة أخرى.');
    }
  };

  /**
   * Handle forgot password
   */
  const handleForgotPassword = () => {
    // TODO: Navigate to ForgotPasswordScreen
    console.log('Navigate to ForgotPassword');
  };

  /**
   * Handle register
   */
  const handleRegister = () => {
    // TODO: Navigate to RegisterScreen
    console.log('Navigate to Register');
  };

  /**
   * Handle guest access
   */
  const handleGuestAccess = async () => {
    console.log('Continue as guest');
    try {
      // Create a mock guest user
      const guestUser = {
        id: 'guest-user',
        email: 'guest@islamiclibrary.app',
        name: 'مستخدم ضيف',
        role: 'user' as const,
        isEmailVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Manually set the user in the store without API call
      useAuthStore.setState({
        user: guestUser,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Guest access error:', error);
    }
  };

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
            <Text style={styles.title}>المكتبة الإسلامية</Text>
            <Text style={styles.subtitle}>مكتبتك الإسلامية في جيبك</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Text style={styles.formTitle}>تسجيل الدخول</Text>

            {/* General Error */}
            {generalError && (
              <ErrorMessage
                variant="inline"
                message={generalError}
                showRetry={false}
                containerStyle={styles.errorMessage}
              />
            )}

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
              autoComplete="password"
              textContentType="password"
              leftIcon={<Text style={styles.inputIcon}>🔒</Text>}
            />

            {/* Forgot Password */}
            <TouchableOpacity
              onPress={handleForgotPassword}
              style={styles.forgotPasswordButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.forgotPasswordText}>
                نسيت كلمة المرور؟
              </Text>
            </TouchableOpacity>

            {/* Login Button */}
            <Button
              title="تسجيل الدخول"
              onPress={handleLogin}
              loading={isLoading}
              disabled={isLoading}
              fullWidth
              size="large"
              style={styles.loginButton}
            />

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>أو</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Register Link */}
            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>ليس لديك حساب؟ </Text>
              <TouchableOpacity
                onPress={handleRegister}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.registerLink}>سجل الآن</Text>
              </TouchableOpacity>
            </View>

            {/* Guest Access */}
            <Button
              title="المتابعة كضيف"
              variant="ghost"
              onPress={handleGuestAccess}
              style={styles.guestButton}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Loading Overlay */}
      <LoadingOverlay visible={isLoading} message="جاري تسجيل الدخول..." />
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
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xl,
  },
  logo: {
    fontSize: 64,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize['4xl'],
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
  formTitle: {
    fontSize: FontSize['3xl'],
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  errorMessage: {
    marginBottom: Spacing.md,
  },
  inputIcon: {
    fontSize: 20,
  },

  // Forgot Password
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginTop: -Spacing.xs,
    marginBottom: Spacing.lg,
  },
  forgotPasswordText: {
    fontSize: FontSize.sm,
    color: Colors.light.primary,
    textDecorationLine: 'underline',
  },

  // Login Button
  loginButton: {
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

  // Register
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  registerText: {
    fontSize: FontSize.md,
    color: Colors.light.textSecondary,
  },
  registerLink: {
    fontSize: FontSize.md,
    color: Colors.light.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },

  // Guest Button
  guestButton: {
    marginTop: Spacing.sm,
  },
});
