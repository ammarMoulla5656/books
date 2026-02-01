/**
 * CategoryScreen
 * شاشة عرض كتب تصنيف معين
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import type { MainStackScreenProps } from '@/navigation';
import { BookCard, type Book } from '@/components';
import { Colors } from '@/constants';

type RouteProp = MainStackScreenProps<'Category'>['route'];

// Mock books for category
const CATEGORY_BOOKS: Book[] = [
  {
    id: '1',
    title: 'صحيح البخاري',
    author: 'الإمام البخاري',
    category: 'الحديث',
    pages: 2345,
    isFavorite: true,
    progress: 45,
  },
  {
    id: '2',
    title: 'صحيح مسلم',
    author: 'الإمام مسلم',
    category: 'الحديث',
    pages: 1890,
    isFavorite: false,
  },
  {
    id: '3',
    title: 'رياض الصالحين',
    author: 'الإمام النووي',
    category: 'الحديث',
    pages: 567,
    isFavorite: false,
  },
  {
    id: '4',
    title: 'الأربعين النووية',
    author: 'الإمام النووي',
    category: 'الحديث',
    pages: 120,
    isFavorite: true,
  },
];

type Props = MainStackScreenProps<'Category'>;

export const CategoryScreen: React.FC<Props> = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp>();
  const { categoryId, categoryName } = route.params;

  const [books] = useState<Book[]>(CATEGORY_BOOKS);
  const [sortBy, setSortBy] = useState<'title' | 'author' | 'pages'>('title');

  // Sort books
  const sortedBooks = [...books].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title, 'ar');
      case 'author':
        return a.author.localeCompare(b.author, 'ar');
      case 'pages':
        return b.pages - a.pages;
      default:
        return 0;
    }
  });

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleBookPress = (bookId: string) => {
    navigation.navigate('BookDetails', { bookId });
  };

  const handleFavoritePress = (bookId: string) => {
    console.log('Toggle favorite:', bookId);
  };

  const handleReadPress = (bookId: string, bookTitle: string) => {
    navigation.navigate('BookReader', { bookId, bookTitle });
  };

  const renderBook = ({ item }: { item: Book }) => (
    <BookCard
      book={item}
      onPress={() => handleBookPress(item.id)}
      onFavoritePress={() => handleFavoritePress(item.id)}
      onReadPress={() => handleReadPress(item.id, item.title)}
    />
  );

  const renderHeader = () => (
    <View style={styles.headerSection}>
      <Text style={styles.categoryTitle}>{categoryName}</Text>
      <Text style={styles.booksCount}>
        {books.length} {books.length === 1 ? 'كتاب' : 'كتب'}
      </Text>

      {/* Sort Options */}
      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>ترتيب حسب:</Text>
        <View style={styles.sortButtons}>
          <Pressable
            style={({ pressed }) => [
              styles.sortButton,
              sortBy === 'title' && styles.sortButtonActive,
              pressed && styles.sortButtonPressed,
            ]}
            onPress={() => setSortBy('title')}
          >
            <Text
              style={[
                styles.sortButtonText,
                sortBy === 'title' && styles.sortButtonTextActive,
              ]}
            >
              العنوان
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.sortButton,
              sortBy === 'author' && styles.sortButtonActive,
              pressed && styles.sortButtonPressed,
            ]}
            onPress={() => setSortBy('author')}
          >
            <Text
              style={[
                styles.sortButtonText,
                sortBy === 'author' && styles.sortButtonTextActive,
              ]}
            >
              المؤلف
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.sortButton,
              sortBy === 'pages' && styles.sortButtonActive,
              pressed && styles.sortButtonPressed,
            ]}
            onPress={() => setSortBy('pages')}
          >
            <Text
              style={[
                styles.sortButtonText,
                sortBy === 'pages' && styles.sortButtonTextActive,
              ]}
            >
              الصفحات
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );

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
        <Text style={styles.headerTitle}>التصنيف</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      {/* Books List */}
      <FlatList
        data={sortedBooks}
        renderItem={renderBook}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderHeader}
        showsVerticalScrollIndicator={false}
      />
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

  // List
  listContent: {
    padding: 20,
  },

  // Header Section
  headerSection: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 8,
    textAlign: 'right',
  },
  booksCount: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    marginBottom: 20,
    textAlign: 'right',
  },

  // Sort
  sortContainer: {
    marginTop: 8,
  },
  sortLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
    textAlign: 'right',
  },
  sortButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  sortButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.light.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  sortButtonActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  sortButtonPressed: {
    opacity: 0.7,
  },
  sortButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
  },
  sortButtonTextActive: {
    color: Colors.light.background,
  },
});
