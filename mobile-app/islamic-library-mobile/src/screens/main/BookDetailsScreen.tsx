/**
 * BookDetailsScreen
 * شاشة تفاصيل الكتاب مع التحميل
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import type { MainStackScreenProps } from '@/navigation';
import { Button, Card, CardBody } from '@/components';
import { DownloadProgressCard } from '@/components/DownloadProgressCard';
import { Colors } from '@/constants';
import { DownloadManager, DownloadItem, DownloadStatus } from '@/services/DownloadManager';

type RouteProp = MainStackScreenProps<'BookDetails'>['route'];

// Mock Book Details
interface BookDetails {
  id: string;
  title: string;
  author: string;
  category: string;
  pages: number;
  thumbnail?: string;
  description: string;
  rating: number;
  reviewsCount: number;
  publishYear: string;
  language: string;
  fileSize: string;
  isFavorite: boolean;
  isDownloaded: boolean;
  progress?: number;
}

const MOCK_BOOK_DETAILS: BookDetails = {
  id: '1',
  title: 'صحيح البخاري',
  author: 'الإمام البخاري',
  category: 'الحديث',
  pages: 2345,
  thumbnail: undefined,
  description: 'صحيح البخاري هو أحد أهم كتب الحديث النبوي عند المسلمين، وأول مصنف في الحديث الصحيح المجرد، ويعتبره أهل السنة والجماعة أصح الكتب بعد القرآن الكريم. جمعه الإمام محمد بن إسماعيل البخاري، واستغرق في تأليفه ستة عشر عاماً. يحتوي الكتاب على 7563 حديثاً بالمكرر و4000 حديث بدون المكرر.\n\nيتميز صحيح البخاري بدقة منهجه في انتقاء الأحاديث، حيث وضع البخاري شروطاً صارمة لقبول الحديث، منها اتصال السند واشتراط اللقاء بين الراويين وعدالة الرواة وضبطهم وعدم الشذوذ والعلة القادحة.',
  rating: 4.9,
  reviewsCount: 1234,
  publishYear: '256 هـ',
  language: 'العربية',
  fileSize: '45.2 MB',
  isFavorite: true,
  isDownloaded: false,
  progress: 45,
};

export const BookDetailsScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp>();
  const { bookId } = route.params;

  const [book] = useState<BookDetails>(MOCK_BOOK_DETAILS);
  const [isFavorite, setIsFavorite] = useState(book.isFavorite);
  const [currentDownload, setCurrentDownload] = useState<DownloadItem | null>(null);

  // Check if book is already downloaded
  useEffect(() => {
    const existingDownload = DownloadManager.getDownloadByBookId(book.id);
    if (existingDownload) {
      setCurrentDownload(existingDownload);
    }

    // Listen for download updates
    const unsubscribe = DownloadManager.addListener((downloads) => {
      const bookDownload = downloads.find((d) => d.bookId === book.id);
      setCurrentDownload(bookDownload || null);
    });

    return unsubscribe;
  }, [book.id]);

  const isDownloaded = currentDownload?.status === DownloadStatus.COMPLETED;
  const isDownloading =
    currentDownload?.status === DownloadStatus.DOWNLOADING ||
    currentDownload?.status === DownloadStatus.PENDING;

  const handleReadPress = () => {
    // @ts-ignore
    navigation.navigate('BookReader', {
      bookId: book.id,
      bookTitle: book.title,
    });
  };

  const handleFavoritePress = () => {
    setIsFavorite(!isFavorite);
    // TODO: Update favorite in store
  };

  const handleDownloadPress = async () => {
    if (isDownloaded) {
      // Confirm delete
      Alert.alert(
        'حذف التحميل',
        'هل تريد حذف هذا الكتاب من التحميلات؟',
        [
          { text: 'إلغاء', style: 'cancel' },
          {
            text: 'حذف',
            style: 'destructive',
            onPress: async () => {
              if (currentDownload) {
                await DownloadManager.deleteDownload(currentDownload.id);
              }
            },
          },
        ]
      );
    } else if (isDownloading) {
      // Cancel download
      Alert.alert(
        'إيقاف التحميل',
        'هل تريد إيقاف تحميل هذا الكتاب؟',
        [
          { text: 'لا', style: 'cancel' },
          {
            text: 'نعم',
            onPress: async () => {
              if (currentDownload) {
                await DownloadManager.cancelDownload(currentDownload.id);
              }
            },
          },
        ]
      );
    } else {
      // Start download
      const mockUrl = `https://example.com/books/${book.id}.pdf`;
      await DownloadManager.startDownload(book.id, book.title, mockUrl);
      Alert.alert('بدء التحميل', 'تم بدء تحميل الكتاب');
    }
  };

  const handleCancelDownload = async (downloadId: string) => {
    Alert.alert(
      'إيقاف التحميل',
      'هل تريد إيقاف تحميل هذا الكتاب؟',
      [
        { text: 'لا', style: 'cancel' },
        {
          text: 'نعم',
          onPress: async () => {
            await DownloadManager.cancelDownload(downloadId);
          },
        },
      ]
    );
  };

  const handleRetryDownload = async (downloadId: string) => {
    const download = DownloadManager.getDownload(downloadId);
    if (download) {
      await DownloadManager.deleteDownload(downloadId);
      await DownloadManager.startDownload(
        download.bookId,
        download.bookTitle,
        download.url
      );
    }
  };

  const handleBackPress = () => {
    navigation.goBack();
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
        <Text style={styles.headerTitle}>تفاصيل الكتاب</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Book Cover & Info */}
        <View style={styles.bookInfoSection}>
          {/* Thumbnail */}
          <View style={styles.thumbnailContainer}>
            {book.thumbnail ? (
              <Image
                source={{ uri: book.thumbnail }}
                style={styles.thumbnail}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.placeholderThumbnail}>
                <Ionicons name="book" size={80} color={Colors.light.textMuted} />
              </View>
            )}
          </View>

          {/* Title & Author */}
          <Text style={styles.title}>{book.title}</Text>
          <Text style={styles.author}>
            <Ionicons name="person-outline" size={16} color={Colors.light.textSecondary} />
            {' '}
            {book.author}
          </Text>

          {/* Rating */}
          <View style={styles.ratingContainer}>
            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                  key={star}
                  name={star <= Math.floor(book.rating) ? 'star' : 'star-outline'}
                  size={20}
                  color="#FFA000"
                />
              ))}
            </View>
            <Text style={styles.ratingText}>
              {book.rating.toFixed(1)} ({book.reviewsCount} تقييم)
            </Text>
          </View>

          {/* Meta Info */}
          <View style={styles.metaContainer}>
            <View style={styles.metaItem}>
              <Ionicons name="pricetag-outline" size={18} color={Colors.light.primary} />
              <Text style={styles.metaLabel}>التصنيف</Text>
              <Text style={styles.metaValue}>{book.category}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="document-text-outline" size={18} color={Colors.light.primary} />
              <Text style={styles.metaLabel}>الصفحات</Text>
              <Text style={styles.metaValue}>{book.pages}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={18} color={Colors.light.primary} />
              <Text style={styles.metaLabel}>النشر</Text>
              <Text style={styles.metaValue}>{book.publishYear}</Text>
            </View>
          </View>

          {/* Progress (if exists) */}
          {book.progress !== undefined && book.progress > 0 && (
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>التقدم في القراءة</Text>
                <Text style={styles.progressPercent}>{book.progress}%</Text>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${book.progress}%` },
                  ]}
                />
              </View>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <Button
            title={book.progress && book.progress > 0 ? 'متابعة القراءة' : 'بدء القراءة'}
            onPress={handleReadPress}
            leftIcon={<Ionicons name="book-outline" size={20} color={Colors.light.background} />}
            style={styles.readButton}
          />

          <View style={styles.secondaryActions}>
            <Pressable
              style={({ pressed }) => [
                styles.iconButton,
                isFavorite && styles.iconButtonActive,
                pressed && styles.iconButtonPressed,
              ]}
              onPress={handleFavoritePress}
            >
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={24}
                color={isFavorite ? Colors.light.error : Colors.light.text}
              />
              <Text style={[
                styles.iconButtonText,
                isFavorite && styles.iconButtonTextActive,
              ]}>
                {isFavorite ? 'في المفضلة' : 'إضافة للمفضلة'}
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.iconButton,
                isDownloaded && styles.iconButtonActive,
                pressed && styles.iconButtonPressed,
              ]}
              onPress={handleDownloadPress}
              disabled={isDownloading}
            >
              <Ionicons
                name={
                  isDownloaded
                    ? 'checkmark-circle'
                    : isDownloading
                    ? 'hourglass-outline'
                    : 'download-outline'
                }
                size={24}
                color={
                  isDownloaded
                    ? Colors.light.success
                    : isDownloading
                    ? Colors.light.warning
                    : Colors.light.text
                }
              />
              <Text style={[
                styles.iconButtonText,
                isDownloaded && styles.iconButtonTextActive,
              ]}>
                {isDownloaded
                  ? 'تم التحميل'
                  : isDownloading
                  ? 'جاري التحميل...'
                  : 'تحميل'}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Download Progress */}
        {currentDownload &&
          (currentDownload.status === DownloadStatus.DOWNLOADING ||
            currentDownload.status === DownloadStatus.PENDING ||
            currentDownload.status === DownloadStatus.PAUSED ||
            currentDownload.status === DownloadStatus.FAILED) && (
            <View style={styles.downloadSection}>
              <DownloadProgressCard
                download={currentDownload}
                onCancel={handleCancelDownload}
                onRetry={handleRetryDownload}
              />
            </View>
          )}

        {/* Description */}
        <Card style={styles.section}>
          <CardBody>
            <Text style={styles.sectionTitle}>الوصف</Text>
            <Text style={styles.description}>{book.description}</Text>
          </CardBody>
        </Card>

        {/* Additional Info */}
        <Card style={styles.section}>
          <CardBody>
            <Text style={styles.sectionTitle}>معلومات إضافية</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>اللغة:</Text>
              <Text style={styles.infoValue}>{book.language}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>حجم الملف:</Text>
              <Text style={styles.infoValue}>{book.fileSize}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>رقم الكتاب:</Text>
              <Text style={styles.infoValue}>#{bookId}</Text>
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

  // Book Info Section
  bookInfoSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  thumbnailContainer: {
    width: 180,
    height: 270,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  placeholderThumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.light.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  author: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: 12,
  },

  // Rating
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  stars: {
    flexDirection: 'row',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },

  // Meta
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.light.border,
    marginBottom: 20,
  },
  metaItem: {
    alignItems: 'center',
    gap: 4,
  },
  metaLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
  },

  // Progress
  progressSection: {
    width: '100%',
    marginBottom: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: Colors.light.text,
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.light.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.light.primary,
    borderRadius: 4,
  },

  // Actions
  actionsSection: {
    marginBottom: 24,
  },
  readButton: {
    marginBottom: 12,
  },
  downloadSection: {
    marginBottom: 24,
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: Colors.light.backgroundSecondary,
    gap: 8,
  },
  iconButtonActive: {
    backgroundColor: Colors.light.primary + '20',
  },
  iconButtonPressed: {
    opacity: 0.7,
  },
  iconButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
  },
  iconButtonTextActive: {
    color: Colors.light.primary,
  },

  // Sections
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    color: Colors.light.text,
    textAlign: 'right',
  },

  // Additional Info
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.text,
  },
});
