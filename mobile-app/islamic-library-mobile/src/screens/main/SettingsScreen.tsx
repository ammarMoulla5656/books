/**
 * SettingsScreen
 * شاشة الإعدادات المتقدمة
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import type { MainStackScreenProps } from '@/navigation';
import { useThemeStore } from '@/stores';
import { Card, CardBody } from '@/components';
import { Colors } from '@/constants';

type Props = MainStackScreenProps<'Settings'>;

export const SettingsScreen: React.FC<Props> = () => {
  const navigation = useNavigation();
  const { mode, setTheme } = useThemeStore();

  const [notifications, setNotifications] = useState(true);
  const [autoDownload, setAutoDownload] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);
  const [fontSize, setFontSize] = useState(18);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleThemeToggle = () => {
    setTheme(mode === 'light' ? 'dark' : 'light');
  };

  const handleFontSizeChange = (change: number) => {
    const newSize = fontSize + change;
    if (newSize >= 14 && newSize <= 28) {
      setFontSize(newSize);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.backButtonPressed,
          ]}
          onPress={handleBackPress}
        >
          <Ionicons name="arrow-forward" size={24} color={Colors.light.text} />
        </Pressable>
        <Text style={styles.headerTitle}>الإعدادات</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Appearance */}
        <Card style={styles.section}>
          <CardBody>
            <Text style={styles.sectionTitle}>المظهر</Text>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="moon-outline" size={22} color={Colors.light.primary} />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingLabel}>الوضع الليلي</Text>
                  <Text style={styles.settingDescription}>
                    تفعيل الثيم الداكن
                  </Text>
                </View>
              </View>
              <Switch
                value={mode === 'dark'}
                onValueChange={handleThemeToggle}
                trackColor={{
                  false: Colors.light.border,
                  true: Colors.light.primary,
                }}
                thumbColor={Colors.light.background}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="text-outline" size={22} color={Colors.light.primary} />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingLabel}>حجم الخط</Text>
                  <Text style={styles.settingDescription}>
                    {fontSize}pt - حجم الخط الافتراضي
                  </Text>
                </View>
              </View>
              <View style={styles.fontSizeControls}>
                <Pressable
                  style={({ pressed }) => [
                    styles.fontSizeButton,
                    pressed && styles.fontSizeButtonPressed,
                  ]}
                  onPress={() => handleFontSizeChange(-2)}
                >
                  <Ionicons name="remove" size={18} color={Colors.light.text} />
                </Pressable>
                <Pressable
                  style={({ pressed }) => [
                    styles.fontSizeButton,
                    pressed && styles.fontSizeButtonPressed,
                  ]}
                  onPress={() => handleFontSizeChange(2)}
                >
                  <Ionicons name="add" size={18} color={Colors.light.text} />
                </Pressable>
              </View>
            </View>
          </CardBody>
        </Card>

        {/* Notifications */}
        <Card style={styles.section}>
          <CardBody>
            <Text style={styles.sectionTitle}>الإشعارات</Text>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="notifications-outline" size={22} color={Colors.light.primary} />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingLabel}>الإشعارات</Text>
                  <Text style={styles.settingDescription}>
                    تلقي إشعارات التطبيق
                  </Text>
                </View>
              </View>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{
                  false: Colors.light.border,
                  true: Colors.light.primary,
                }}
                thumbColor={Colors.light.background}
              />
            </View>
          </CardBody>
        </Card>

        {/* Download & Storage */}
        <Card style={styles.section}>
          <CardBody>
            <Text style={styles.sectionTitle}>التحميل والتخزين</Text>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="download-outline" size={22} color={Colors.light.primary} />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingLabel}>التحميل التلقائي</Text>
                  <Text style={styles.settingDescription}>
                    تحميل الكتب تلقائياً عند الإضافة للمفضلة
                  </Text>
                </View>
              </View>
              <Switch
                value={autoDownload}
                onValueChange={setAutoDownload}
                trackColor={{
                  false: Colors.light.border,
                  true: Colors.light.primary,
                }}
                thumbColor={Colors.light.background}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="cloud-offline-outline" size={22} color={Colors.light.primary} />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingLabel}>وضع عدم الاتصال</Text>
                  <Text style={styles.settingDescription}>
                    عرض الكتب المحملة فقط
                  </Text>
                </View>
              </View>
              <Switch
                value={offlineMode}
                onValueChange={setOfflineMode}
                trackColor={{
                  false: Colors.light.border,
                  true: Colors.light.primary,
                }}
                thumbColor={Colors.light.background}
              />
            </View>

            <View style={styles.divider} />

            <Pressable
              style={({ pressed }) => [
                styles.actionRow,
                pressed && styles.actionRowPressed,
              ]}
              onPress={() => console.log('Clear cache')}
            >
              <View style={styles.settingInfo}>
                <Ionicons name="trash-outline" size={22} color={Colors.light.error} />
                <View style={styles.settingTextContainer}>
                  <Text style={[styles.settingLabel, { color: Colors.light.error }]}>
                    مسح الذاكرة المؤقتة
                  </Text>
                  <Text style={styles.settingDescription}>
                    45.2 MB - حذف الملفات المؤقتة
                  </Text>
                </View>
              </View>
              <Ionicons
                name="chevron-back-outline"
                size={20}
                color={Colors.light.textMuted}
              />
            </Pressable>
          </CardBody>
        </Card>

        {/* Language */}
        <Card style={styles.section}>
          <CardBody>
            <Text style={styles.sectionTitle}>اللغة</Text>

            <Pressable
              style={({ pressed }) => [
                styles.actionRow,
                pressed && styles.actionRowPressed,
              ]}
              onPress={() => console.log('Change language')}
            >
              <View style={styles.settingInfo}>
                <Ionicons name="language-outline" size={22} color={Colors.light.primary} />
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingLabel}>لغة التطبيق</Text>
                  <Text style={styles.settingDescription}>
                    العربية
                  </Text>
                </View>
              </View>
              <Ionicons
                name="chevron-back-outline"
                size={20}
                color={Colors.light.textMuted}
              />
            </Pressable>
          </CardBody>
        </Card>

        {/* About */}
        <Card style={styles.section}>
          <CardBody>
            <Text style={styles.sectionTitle}>حول</Text>

            <Pressable
              style={({ pressed }) => [
                styles.actionRow,
                pressed && styles.actionRowPressed,
              ]}
              onPress={() => console.log('Privacy policy')}
            >
              <View style={styles.settingInfo}>
                <Ionicons name="shield-checkmark-outline" size={22} color={Colors.light.primary} />
                <Text style={styles.settingLabel}>سياسة الخصوصية</Text>
              </View>
              <Ionicons
                name="chevron-back-outline"
                size={20}
                color={Colors.light.textMuted}
              />
            </Pressable>

            <View style={styles.divider} />

            <Pressable
              style={({ pressed }) => [
                styles.actionRow,
                pressed && styles.actionRowPressed,
              ]}
              onPress={() => console.log('Terms')}
            >
              <View style={styles.settingInfo}>
                <Ionicons name="document-text-outline" size={22} color={Colors.light.primary} />
                <Text style={styles.settingLabel}>شروط الاستخدام</Text>
              </View>
              <Ionicons
                name="chevron-back-outline"
                size={20}
                color={Colors.light.textMuted}
              />
            </Pressable>

            <View style={styles.divider} />

            <View style={styles.versionRow}>
              <Text style={styles.versionLabel}>إصدار التطبيق</Text>
              <Text style={styles.versionValue}>1.0.0</Text>
            </View>
          </CardBody>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonPressed: {
    opacity: 0.7,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
  },
  headerPlaceholder: {
    width: 40,
  },

  // Scroll Content
  scrollContent: {
    padding: 20,
  },

  // Section
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 16,
  },

  // Setting Row
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.light.text,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
    color: Colors.light.textSecondary,
  },

  // Font Size Controls
  fontSizeControls: {
    flexDirection: 'row',
    gap: 8,
  },
  fontSizeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fontSizeButtonPressed: {
    opacity: 0.7,
  },

  // Action Row
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  actionRowPressed: {
    opacity: 0.7,
  },

  // Version Row
  versionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  versionLabel: {
    fontSize: 15,
    color: Colors.light.textSecondary,
  },
  versionValue: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.light.text,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: Colors.light.border,
    marginVertical: 12,
  },
});
