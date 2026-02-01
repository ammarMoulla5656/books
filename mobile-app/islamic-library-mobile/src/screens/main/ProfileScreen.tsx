/**
 * ProfileScreen
 * شاشة الملف الشخصي
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, CardBody } from '@/components';
import { Colors, Spacing, FontSize } from '@/constants';
import { useAuthStore, useThemeStore } from '@/stores';

export const ProfileScreen: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { mode, setTheme } = useThemeStore();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0).toUpperCase() || '👤'}
            </Text>
          </View>
          <Text style={styles.name}>{user?.name || 'ضيف'}</Text>
          <Text style={styles.email}>{user?.email || 'غير مسجل'}</Text>
        </View>

        {/* Stats */}
        {user && (
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>كتاب مقروء</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>المفضلة</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>التنزيلات</Text>
            </View>
          </View>
        )}

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>الإعدادات</Text>

          <Card variant="outlined" style={styles.settingsCard}>
            <CardBody>
              {/* Theme */}
              <TouchableOpacity
                style={styles.settingItem}
                onPress={() => setTheme(mode === 'light' ? 'dark' : 'light')}
              >
                <View style={styles.settingLeft}>
                  <Text style={styles.settingIcon}>🌙</Text>
                  <Text style={styles.settingText}>الوضع الداكن</Text>
                </View>
                <Text style={styles.settingValue}>
                  {mode === 'dark' ? 'مفعّل' : 'معطّل'}
                </Text>
              </TouchableOpacity>

              <View style={styles.settingDivider} />

              {/* Notifications */}
              <TouchableOpacity style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <Text style={styles.settingIcon}>🔔</Text>
                  <Text style={styles.settingText}>الإشعارات</Text>
                </View>
                <Text style={styles.settingValue}>مفعّلة</Text>
              </TouchableOpacity>

              <View style={styles.settingDivider} />

              {/* Font Size */}
              <TouchableOpacity style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <Text style={styles.settingIcon}>📝</Text>
                  <Text style={styles.settingText}>حجم الخط</Text>
                </View>
                <Text style={styles.settingValue}>متوسط</Text>
              </TouchableOpacity>

              <View style={styles.settingDivider} />

              {/* Language */}
              <TouchableOpacity style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <Text style={styles.settingIcon}>🌐</Text>
                  <Text style={styles.settingText}>اللغة</Text>
                </View>
                <Text style={styles.settingValue}>العربية</Text>
              </TouchableOpacity>
            </CardBody>
          </Card>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>حول</Text>

          <Card variant="outlined" style={styles.settingsCard}>
            <CardBody>
              <TouchableOpacity style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <Text style={styles.settingIcon}>📄</Text>
                  <Text style={styles.settingText}>الشروط والأحكام</Text>
                </View>
                <Text style={styles.settingValue}>→</Text>
              </TouchableOpacity>

              <View style={styles.settingDivider} />

              <TouchableOpacity style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <Text style={styles.settingIcon}>🔒</Text>
                  <Text style={styles.settingText}>سياسة الخصوصية</Text>
                </View>
                <Text style={styles.settingValue}>→</Text>
              </TouchableOpacity>

              <View style={styles.settingDivider} />

              <TouchableOpacity style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <Text style={styles.settingIcon}>ℹ️</Text>
                  <Text style={styles.settingText}>عن التطبيق</Text>
                </View>
                <Text style={styles.settingValue}>v1.0.0</Text>
              </TouchableOpacity>
            </CardBody>
          </Card>
        </View>

        {/* Logout Button */}
        {user && (
          <Button
            title="تسجيل الخروج"
            variant="danger"
            onPress={logout}
            fullWidth
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
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  avatarText: {
    fontSize: FontSize['4xl'],
    color: Colors.light.background,
    fontWeight: 'bold',
  },
  name: {
    fontSize: FontSize['xl'],
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  email: {
    fontSize: FontSize.md,
    color: Colors.light.textSecondary,
  },

  // Stats
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: FontSize['3xl'],
    fontWeight: 'bold',
    color: Colors.light.primary,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontSize: FontSize.sm,
    color: Colors.light.textSecondary,
  },
  divider: {
    width: 1,
    backgroundColor: Colors.light.border,
    marginHorizontal: Spacing.md,
  },

  // Section
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: Spacing.md,
  },
  settingsCard: {
    overflow: 'hidden',
  },

  // Settings Item
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  settingText: {
    fontSize: FontSize.md,
    color: Colors.light.text,
  },
  settingValue: {
    fontSize: FontSize.md,
    color: Colors.light.textSecondary,
  },
  settingDivider: {
    height: 1,
    backgroundColor: Colors.light.border,
  },

  // Logout
  logoutButton: {
    marginTop: Spacing.lg,
  },
});
