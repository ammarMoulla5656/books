/**
 * StatisticsScreen
 * شاشة إحصائيات القراءة
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants';
import { useBookStore } from '@/stores';
import { Card, CardBody } from '@/components';

export const StatisticsScreen: React.FC = () => {
  const navigation = useNavigation();

  const {
    books,
    favorites,
    downloaded,
    getTotalReadingTime,
    readingHistory,
  } = useBookStore();

  // Calculate statistics
  const totalBooks = books.length;
  const favoritesCount = favorites.length;
  const downloadedCount = downloaded.length;
  const totalReadingSeconds = getTotalReadingTime();
  const totalReadingMinutes = Math.floor(totalReadingSeconds / 60);
  const totalReadingHours = Math.floor(totalReadingMinutes / 60);

  // Books in progress
  const booksInProgress = books.filter(
    (book) => book.progress && book.progress > 0 && book.progress < 100
  ).length;

  // Completed books
  const completedBooks = books.filter(
    (book) => book.progress === 100
  ).length;

  // Reading days
  const uniqueDays = new Set(
    readingHistory.map((entry) =>
      new Date(entry.timestamp).toDateString()
    )
  ).size;

  // Average progress
  const averageProgress = books.length > 0
    ? Math.round(
        books.reduce((sum, book) => sum + (book.progress || 0), 0) /
          books.length
      )
    : 0;

  // Most read category
  const categoryCount = books.reduce((acc, book) => {
    acc[book.category] = (acc[book.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const mostReadCategory = Object.entries(categoryCount).sort(
    (a, b) => b[1] - a[1]
  )[0]?.[0] || 'لا يوجد';

  const handleBackPress = () => {
    navigation.goBack();
  };

  const formatReadingTime = () => {
    if (totalReadingHours > 0) {
      return `${totalReadingHours} ساعة و ${totalReadingMinutes % 60} دقيقة`;
    }
    return `${totalReadingMinutes} دقيقة`;
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
        <Text style={styles.headerTitle}>إحصائيات القراءة</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary Card */}
        <Card style={styles.summaryCard}>
          <CardBody>
            <View style={styles.summaryHeader}>
              <Ionicons
                name="stats-chart"
                size={32}
                color={Colors.light.primary}
              />
              <Text style={styles.summaryTitle}>ملخص القراءة</Text>
            </View>
            <Text style={styles.summarySubtitle}>
              إحصائيات شاملة عن نشاطك في القراءة
            </Text>
          </CardBody>
        </Card>

        {/* Main Stats Grid */}
        <View style={styles.statsGrid}>
          {/* Total Books */}
          <View style={[styles.statCard, { backgroundColor: '#E3F2FD' }]}>
            <Ionicons name="library" size={32} color="#1976D2" />
            <Text style={styles.statValue}>{totalBooks}</Text>
            <Text style={styles.statLabel}>إجمالي الكتب</Text>
          </View>

          {/* Reading Time */}
          <View style={[styles.statCard, { backgroundColor: '#F3E5F5' }]}>
            <Ionicons name="time" size={32} color="#7B1FA2" />
            <Text style={styles.statValue}>{totalReadingHours}س</Text>
            <Text style={styles.statLabel}>وقت القراءة</Text>
          </View>

          {/* Completed */}
          <View style={[styles.statCard, { backgroundColor: '#E8F5E9' }]}>
            <Ionicons name="checkmark-circle" size={32} color="#388E3C" />
            <Text style={styles.statValue}>{completedBooks}</Text>
            <Text style={styles.statLabel}>كتب مكتملة</Text>
          </View>

          {/* In Progress */}
          <View style={[styles.statCard, { backgroundColor: '#FFF3E0' }]}>
            <Ionicons name="book" size={32} color="#F57C00" />
            <Text style={styles.statValue}>{booksInProgress}</Text>
            <Text style={styles.statLabel}>قيد القراءة</Text>
          </View>
        </View>

        {/* Detailed Stats */}
        <Card style={styles.section}>
          <CardBody>
            <Text style={styles.sectionTitle}>إحصائيات تفصيلية</Text>

            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Ionicons name="heart" size={20} color={Colors.light.error} />
              </View>
              <Text style={styles.detailLabel}>المفضلة</Text>
              <Text style={styles.detailValue}>{favoritesCount} كتاب</Text>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Ionicons name="download" size={20} color={Colors.light.success} />
              </View>
              <Text style={styles.detailLabel}>التحميلات</Text>
              <Text style={styles.detailValue}>{downloadedCount} كتاب</Text>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Ionicons name="calendar" size={20} color={Colors.light.primary} />
              </View>
              <Text style={styles.detailLabel}>أيام القراءة</Text>
              <Text style={styles.detailValue}>{uniqueDays} يوم</Text>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Ionicons name="trending-up" size={20} color="#FFA000" />
              </View>
              <Text style={styles.detailLabel}>متوسط التقدم</Text>
              <Text style={styles.detailValue}>{averageProgress}%</Text>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailIcon}>
                <Ionicons name="pricetag" size={20} color="#7B1FA2" />
              </View>
              <Text style={styles.detailLabel}>التصنيف الأكثر قراءة</Text>
              <Text style={styles.detailValue}>{mostReadCategory}</Text>
            </View>
          </CardBody>
        </Card>

        {/* Reading Time Breakdown */}
        <Card style={styles.section}>
          <CardBody>
            <Text style={styles.sectionTitle}>تفصيل وقت القراءة</Text>

            <View style={styles.timeBreakdown}>
              <View style={styles.timeItem}>
                <Text style={styles.timeValue}>{totalReadingHours}</Text>
                <Text style={styles.timeUnit}>ساعة</Text>
              </View>
              <Text style={styles.timeSeparator}>:</Text>
              <View style={styles.timeItem}>
                <Text style={styles.timeValue}>{totalReadingMinutes % 60}</Text>
                <Text style={styles.timeUnit}>دقيقة</Text>
              </View>
              <Text style={styles.timeSeparator}>:</Text>
              <View style={styles.timeItem}>
                <Text style={styles.timeValue}>{totalReadingSeconds % 60}</Text>
                <Text style={styles.timeUnit}>ثانية</Text>
              </View>
            </View>

            <Text style={styles.timeTotal}>
              الإجمالي: {formatReadingTime()}
            </Text>
          </CardBody>
        </Card>

        {/* Achievement Message */}
        <Card style={[styles.section, styles.achievementCard]}>
          <CardBody>
            <View style={styles.achievementContent}>
              <Ionicons name="trophy" size={48} color="#FFA000" />
              <Text style={styles.achievementTitle}>
                {completedBooks > 0
                  ? '🎉 أحسنت! لقد أكملت قراءة كتب رائعة'
                  : '📚 ابدأ رحلتك في القراءة اليوم!'}
              </Text>
              <Text style={styles.achievementSubtitle}>
                {completedBooks > 0
                  ? `أكملت ${completedBooks} ${completedBooks === 1 ? 'كتاب' : 'كتب'} حتى الآن`
                  : 'اختر كتاباً وابدأ القراءة الآن'}
              </Text>
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

  // Summary Card
  summaryCard: {
    marginBottom: 20,
    backgroundColor: Colors.light.primary + '10',
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  summaryTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  summarySubtitle: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginRight: 44,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },

  // Sections
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 16,
  },

  // Detail Rows
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  detailIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.light.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  detailLabel: {
    flex: 1,
    fontSize: 15,
    color: Colors.light.text,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.primary,
  },

  // Time Breakdown
  timeBreakdown: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 12,
  },
  timeItem: {
    alignItems: 'center',
    gap: 4,
  },
  timeValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.light.primary,
  },
  timeUnit: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  timeSeparator: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.light.textMuted,
  },
  timeTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    textAlign: 'center',
    marginTop: 8,
  },

  // Achievement
  achievementCard: {
    backgroundColor: '#FFF9C4',
  },
  achievementContent: {
    alignItems: 'center',
    gap: 12,
  },
  achievementTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
    textAlign: 'center',
  },
  achievementSubtitle: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
});
