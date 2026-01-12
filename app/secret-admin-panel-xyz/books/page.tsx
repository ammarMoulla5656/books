'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FiBook,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiArrowLeft,
  FiImage,
  FiEye,
  FiUpload,
} from 'react-icons/fi';
import type { Book } from '@/lib/types';
import Navigation from '@/components/Navigation';

export default function AdminBooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadBooks();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = books.filter(
        (book: any) =>
          book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          book.category?.arabicName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          book.author?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredBooks(filtered);
    } else {
      setFilteredBooks(books);
    }
  }, [searchQuery, books]);

  const loadBooks = async () => {
    try {
      const response = await fetch('/api/books');
      if (response.ok) {
        const booksData = await response.json();
        setBooks(booksData);
        setFilteredBooks(booksData);
      }
    } catch (error) {
      console.error('Error loading books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (bookId: string) => {
    if (deleteConfirm === bookId) {
      try {
        const response = await fetch(`/api/books/${bookId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          loadBooks();
        }
      } catch (error) {
        console.error('Error deleting book:', error);
      }
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(bookId);
      // Reset confirm after 3 seconds
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-[#f5f1e8] to-[#e5dcc8] dark:from-[#0f1419] dark:via-[#1a2028] dark:to-[#0f1419] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#d4af37] border-t-transparent mx-auto mb-4"></div>
          <p className="text-xl text-[#1a5f3f] dark:text-[#d4af37] arabic-text">
            جاري التحميل...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#f5f1e8] to-[#e5dcc8] dark:from-[#0f1419] dark:via-[#1a2028] dark:to-[#0f1419]">
      {/* Use main site Navigation */}
      <Navigation />

      {/* Admin Sub-header */}
      <div className="bg-[#1a5f3f] dark:bg-[#0d1419] border-b-2 border-[#d4af37]/30">
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/secret-admin-panel-xyz/dashboard"
                className="p-2 rounded-lg hover:bg-[#d4af37]/20 transition-colors text-[#d4af37]"
              >
                <FiArrowLeft className="w-5 h-5" />
              </Link>
              <div className="p-2 rounded-lg bg-[#d4af37]/20">
                <FiBook className="w-5 h-5 text-[#d4af37]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white arabic-text">
                  إدارة الكتب
                </h2>
                <p className="text-sm text-[#d4af37]/80 arabic-text">
                  {filteredBooks.length} كتاب
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/secret-admin-panel-xyz/books/upload"
                className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-[#d4af37] text-[#d4af37] hover:bg-[#d4af37] hover:text-white transition-colors text-sm"
              >
                <FiUpload className="w-4 h-4" />
                <span className="arabic-text">رفع من ملف</span>
              </Link>
              <Link
                href="/secret-admin-panel-xyz/books/new"
                className="islamic-button flex items-center gap-2 text-sm"
              >
                <FiPlus className="w-4 h-4" />
                <span className="arabic-text">إضافة كتاب جديد</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <FiSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-[#d4af37] w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن كتاب..."
              className="w-full pr-12 pl-4 py-3 rounded-xl border-2 border-[#e5dcc8] dark:border-[#2d3748] bg-white dark:bg-[#1a2028] text-[#1a5f3f] dark:text-[#e8dcc4] placeholder-[#2d7a54]/50 dark:placeholder-[#d4af37]/50 focus:outline-none focus:border-[#d4af37] arabic-text text-lg"
            />
          </div>
        </div>

        {/* Books Table */}
        <div className="islamic-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-[#1a5f3f] to-[#2d7a54] text-white">
                <tr>
                  <th className="px-6 py-4 text-right arabic-text font-bold">الغلاف</th>
                  <th className="px-6 py-4 text-right arabic-text font-bold">العنوان</th>
                  <th className="px-6 py-4 text-right arabic-text font-bold">التصنيف</th>
                  <th className="px-6 py-4 text-right arabic-text font-bold">المؤلف</th>
                  <th className="px-6 py-4 text-right arabic-text font-bold">الفصول</th>
                  <th className="px-6 py-4 text-right arabic-text font-bold">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5dcc8] dark:divide-[#2d3748]">
                {filteredBooks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="text-[#2d7a54] dark:text-[#d4af37] arabic-text">
                        <FiBook className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p className="text-xl font-bold mb-2">
                          {searchQuery ? 'لا توجد نتائج' : 'لا توجد كتب'}
                        </p>
                        <p className="text-sm opacity-70">
                          {searchQuery ? 'حاول البحث بكلمات أخرى' : 'ابدأ بإضافة كتاب جديد'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredBooks.map((book) => (
                    <tr
                      key={book.id}
                      className="hover:bg-[#f5f1e8] dark:hover:bg-[#141b22] transition-colors"
                    >
                      <td className="px-6 py-4">
                        {book.coverImage ? (
                          <img
                            src={book.coverImage}
                            alt={book.title}
                            className="w-12 h-16 object-cover rounded-lg shadow-md"
                          />
                        ) : (
                          <div className="w-12 h-16 rounded-lg bg-gradient-to-br from-[#1a5f3f] to-[#2d7a54] flex items-center justify-center">
                            <FiImage className="w-6 h-6 text-white" />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-[#1a5f3f] dark:text-[#e8dcc4] arabic-text font-bold">
                          {book.title}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full bg-[#1a5f3f]/10 dark:bg-[#d4af37]/20 text-[#1a5f3f] dark:text-[#d4af37] text-sm arabic-text">
                          {(book as any).category?.arabicName || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-[#2d7a54] dark:text-[#e8dcc4]/70 arabic-text">
                          {book.author || '-'}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-[#2d7a54] dark:text-[#e8dcc4]/70 arabic-text">
                          {book.chapters?.length || 0} فصل
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/books/${book.id}`}
                            target="_blank"
                            className="p-2 rounded-lg hover:bg-blue-500/10 text-blue-600 dark:text-blue-400 transition-colors"
                            title="معاينة"
                          >
                            <FiEye className="w-5 h-5" />
                          </Link>
                          <Link
                            href={`/secret-admin-panel-xyz/books/${book.id}/edit`}
                            className="p-2 rounded-lg hover:bg-[#d4af37]/10 text-[#d4af37] transition-colors"
                            title="تعديل"
                          >
                            <FiEdit2 className="w-5 h-5" />
                          </Link>
                          <button
                            onClick={() => handleDelete(book.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              deleteConfirm === book.id
                                ? 'bg-red-500 text-white'
                                : 'hover:bg-red-500/10 text-red-600 dark:text-red-400'
                            }`}
                            title={
                              deleteConfirm === book.id
                                ? 'اضغط مرة أخرى للتأكيد'
                                : 'حذف'
                            }
                          >
                            <FiTrash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
