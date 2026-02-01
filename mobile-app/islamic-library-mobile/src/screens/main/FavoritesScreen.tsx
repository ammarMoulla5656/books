/**
 * FavoritesScreen
 * شاشة المفضلة - عرض الكتب المفضلة
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { MainTabScreenProps } from '@/navigation';
import { BookCard, NoFavorites, type Book } from '@/components';
import { Colors } from '@/constants';

// Mock Data - Books with isFavorite: true
const MOCK_FAVORITES: Book[] = [
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
    id: '5',
    title: 'الرحيق المختوم',
    author: 'صفي الرحمن المباركفوري',
    category: 'السيرة',
    pages: 678,
    thumbnail: undefined,
    isFavorite: true,
  },
];

type Props = MainTabScreenProps<'Favorites'>;

export const FavoritesScreen: React.FC<Props> = () => {
  const navigation = useNavigation();
  const [favorites] = useState<Book[]>(MOCK_FAVORITES);

  const handleBookPress = (bookId: string) => {
    // @ts-ignore - will be fixed when MainNavigator is updated
    navigation.navigate('BookDetails', { bookId });
  };

  const handleFavoritePress = (bookId: string) => {
    // TODO: Remove from favorites in store
    console.log('Remove from favorites:', bookId);
  };

  const handleReadPress = (bookId: string, bookTitle: string) => {
    // @ts-ignore - will be fixed when MainNavigator is updated
    navigation.navigate('BookReader', { bookId, bookTitle });
  };

  const handleExplorePress = () => {
    // Switch to Library tab
    // @ts-ignore
    navigation.navigate('Library');
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
        <Text style={styles.headerTitle}>المفضلة</Text>
        <Text style={styles.headerSubtitle}>
          {favorites.length > 0
            ? `${favorites.length} ${favorites.length === 1 ? 'كتاب' : 'كتب'} في المفضلة`
            : 'لا توجد كتب في المفضلة'}
        </Text>
      </View>

      {/* Content */}
      {favorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <NoFavorites onAction={handleExplorePress} />
        </View>
      ) : (
        <FlatList
          data={favorites}
          renderItem={renderBook}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // List
  listContent: {
    padding: 20,
  },
});
