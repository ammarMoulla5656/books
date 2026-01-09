'use client';

import { useState, useEffect } from 'react';
import BookCard from '@/components/BookCard';
import SearchBar from '@/components/SearchBar';
import CategoryFilter from '@/components/CategoryFilter';
import { Book } from '@/lib/types';
import { useVisitorTracking } from '@/lib/useVisitorTracking';

export default function Home() {
  const [books, setBooks] = useState<Book[]>([]);
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Track homepage visit
  useVisitorTracking('/', 'page_view');

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      setLoading(true);
      // استخدام API بدلاً من localStorage
      const response = await fetch('/api/books');
      if (response.ok) {
        const data = await response.json();
        setAllBooks(data);
        setBooks(data);
      }
    } catch (error) {
      console.error('Error loading books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    try {
      // استخدام API للبحث
      const url = query.trim() ? `/api/books?search=${encodeURIComponent(query)}` : '/api/books';
      const response = await fetch(url);

      if (response.ok) {
        let results = await response.json();

        // Apply category filter if selected
        if (selectedCategory) {
          results = results.filter((book: any) => book.categoryId === selectedCategory);
        }

        setBooks(results);
      }
    } catch (error) {
      console.error('Error searching books:', error);
    }
  };

  const handleCategoryChange = (categoryId: string | null) => {
    setSelectedCategory(categoryId);

    let filteredBooks = allBooks;

    // Apply search filter if exists
    if (searchQuery.trim()) {
      filteredBooks = allBooks.filter(book =>
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (categoryId) {
      filteredBooks = filteredBooks.filter(book => book.categoryId === categoryId);
    }

    setBooks(filteredBooks);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#f5f1e8] to-[#e5dcc8] dark:from-[#0f1419] dark:via-[#1a2028] dark:to-[#0f1419]">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12 islamic-pattern pb-8">
          <h1 className="text-5xl font-bold mb-4 islamic-gold-text arabic-text islamic-header">
            مرحباً بكم في المكتبة الإسلامية
          </h1>
          <p className="text-xl text-[#1a5f3f] dark:text-[#e8dcc4] arabic-text font-medium">
            مكتبة شاملة للكتب الفتوائية والفقهية
          </p>
          <div className="islamic-divider mt-6">
            <span className="islamic-divider-text">بسم الله الرحمن الرحيم</span>
          </div>
        </div>

        <SearchBar onSearch={handleSearch} />

        <CategoryFilter
          onCategoryChange={handleCategoryChange}
          selectedCategory={selectedCategory}
        />

        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-[#d4af37] border-t-transparent"></div>
            <p className="mt-6 text-xl text-[#1a5f3f] dark:text-[#d4af37] arabic-text font-semibold">
              جاري التحميل...
            </p>
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-6">📚</div>
            <p className="text-2xl text-[#1a5f3f] dark:text-[#d4af37] arabic-text font-bold">
              {searchQuery ? 'لم يتم العثور على نتائج' : 'لا توجد كتب متاحة حالياً'}
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6 text-center">
              <span className="text-[#1a5f3f] dark:text-[#d4af37] arabic-text font-semibold text-lg">
                عدد الكتب: {books.length}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {books.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
