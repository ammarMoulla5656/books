/**
 * BookCard Component
 * بطاقة عرض الكتاب في القوائم
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants';

/**
 * Book Type
 */
export interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  pages: number;
  thumbnail?: string;
  isFavorite?: boolean;
  progress?: number; // 0-100
}

/**
 * BookCard Props
 */
export interface BookCardProps {
  book: Book;
  onPress?: () => void;
  onFavoritePress?: () => void;
  onReadPress?: () => void;
  style?: ViewStyle;
}

/**
 * BookCard Component
 *
 * @example
 * <BookCard
 *   book={book}
 *   onPress={() => navigation.navigate('BookDetails', { bookId: book.id })}
 *   onFavoritePress={() => toggleFavorite(book.id)}
 *   onReadPress={() => navigation.navigate('BookReader', { bookId: book.id })}
 * />
 */
export const BookCard: React.FC<BookCardProps> = ({
  book,
  onPress,
  onFavoritePress,
  onReadPress,
  style,
}) => {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
        style,
      ]}
      onPress={onPress}
    >
      {/* Book Thumbnail */}
      <View style={styles.thumbnailContainer}>
        {book.thumbnail ? (
          <Image
            source={{ uri: book.thumbnail }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderThumbnail}>
            <Ionicons name="book" size={40} color={Colors.light.textMuted} />
          </View>
        )}

        {/* Favorite Badge */}
        {book.isFavorite && (
          <View style={styles.favoriteBadge}>
            <Ionicons name="heart" size={16} color={Colors.light.error} />
          </View>
        )}
      </View>

      {/* Book Info */}
      <View style={styles.infoContainer}>
        {/* Title */}
        <Text style={styles.title} numberOfLines={2}>
          {book.title}
        </Text>

        {/* Author */}
        <Text style={styles.author} numberOfLines={1}>
          <Ionicons name="person-outline" size={14} color={Colors.light.textSecondary} />
          {' '}
          {book.author}
        </Text>

        {/* Category & Pages */}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="pricetag-outline" size={14} color={Colors.light.textSecondary} />
            <Text style={styles.metaText}>{book.category}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="document-text-outline" size={14} color={Colors.light.textSecondary} />
            <Text style={styles.metaText}>{book.pages} صفحة</Text>
          </View>
        </View>

        {/* Progress Bar (if book is being read) */}
        {book.progress !== undefined && book.progress > 0 && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${book.progress}%` },
                ]}
              />
            </View>
            <Text style={styles.progressText}>{book.progress}%</Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsRow}>
          {/* Read Button */}
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              styles.readButton,
              pressed && styles.actionButtonPressed,
            ]}
            onPress={(e) => {
              e.stopPropagation();
              onReadPress?.();
            }}
          >
            <Ionicons name="book-outline" size={16} color={Colors.light.background} />
            <Text style={styles.readButtonText}>
              {book.progress && book.progress > 0 ? 'متابعة القراءة' : 'قراءة'}
            </Text>
          </Pressable>

          {/* Favorite Button */}
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              styles.favoriteButton,
              pressed && styles.actionButtonPressed,
            ]}
            onPress={(e) => {
              e.stopPropagation();
              onFavoritePress?.();
            }}
          >
            <Ionicons
              name={book.isFavorite ? 'heart' : 'heart-outline'}
              size={20}
              color={book.isFavorite ? Colors.light.error : Colors.light.textSecondary}
            />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },

  // Thumbnail
  thumbnailContainer: {
    width: 80,
    height: 120,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 12,
    position: 'relative',
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
  favoriteBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },

  // Info
  infoContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
    textAlign: 'right',
  },
  author: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 6,
    textAlign: 'right',
  },

  // Meta
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 8,
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },

  // Progress
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: Colors.light.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.light.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 11,
    color: Colors.light.textMuted,
    fontWeight: '600',
    minWidth: 35,
    textAlign: 'right',
  },

  // Actions
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 4,
  },
  actionButtonPressed: {
    opacity: 0.7,
  },
  readButton: {
    flex: 1,
    backgroundColor: Colors.light.primary,
  },
  readButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.background,
  },
  favoriteButton: {
    width: 40,
    backgroundColor: Colors.light.backgroundSecondary,
  },
});
