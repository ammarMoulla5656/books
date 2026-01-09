'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiTrash2, FiBook, FiBookmark } from 'react-icons/fi';
import { useVisitorTracking } from '@/lib/useVisitorTracking';

interface Bookmark {
  id: string;
  text: string;
  pageNumber?: number;
  book: {
    id: string;
    title: string;
    category: {
      arabicName: string;
    };
  };
  section: {
    title: string;
  };
  createdAt: string;
}

export default function BookmarksPage() {
  // Track bookmarks page visit
  useVisitorTracking('/bookmarks', 'page_view');

  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/bookmarks');
      if (response.ok) {
        const data = await response.json();
        setBookmarks(data);
      }
    } catch (error) {
      console.error('Error loading bookmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه العلامة المرجعية؟')) {
      return;
    }

    try {
      const response = await fetch(`/api/bookmarks/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setBookmarks(bookmarks.filter(b => b.id !== id));
      }
    } catch (error) {
      console.error('Error deleting bookmark:', error);
      alert('حدث خطأ أثناء حذف العلامة المرجعية');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300 arabic-text">
            جاري التحميل...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <FiBook className="w-8 h-8 text-green-600" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white arabic-text">
            العلامات المرجعية
          </h1>
        </div>

        {bookmarks.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <p className="text-xl text-gray-600 dark:text-gray-300 arabic-text">
              لا توجد علامات مرجعية حالياً
            </p>
            <p className="mt-2 text-gray-500 dark:text-gray-400 arabic-text">
              يمكنك إضافة علامات مرجعية عند قراءة الكتب
            </p>
            <Link
              href="/"
              className="inline-block mt-6 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors arabic-text"
            >
              تصفح الكتب
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookmarks.map((bookmark) => (
              <div
                key={bookmark.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <p className="text-gray-800 dark:text-gray-200 arabic-text leading-relaxed mb-3">
                      {bookmark.text}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <span className="arabic-text">
                        {new Date(bookmark.createdAt).toLocaleDateString('ar-EG', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(bookmark.id)}
                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    title="حذف"
                  >
                    <FiTrash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
