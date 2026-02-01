/**
 * LibraryScreen
 * شاشة المكتبة - عرض جميع الكتب والتصنيفات
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import type { MainTabScreenProps } from '@/navigation';
import { BookCard, type Book, type Category } from '@/components';
import { Colors } from '@/constants';

// Mock Data
const MOCK_CATEGORIES: Category[] = [
  { id: '1', name: 'العقيدة', booksCount: 45, icon: 'star', color: '#1A472A' },
  { id: '2', name: 'الفقه', booksCount: 120, icon: 'book', color: '#2196F3' },
  { id: '3', name: 'الحديث', booksCount: 78, icon: 'library', color: '#F44336' },
  { id: '4', name: 'التفسير', booksCount: 56, icon: 'albums', color: '#9C27B0' },
  { id: '5', name: 'السيرة', booksCount: 34, icon: 'person', color: '#FF9800' },
  { id: '6', name: 'التاريخ', booksCount: 67, icon: 'time', color: '#4CAF50' },
];

const MOCK_BOOKS: Book[] = [
  {
    id: '1',
    title: 'صحيح البخاري',
    author: 'الإمام البخاري',
    category: 'الحديث',
    pages: 2345,
    thumbnail: undefined,
    isFavorite: true,
    progress: 45,
  },
  {
    id: '2',
    title: 'رياض الصالحين',
    author: 'الإمام النووي',
    category: 'الحديث',
    pages: 567,
    thumbnail: undefined,
    isFavorite: false,
  },
  {
    id: '3',
    title: 'تفسير ابن كثير',
    author: 'ابن كثير',
    category: 'التفسير',
    pages: 3456,
    thumbnail: undefined,
    isFavorite: true,
    progress: 12,
  },
  {
    id: '4',
    title: 'فقه السنة',
    author: 'السيد سابق',
    category: 'الفقه',
    pages: 890,
    thumbnail: undefined,
    isFavorite: false,
  },
  {
    id: '5',
    title: 'الرحيق المختوم',
    author: 'صفي الرحمن المباركفوري',
    category: 'السيرة',
    pages: 678,
    thumbnail: undefined,
    isFavorite: true,
  },
];

type Props = MainTabScreenProps<'Library'>;

export const LibraryScreen: React.FC<Props> = () => {
  const navigation = useNavigation();
  const [books] = useState<Book[]>(MOCK_BOOKS);
  const [categories] = useState<Category[]>(MOCK_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Filter books by category
  const filteredBooks = selectedCategory
    ? books.filter((book) => {
        const category = categories.find((c) => c.id === selectedCategory);
        return book.category === category?.name;
      })
    : books;

  const handleBookPress = (bookId: string) => {
    // @ts-ignore - will be fixed when MainNavigator is updated
    navigation.navigate('BookDetails', { bookId });
  };

  const handleFavoritePress = (bookId: string) => {
    // TODO: Toggle favorite in store
    console.log('Toggle favorite:', bookId);
  };

  const handleReadPress = (bookId: string, bookTitle: string) => {
    // @ts-ignore - will be fixed when MainNavigator is updated
    navigation.navigate('BookReader', { bookId, bookTitle });
  };

  const handleCategoryPress = (categoryId: string, categoryName: string) => {
    // @ts-ignore - will be fixed when MainNavigator is updated
    navigation.navigate('Category', { categoryId, categoryName });
  };

  const handleSearchPress = () => {
    // @ts-ignore - will be fixed when MainNavigator is updated
    navigation.navigate('Search');
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
    <View>
      {/* Categories Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>التصنيفات</Text>
          <Pressable
            style={({ pressed }) => [
              styles.filterButton,
              selectedCategory && styles.filterButtonActive,
              pressed && styles.filterButtonPressed,
            ]}
            onPress={() => setSelectedCategory(null)}
          >
            <Text
              style={[
                styles.filterButtonText,
                selectedCategory && styles.filterButtonTextActive,
              ]}
            >
              {selectedCategory ? 'إظهار الكل' : 'الكل'}
            </Text>
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScroll}
        >
          {categories.map((category) => (
            <Pressable
              key={category.id}
              style={({ pressed }) => [
                styles.categoryChip,
                { backgroundColor: `${category.color}15`, borderColor: category.color },
                selectedCategory === category.id && {
                  backgroundColor: category.color,
                },
                pressed && styles.categoryChipPressed,
              ]}
              onPress={() => {
                setSelectedCategory(
                  selectedCategory === category.id ? null : category.id
                );
              }}
              onLongPress={() => handleCategoryPress(category.id, category.name)}
            >
              <Ionicons
                name={category.icon || 'folder-outline'}
                size={20}
                color={
                  selectedCategory === category.id
                    ? Colors.light.background
                    : category.color
                }
              />
              <Text
                style={[
                  styles.categoryChipText,
                  { color: category.color },
                  selectedCategory === category.id && {
                    color: Colors.light.background,
                  },
                ]}
              >
                {category.name}
              </Text>
              <Text
                style={[
                  styles.categoryChipCount,
                  { color: category.color },
                  selectedCategory === category.id && {
                    color: Colors.light.background,
                    opacity: 0.8,
                  },
                ]}
              >
                {category.booksCount}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Books Section Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {selectedCategory
            ? `${categories.find((c) => c.id === selectedCategory)?.name} (${filteredBooks.length})`
            : `جميع الكتب (${books.length})`}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>المكتبة</Text>
        <Pressable
          style={({ pressed }) => [
            styles.searchButton,
            pressed && styles.searchButtonPressed,
          ]}
          onPress={handleSearchPress}
        >
          <Ionicons name="search" size={24} color={Colors.light.text} />
        </Pressable>
      </View>

      {/* Books List */}
      <FlatList
        data={filteredBooks}
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
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonPressed: {
    opacity: 0.7,
  },

  // List
  listContent: {
    padding: 20,
  },

  // Section
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
  },

  // Filter Button
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  filterButtonActive: {
    backgroundColor: Colors.light.primary,
  },
  filterButtonPressed: {
    opacity: 0.7,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
  },
  filterButtonTextActive: {
    color: Colors.light.background,
  },

  // Categories
  categoriesScroll: {
    paddingRight: 20,
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    gap: 6,
    marginRight: 8,
  },
  categoryChipPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  categoryChipCount: {
    fontSize: 12,
    fontWeight: '500',
    opacity: 0.7,
  },
});
