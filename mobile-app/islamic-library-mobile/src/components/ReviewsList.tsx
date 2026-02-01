/**
 * ReviewsList
 * قائمة عرض التقييمات
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants';
import type { Review } from '@/stores';

interface ReviewsListProps {
  reviews: Review[];
  currentUserId?: string;
  onEditPress?: (review: Review) => void;
}

export const ReviewsList: React.FC<ReviewsListProps> = ({
  reviews,
  currentUserId,
  onEditPress,
}) => {
  const renderReview = ({ item }: { item: Review }) => {
    const isCurrentUser = item.userId === currentUserId;
    const reviewDate = new Date(item.createdAt).toLocaleDateString('ar-DZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return (
      <View style={styles.reviewCard}>
        <View style={styles.reviewHeader}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={20} color={Colors.light.background} />
            </View>
            <View style={styles.userDetails}>
              <View style={styles.nameRow}>
                <Text style={styles.userName}>{item.userName}</Text>
                {isCurrentUser && (
                  <View style={styles.currentUserBadge}>
                    <Text style={styles.currentUserText}>أنت</Text>
                  </View>
                )}
              </View>
              <Text style={styles.reviewDate}>{reviewDate}</Text>
            </View>
          </View>

          {isCurrentUser && onEditPress && (
            <Pressable
              style={({ pressed }) => [
                styles.editButton,
                pressed && styles.editButtonPressed,
              ]}
              onPress={() => onEditPress(item)}
            >
              <Ionicons
                name="create-outline"
                size={20}
                color={Colors.light.primary}
              />
            </Pressable>
          )}
        </View>

        {/* Rating */}
        <View style={styles.rating}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Ionicons
              key={star}
              name={star <= item.rating ? 'star' : 'star-outline'}
              size={16}
              color="#FFA000"
            />
          ))}
          <Text style={styles.ratingValue}>
            {item.rating.toFixed(1)}
          </Text>
        </View>

        {/* Comment */}
        {item.comment && (
          <Text style={styles.comment}>{item.comment}</Text>
        )}
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons
        name="chatbubbles-outline"
        size={64}
        color={Colors.light.textMuted}
      />
      <Text style={styles.emptyText}>لا توجد تقييمات بعد</Text>
      <Text style={styles.emptySubtext}>
        كن أول من يقيّم هذا الكتاب
      </Text>
    </View>
  );

  if (reviews.length === 0) {
    return renderEmptyState();
  }

  return (
    <FlatList
      data={reviews}
      renderItem={renderReview}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContainer}
      showsVerticalScrollIndicator={false}
      scrollEnabled={false} // Disable scroll if embedded in ScrollView
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingTop: 8,
  },
  reviewCard: {
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  currentUserBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: Colors.light.primary + '20',
  },
  currentUserText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  reviewDate: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.light.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButtonPressed: {
    opacity: 0.7,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  ratingValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
    marginLeft: 4,
  },
  comment: {
    fontSize: 14,
    lineHeight: 22,
    color: Colors.light.text,
    textAlign: 'right',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
