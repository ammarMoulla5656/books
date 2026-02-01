/**
 * HomeScreen
 * الشاشة الرئيسية
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components';
import { Colors, Spacing, FontSize } from '@/constants';
import { useAuthStore } from '@/stores';

export const HomeScreen: React.FC = () => {
  const { user, logout } = useAuthStore();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>
            {user ? `مرحباً، ${user.name}` : 'مرحباً بك'}
          </Text>
          <Text style={styles.subtitle}>📚 المكتبة الإسلامية</Text>
        </View>

        {/* Welcome Card */}
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeIcon}>🎉</Text>
          <Text style={styles.welcomeTitle}>مرحباً بك في المكتبة الإسلامية!</Text>
          <Text style={styles.welcomeText}>
            استكشف آلاف الكتب الإسلامية في مكتبتك الرقمية
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>1000+</Text>
            <Text style={styles.statLabel}>كتاب</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>50+</Text>
            <Text style={styles.statLabel}>تصنيف</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>24/7</Text>
            <Text style={styles.statLabel}>متاح</Text>
          </View>
        </View>

        {/* Features */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>الميزات</Text>

          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>📖</Text>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>قراءة سهلة</Text>
              <Text style={styles.featureDescription}>
                واجهة سهلة الاستخدام للقراءة المريحة
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>⭐</Text>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>المفضلة</Text>
              <Text style={styles.featureDescription}>
                احفظ كتبك المفضلة للوصول السريع
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>📥</Text>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>القراءة بدون إنترنت</Text>
              <Text style={styles.featureDescription}>
                حمّل الكتب واقرأها في أي وقت
              </Text>
            </View>
          </View>
        </View>

        {/* Logout Button (Temporary) */}
        {user && (
          <Button
            title="تسجيل الخروج"
            variant="outline"
            onPress={logout}
            style={styles.logoutButton}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    padding: Spacing.lg,
  },

  // Header
  header: {
    marginBottom: Spacing.xl,
  },
  greeting: {
    fontSize: FontSize['3xl'],
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSize.lg,
    color: Colors.light.textSecondary,
  },

  // Welcome Card
  welcomeCard: {
    backgroundColor: Colors.light.primary,
    borderRadius: 16,
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  welcomeIcon: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  welcomeTitle: {
    fontSize: FontSize.xl,
    fontWeight: 'bold',
    color: Colors.light.background,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: FontSize.md,
    color: Colors.light.background,
    textAlign: 'center',
    opacity: 0.9,
  },

  // Stats
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: Spacing.lg,
    alignItems: 'center',
    marginHorizontal: Spacing.xs,
  },
  statNumber: {
    fontSize: FontSize['3xl'],
    fontWeight: 'bold',
    color: Colors.light.primary,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontSize: FontSize.sm,
    color: Colors.light.textSecondary,
  },

  // Features
  featuresSection: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: FontSize['xl'],
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: Spacing.lg,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  featureIcon: {
    fontSize: 32,
    marginRight: Spacing.md,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  featureDescription: {
    fontSize: FontSize.md,
    color: Colors.light.textSecondary,
    lineHeight: 20,
  },

  // Logout
  logoutButton: {
    marginTop: Spacing.xl,
  },
});
