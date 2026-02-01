/**
 * ForgotPasswordScreen
 * شاشة نسيت كلمة المرور
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
import { Button, Input, ErrorMessage, LoadingOverlay, Card, CardBody } from '@/components';
import { Colors, Spacing, FontSize } from '@/constants';
import { isValidEmail } from '@/utils/validators';

type Step = 'email' | 'success';

export const ForgotPasswordScreen: React.FC = () => {
  // State
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Validate email
   */
  const validateEmail = (): boolean => {
    setEmailError('');
    setGeneralError('');

    if (!email.trim()) {
      setEmailError('البريد الإلكتروني مطلوب');
      return false;
    }

    if (!isValidEmail(email)) {
      setEmailError('البريد الإلكتروني غير صحيح');
      return false;
    }

    return true;
  };

  /**
   * Handle send reset email
   */
  const handleSendResetEmail = async () => {
    if (!validateEmail()) {
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Implement forgot password API call
      console.log('Send reset email to:', email.trim());
      // await sendPasswordResetEmail(email.trim());

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setStep('success');
    } catch (error: any) {
      setGeneralError(
        error.message || 'فشل إرسال رابط إعادة التعيين. يرجى المحاولة مرة أخرى.'
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
   * Handle open email
   */
  const handleOpenEmail = () => {
    // TODO: Open default email app
    console.log('Open email app');
  };

  /**
   * Render email step
   */
  const renderEmailStep = () => (
    <>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.icon}>🔐</Text>
        <Text style={styles.title}>نسيت كلمة المرور؟</Text>
        <Text style={styles.subtitle}>
          لا تقلق! أدخل بريدك الإلكتروني وسنرسل لك رابط لإعادة تعيين كلمة المرور
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

        {/* Send Button */}
        <Button
          title="إرسال رابط إعادة التعيين"
          onPress={handleSendResetEmail}
          loading={isLoading}
          disabled={isLoading}
          fullWidth
          size="large"
          style={styles.sendButton}
        />

        {/* Back to Login */}
        <TouchableOpacity
          onPress={handleBackToLogin}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.backText}>← العودة إلى تسجيل الدخول</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  /**
   * Render success step
   */
  const renderSuccessStep = () => (
    <>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.successIcon}>✅</Text>
        <Text style={styles.title}>تحقق من بريدك الإلكتروني</Text>
        <Text style={styles.subtitle}>
          لقد أرسلنا رابط إعادة تعيين كلمة المرور إلى:
        </Text>
        <Text style={styles.emailHighlight}>{email}</Text>
      </View>

      {/* Instructions */}
      <Card variant="outlined" style={styles.instructionsCard}>
        <CardBody>
          <Text style={styles.instructionsTitle}>الخطوات التالية:</Text>
          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>1</Text>
            <Text style={styles.instructionText}>
              افتح بريدك الإلكتروني وابحث عن رسالة من المكتبة الإسلامية
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>2</Text>
            <Text style={styles.instructionText}>
              اضغط على الرابط المرفق في الرسالة
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>3</Text>
            <Text style={styles.instructionText}>
              أدخل كلمة المرور الجديدة
            </Text>
          </View>
        </CardBody>
      </Card>

      {/* Actions */}
      <View style={styles.successActions}>
        <Button
          title="فتح البريد الإلكتروني"
          onPress={handleOpenEmail}
          fullWidth
          size="large"
          style={styles.openEmailButton}
        />

        <Button
          title="العودة إلى تسجيل الدخول"
          onPress={handleBackToLogin}
          variant="outline"
          fullWidth
          size="large"
          style={styles.backToLoginButton}
        />

        {/* Resend Link */}
        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>لم تستلم الرسالة؟ </Text>
          <TouchableOpacity
            onPress={() => setStep('email')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.resendLink}>إعادة الإرسال</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
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
          {step === 'email' ? renderEmailStep() : renderSuccessStep()}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Loading Overlay */}
      <LoadingOverlay
        visible={isLoading}
        message="جاري إرسال رابط إعادة التعيين..."
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
    lineHeight: 22,
    paddingHorizontal: Spacing.md,
  },
  emailHighlight: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.light.primary,
    marginTop: Spacing.sm,
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
  sendButton: {
    marginTop: Spacing.lg,
  },
  backButton: {
    alignSelf: 'center',
    marginTop: Spacing.xl,
    paddingVertical: Spacing.sm,
  },
  backText: {
    fontSize: FontSize.md,
    color: Colors.light.primary,
    fontWeight: '600',
  },

  // Instructions
  instructionsCard: {
    marginVertical: Spacing.lg,
  },
  instructionsTitle: {
    fontSize: FontSize.lg,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: Spacing.md,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  instructionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.light.primary,
    color: Colors.light.background,
    fontSize: FontSize.sm,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 24,
    marginRight: Spacing.sm,
  },
  instructionText: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.light.textSecondary,
    lineHeight: 22,
  },

  // Success Actions
  successActions: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: Spacing.lg,
  },
  openEmailButton: {
    marginBottom: Spacing.md,
  },
  backToLoginButton: {
    marginBottom: Spacing.xl,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendText: {
    fontSize: FontSize.sm,
    color: Colors.light.textSecondary,
  },
  resendLink: {
    fontSize: FontSize.sm,
    color: Colors.light.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
