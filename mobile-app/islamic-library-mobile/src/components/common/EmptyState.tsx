/**
 * EmptyState Component
 * حالة فارغة عندما لا يوجد محتوى
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Colors, Spacing, FontSize } from '@/constants';
import { Button } from './Button';

export interface EmptyStateProps {
  /** عنوان الحالة الفارغة */
  title: string;
  /** وصف الحالة الفارغة */
  description?: string;
  /** أيقونة أو emoji */
  icon?: React.ReactNode;
  /** emoji افتراضي */
  emoji?: string;
  /** إظهار زر العمل */
  showAction?: boolean;
  /** نص زر العمل */
  actionText?: string;
  /** دالة زر العمل */
  onAction?: () => void;
  /** ملء الشاشة */
  fullScreen?: boolean;
  /** custom container styles */
  containerStyle?: ViewStyle;
  /** custom title styles */
  titleStyle?: TextStyle;
  /** custom description styles */
  descriptionStyle?: TextStyle;
}

/**
 * EmptyState Component
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  emoji = '📭',
  showAction = false,
  actionText = 'ابدأ الآن',
  onAction,
  fullScreen = false,
  containerStyle,
  titleStyle,
  descriptionStyle,
}) => {
  return (
    <View
      style={[
        styles.container,
        fullScreen && styles.fullScreen,
        containerStyle,
      ]}
    >
      {/* Icon or Emoji */}
      {icon ? (
        <View style={styles.iconContainer}>{icon}</View>
      ) : (
        <Text style={styles.emoji}>{emoji}</Text>
      )}

      {/* Title */}
      <Text style={[styles.title, titleStyle]}>{title}</Text>

      {/* Description */}
      {description && (
        <Text style={[styles.description, descriptionStyle]}>
          {description}
        </Text>
      )}

      {/* Action Button */}
      {showAction && onAction && (
        <Button
          title={actionText}
          onPress={onAction}
          variant="primary"
          size="medium"
          style={styles.actionButton}
        />
      )}
    </View>
  );
};

/**
 * Common Empty States
 */

// No Books
export const NoBooks: React.FC<{
  onAction?: () => void;
}> = ({ onAction }) => (
  <EmptyState
    emoji="📚"
    title="لا توجد كتب"
    description="لم تقم بإضافة أي كتب بعد"
    showAction={!!onAction}
    actionText="تصفح المكتبة"
    onAction={onAction}
  />
);

// No Search Results
export const NoSearchResults: React.FC<{
  searchQuery?: string;
}> = ({ searchQuery }) => (
  <EmptyState
    emoji="🔍"
    title="لا توجد نتائج"
    description={
      searchQuery
        ? `لم نجد أي نتائج لـ "${searchQuery}"`
        : 'حاول البحث بكلمات مختلفة'
    }
  />
);

// No Favorites
export const NoFavorites: React.FC<{
  onAction?: () => void;
}> = ({ onAction }) => (
  <EmptyState
    emoji="⭐"
    title="لا توجد مفضلات"
    description="لم تقم بإضافة أي كتب إلى المفضلة"
    showAction={!!onAction}
    actionText="استكشف الكتب"
    onAction={onAction}
  />
);

// No Reading History
export const NoReadingHistory: React.FC<{
  onAction?: () => void;
}> = ({ onAction }) => (
  <EmptyState
    emoji="📖"
    title="لا يوجد سجل قراءة"
    description="لم تبدأ بقراءة أي كتب بعد"
    showAction={!!onAction}
    actionText="ابدأ القراءة"
    onAction={onAction}
  />
);

// No Downloads
export const NoDownloads: React.FC<{
  onAction?: () => void;
}> = ({ onAction }) => (
  <EmptyState
    emoji="📥"
    title="لا توجد تنزيلات"
    description="لم تقم بتنزيل أي كتب للقراءة بدون إنترنت"
    showAction={!!onAction}
    actionText="تصفح الكتب"
    onAction={onAction}
  />
);

// No Notifications
export const NoNotifications: React.FC = () => (
  <EmptyState
    emoji="🔔"
    title="لا توجد إشعارات"
    description="لا يوجد لديك أي إشعارات جديدة"
  />
);

// Offline
export const Offline: React.FC<{
  onRetry?: () => void;
}> = ({ onRetry }) => (
  <EmptyState
    emoji="📡"
    title="لا يوجد اتصال بالإنترنت"
    description="يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى"
    showAction={!!onRetry}
    actionText="إعادة المحاولة"
    onAction={onRetry}
  />
);

const styles = StyleSheet.create({
  // Container
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  fullScreen: {
    flex: 1,
    width: '100%',
    height: '100%',
  },

  // Icon & Emoji
  iconContainer: {
    marginBottom: Spacing.lg,
  },
  emoji: {
    fontSize: 64,
    marginBottom: Spacing.lg,
  },

  // Title
  title: {
    fontSize: FontSize.xl,
    fontWeight: 'bold',
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },

  // Description
  description: {
    fontSize: FontSize.md,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },

  // Action Button
  actionButton: {
    marginTop: Spacing.md,
    minWidth: 150,
  },
});
