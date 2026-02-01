/**
 * SearchScreen
 * شاشة البحث في الكتب
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import type { MainStackScreenProps } from '@/navigation';
import { BookCard, type Book } from '@/components';
import { Colors } from '@/constants';

// Mock books for search
const ALL_BOOKS: Book[] = [
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
    title: 'رياض الصالحين',
    author: 'الإمام النووي',
    category: 'الحديث',
    pages: 567,
    isFavorite: false,
  },
  {
    id: '3',
    title: 'تفسير ابن كثير',
    author: 'ابن كثير',
    category: 'التفسير',
    pages: 3456,
    isFavorite: true,
    progress: 12,
  },
  {
    id: '4',
    title: 'فقه السنة',
    author: 'السيد سابق',
    category: 'الفقه',
    pages: 890,
    isFavorite: false,
  },
  {
    id: '5',
    title: 'الرحيق المختوم',
    author: 'صفي الرحمن المباركفوري',
    category: 'السيرة',
    pages: 678,
    isFavorite: true,
  },
];

type Props = MainStackScreenProps<'Search'>;

export const SearchScreen: React.FC<Props> = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Book[]>([]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);

    if (query.trim() === '') {
      setSearchResults([]);
      return;
    }

    // Simple search by title or author
    const results = ALL_BOOKS.filter(
      (book) =>
        book.title.toLowerCase().includes(query.toLowerCase()) ||
        book.author.toLowerCase().includes(query.toLowerCase()) ||
        book.category.toLowerCase().includes(query.toLowerCase())
    );

    setSearchResults(results);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

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

        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color={Colors.light.textSecondary}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="ابحث عن كتاب، مؤلف، أو تصنيف..."
            placeholderTextColor={Colors.light.textMuted}
            value={searchQuery}
            onChangeText={handleSearch}
            autoFocus
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <Pressable
              style={({ pressed }) => [
                styles.clearButton,
                pressed && styles.clearButtonPressed,
              ]}
              onPress={handleClearSearch}
            >
              <Ionicons name="close-circle" size={20} color={Colors.light.textMuted} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Content */}
      {searchQuery.trim() === '' ? (
        <View style={styles.emptyState}>
          <Ionicons name="search" size={80} color={Colors.light.textMuted} />
          <Text style={styles.emptyTitle}>ابحث في المكتبة</Text>
          <Text style={styles.emptySubtitle}>
            ابحث عن كتاب بالاسم، المؤلف، أو التصنيف
          </Text>
        </View>
      ) : searchResults.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="file-tray-outline" size={80} color={Colors.light.textMuted} />
          <Text style={styles.emptyTitle}>لا توجد نتائج</Text>
          <Text style={styles.emptySubtitle}>
            لم نجد أي كتب تطابق "{searchQuery}"
          </Text>
        </View>
      ) : (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsCount}>
            {searchResults.length} {searchResults.length === 1 ? 'نتيجة' : 'نتائج'}
          </Text>
          <FlatList
            data={searchResults}
            renderItem={renderBook}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    gap: 12,
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

  // Search
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
    textAlign: 'right',
  },
  clearButton: {
    padding: 4,
  },
  clearButtonPressed: {
    opacity: 0.5,
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.light.text,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },

  // Results
  resultsContainer: {
    flex: 1,
  },
  resultsCount: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.textSecondary,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  listContent: {
    padding: 20,
    paddingTop: 0,
  },
});
