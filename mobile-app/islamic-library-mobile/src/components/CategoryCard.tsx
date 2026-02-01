/**
 * CategoryCard Component
 * بطاقة عرض التصنيف في القوائم
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants';

/**
 * Category Type
 */
export interface Category {
  id: string;
  name: string;
  booksCount: number;
  icon?: keyof typeof Ionicons.glyphMap;
  color?: string;
}

/**
 * CategoryCard Props
 */
export interface CategoryCardProps {
  category: Category;
  onPress?: () => void;
  style?: ViewStyle;
}

/**
 * CategoryCard Component
 *
 * @example
 * <CategoryCard
 *   category={category}
 *   onPress={() => navigation.navigate('Category', { categoryId: category.id })}
 * />
 */
export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onPress,
  style,
}) => {
  const iconName = category.icon || 'folder-outline';
  const color = category.color || Colors.light.primary;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        { backgroundColor: `${color}15` },
        pressed && styles.pressed,
        style,
      ]}
      onPress={onPress}
    >
      {/* Icon */}
      <View style={[styles.iconContainer, { backgroundColor: `${color}30` }]}>
        <Ionicons name={iconName} size={28} color={color} />
      </View>

      {/* Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.name} numberOfLines={2}>
          {category.name}
        </Text>
        <Text style={styles.count}>
          {category.booksCount} {category.booksCount === 1 ? 'كتاب' : 'كتب'}
        </Text>
      </View>

      {/* Arrow */}
      <Ionicons
        name="chevron-back-outline"
        size={20}
        color={Colors.light.textMuted}
        style={styles.arrow}
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },

  // Icon
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  // Info
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
    textAlign: 'right',
  },
  count: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: 'right',
  },

  // Arrow
  arrow: {
    marginLeft: 8,
  },
});
