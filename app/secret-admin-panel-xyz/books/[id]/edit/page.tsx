'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  FiArrowLeft,
  FiSave,
  FiPlus,
  FiTrash2,
  FiImage,
  FiLoader,
} from 'react-icons/fi';
import type { Book, Chapter, Section, Category } from '@/lib/types';

export default function EditBookPage() {
  const router = useRouter();
  const params = useParams();
  const bookId = params.id as string;

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [bookData, setBookData] = useState<Partial<Book>>({
    title: '',
    author: '',
    category: '',
    coverImage: '',
    chapters: [],
    order: 0,
  });

  useEffect(() => {
    loadData();
  }, [bookId]);

  const loadData = async () => {
    try {
      // Load categories and book data in parallel
      const [categoriesRes, bookRes] = await Promise.all([
        fetch('/api/categories'),
        fetch(`/api/books/${bookId}`),
      ]);

      if (categoriesRes.ok) {
        const cats = await categoriesRes.json();
        setCategories(cats);
      }

      if (bookRes.ok) {
        const book = await bookRes.json();
        setBookData({
          title: book.title,
          author: book.author || '',
          category: book.category?.arabicName || '',
          coverImage: book.coverImage || '',
          chapters: book.chapters || [],
          order: book.order || 0,
        });
      } else {
        setError('فشل تحميل بيانات الكتاب');
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setError('حدث خطأ أثناء تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUrlChange = (url: string) => {
    setBookData({ ...bookData, coverImage: url });
  };

  const addChapter = () => {
    const newChapter: Chapter = {
      id: `ch-${Date.now()}`,
      title: '',
      sections: [],
    };
    setBookData({
      ...bookData,
      chapters: [...(bookData.chapters || []), newChapter],
    });
  };

  const updateChapter = (index: number, field: string, value: string) => {
    const updatedChapters = [...(bookData.chapters || [])];
    updatedChapters[index] = { ...updatedChapters[index], [field]: value };
    setBookData({ ...bookData, chapters: updatedChapters });
  };

  const deleteChapter = (index: number) => {
    const updatedChapters = bookData.chapters?.filter((_, i) => i !== index);
    setBookData({ ...bookData, chapters: updatedChapters });
  };

  const addSection = (chapterIndex: number) => {
    const newSection: Section = {
      id: `sec-${Date.now()}`,
      title: '',
      content: '',
    };
    const updatedChapters = [...(bookData.chapters || [])];
    updatedChapters[chapterIndex].sections.push(newSection);
    setBookData({ ...bookData, chapters: updatedChapters });
  };

  const updateSection = (
    chapterIndex: number,
    sectionIndex: number,
    field: string,
    value: string
  ) => {
    const updatedChapters = [...(bookData.chapters || [])];
    updatedChapters[chapterIndex].sections[sectionIndex] = {
      ...updatedChapters[chapterIndex].sections[sectionIndex],
      [field]: value,
    };
    setBookData({ ...bookData, chapters: updatedChapters });
  };

  const deleteSection = (chapterIndex: number, sectionIndex: number) => {
    const updatedChapters = [...(bookData.chapters || [])];
    updatedChapters[chapterIndex].sections = updatedChapters[
      chapterIndex
    ].sections.filter((_, i) => i !== sectionIndex);
    setBookData({ ...bookData, chapters: updatedChapters });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      // Validation
      if (!bookData.title?.trim()) {
        setError('عنوان الكتاب مطلوب');
        return;
      }
      if (!bookData.category) {
        setError('التصنيف مطلوب');
        return;
      }

      // Find category ID
      const selectedCategory = categories.find(c => c.arabicName === bookData.category);
      if (!selectedCategory) {
        setError('التصنيف المحدد غير موجود');
        return;
      }

      const response = await fetch(`/api/books/${bookId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: bookData.title,
          author: bookData.author || '',
          coverImage: bookData.coverImage || '',
          categoryId: selectedCategory.id,
          order: bookData.order || 0,
          chapters: bookData.chapters || [],
        }),
      });

      if (!response.ok) {
        throw new Error('فشل تحديث الكتاب');
      }

      setSuccess(true);

      // Redirect after success
      setTimeout(() => {
        router.push('/secret-admin-panel-xyz/books');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء تحديث الكتاب');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-[#f5f1e8] to-[#e5dcc8] dark:from-[#0f1419] dark:via-[#1a2028] dark:to-[#0f1419] flex items-center justify-center">
        <div className="text-center">
          <FiLoader className="w-16 h-16 text-[#d4af37] animate-spin mx-auto mb-4" />
          <p className="text-xl text-[#1a5f3f] dark:text-[#d4af37] arabic-text">
            جاري التحميل...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#f5f1e8] to-[#e5dcc8] dark:from-[#0f1419] dark:via-[#1a2028] dark:to-[#0f1419]">
      {/* Header */}
      <header className="bg-white dark:bg-[#1a2028] shadow-lg border-b-2 border-[#d4af37]/20 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/secret-admin-panel-xyz/books"
                className="p-2 rounded-lg hover:bg-[#f5f1e8] dark:hover:bg-[#2d3748] transition-colors text-[#1a5f3f] dark:text-[#d4af37]"
              >
                <FiArrowLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-[#1a5f3f] dark:text-[#d4af37] arabic-text">
                  تعديل الكتاب
                </h1>
                <p className="text-sm text-[#2d7a54] dark:text-[#e8dcc4]/70 arabic-text">
                  {bookData.title}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-500/10 border-2 border-green-500 rounded-lg">
              <p className="text-green-600 dark:text-green-400 arabic-text font-bold text-center">
                ✅ تم تحديث الكتاب بنجاح!
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border-2 border-red-500 rounded-lg">
              <p className="text-red-600 dark:text-red-400 arabic-text font-bold text-center">
                ❌ {error}
              </p>
            </div>
          )}

          {/* Basic Info */}
          <div className="islamic-card p-6 mb-6">
            <h2 className="text-xl font-bold text-[#1a5f3f] dark:text-[#d4af37] arabic-text mb-4">
              المعلومات الأساسية
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Title */}
              <div className="md:col-span-2">
                <label className="block text-[#1a5f3f] dark:text-[#d4af37] arabic-text font-bold mb-2">
                  عنوان الكتاب *
                </label>
                <input
                  type="text"
                  value={bookData.title}
                  onChange={(e) =>
                    setBookData({ ...bookData, title: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg border-2 border-[#e5dcc8] dark:border-[#2d3748] bg-white dark:bg-[#141b22] text-[#1a5f3f] dark:text-[#e8dcc4] placeholder-[#2d7a54]/50 dark:placeholder-[#d4af37]/50 focus:outline-none focus:border-[#d4af37] arabic-text text-lg"
                  placeholder="أدخل عنوان الكتاب"
                  required
                />
              </div>

              {/* Author */}
              <div>
                <label className="block text-[#1a5f3f] dark:text-[#d4af37] arabic-text font-bold mb-2">
                  المؤلف
                </label>
                <input
                  type="text"
                  value={bookData.author}
                  onChange={(e) =>
                    setBookData({ ...bookData, author: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg border-2 border-[#e5dcc8] dark:border-[#2d3748] bg-white dark:bg-[#141b22] text-[#1a5f3f] dark:text-[#e8dcc4] placeholder-[#2d7a54]/50 dark:placeholder-[#d4af37]/50 focus:outline-none focus:border-[#d4af37] arabic-text text-lg"
                  placeholder="اسم المؤلف"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-[#1a5f3f] dark:text-[#d4af37] arabic-text font-bold mb-2">
                  التصنيف *
                </label>
                <select
                  value={bookData.category}
                  onChange={(e) =>
                    setBookData({ ...bookData, category: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg border-2 border-[#e5dcc8] dark:border-[#2d3748] bg-white dark:bg-[#141b22] text-[#1a5f3f] dark:text-[#e8dcc4] focus:outline-none focus:border-[#d4af37] arabic-text text-lg"
                  required
                >
                  <option value="">اختر التصنيف</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.arabicName}>
                      {cat.arabicName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Cover Image */}
              <div className="md:col-span-2">
                <label className="block text-[#1a5f3f] dark:text-[#d4af37] arabic-text font-bold mb-2">
                  صورة الغلاف (رابط URL)
                </label>
                <div className="space-y-3">
                  <input
                    type="url"
                    value={bookData.coverImage}
                    onChange={(e) => handleImageUrlChange(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border-2 border-[#e5dcc8] dark:border-[#2d3748] bg-white dark:bg-[#141b22] text-[#1a5f3f] dark:text-[#e8dcc4] focus:outline-none focus:border-[#d4af37]"
                    placeholder="https://example.com/image.jpg"
                    dir="ltr"
                  />
                  <p className="text-sm text-[#2d7a54] dark:text-[#e8dcc4]/70 arabic-text">
                    💡 يمكنك رفع الصورة على Imgur أو Cloudinary ووضع الرابط هنا
                  </p>
                  {bookData.coverImage && (
                    <div className="flex items-start gap-4 p-4 bg-[#f5f1e8] dark:bg-[#141b22] rounded-lg">
                      <img
                        src={bookData.coverImage}
                        alt="Cover preview"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '';
                          (e.target as HTMLImageElement).alt = '❌ فشل تحميل الصورة';
                        }}
                        className="w-32 h-44 object-cover rounded-lg shadow-lg"
                      />
                      <div className="flex-1">
                        <p className="text-sm text-[#1a5f3f] dark:text-[#d4af37] arabic-text font-bold mb-1">
                          معاينة الصورة
                        </p>
                        <p className="text-xs text-[#2d7a54] dark:text-[#e8dcc4]/70 break-all">
                          {bookData.coverImage}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Chapters */}
          <div className="islamic-card p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[#1a5f3f] dark:text-[#d4af37] arabic-text">
                الفصول ({bookData.chapters?.length || 0})
              </h2>
              <button
                type="button"
                onClick={addChapter}
                className="islamic-button flex items-center gap-2"
              >
                <FiPlus className="w-5 h-5" />
                <span className="arabic-text">إضافة فصل</span>
              </button>
            </div>

            <div className="space-y-4">
              {bookData.chapters?.map((chapter, chIndex) => (
                <div
                  key={chapter.id}
                  className="p-4 bg-[#f5f1e8] dark:bg-[#141b22] rounded-lg"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <input
                      type="text"
                      value={chapter.title}
                      onChange={(e) =>
                        updateChapter(chIndex, 'title', e.target.value)
                      }
                      className="flex-1 px-4 py-2 rounded-lg border-2 border-[#e5dcc8] dark:border-[#2d3748] bg-white dark:bg-[#1a2028] text-[#1a5f3f] dark:text-[#e8dcc4] arabic-text"
                      placeholder={`عنوان الفصل ${chIndex + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => addSection(chIndex)}
                      className="px-4 py-2 rounded-lg bg-[#1a5f3f] text-white hover:bg-[#2d7a54] transition-colors flex items-center gap-2"
                    >
                      <FiPlus className="w-4 h-4" />
                      <span className="arabic-text text-sm">قسم</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteChapter(chIndex)}
                      className="p-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Sections */}
                  <div className="space-y-2 mr-4">
                    {chapter.sections.map((section, sIndex) => (
                      <div
                        key={section.id}
                        className="p-3 bg-white dark:bg-[#1a2028] rounded-lg"
                      >
                        <div className="flex items-start gap-2 mb-2">
                          <input
                            type="text"
                            value={section.title}
                            onChange={(e) =>
                              updateSection(chIndex, sIndex, 'title', e.target.value)
                            }
                            className="flex-1 px-3 py-2 rounded-lg border border-[#e5dcc8] dark:border-[#2d3748] bg-[#f5f1e8] dark:bg-[#141b22] text-[#1a5f3f] dark:text-[#e8dcc4] arabic-text text-sm"
                            placeholder={`عنوان القسم ${sIndex + 1}`}
                          />
                          <button
                            type="button"
                            onClick={() => deleteSection(chIndex, sIndex)}
                            className="p-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <textarea
                          value={section.content}
                          onChange={(e) =>
                            updateSection(chIndex, sIndex, 'content', e.target.value)
                          }
                          className="w-full px-3 py-2 rounded-lg border border-[#e5dcc8] dark:border-[#2d3748] bg-[#f5f1e8] dark:bg-[#141b22] text-[#1a5f3f] dark:text-[#e8dcc4] arabic-text text-sm"
                          placeholder="محتوى القسم..."
                          rows={4}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Link
              href="/secret-admin-panel-xyz/books"
              className="px-6 py-3 rounded-lg bg-gray-500 text-white hover:bg-gray-600 transition-colors arabic-text font-bold"
            >
              إلغاء
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="islamic-button flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <FiLoader className="w-5 h-5 animate-spin" />
                  <span className="arabic-text">جاري الحفظ...</span>
                </>
              ) : (
                <>
                  <FiSave className="w-5 h-5" />
                  <span className="arabic-text">حفظ التغييرات</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
