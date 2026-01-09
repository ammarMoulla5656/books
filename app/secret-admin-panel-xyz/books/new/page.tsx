'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FiArrowLeft,
  FiSave,
  FiPlus,
  FiTrash2,
  FiImage,
  FiUpload,
} from 'react-icons/fi';
import type { Book, Chapter, Section, Category } from '@/lib/types';

export default function NewBookPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
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
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const cats = await response.json();
        setCategories(cats);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
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

      const response = await fetch('/api/books', {
        method: 'POST',
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
        throw new Error('فشل حفظ الكتاب');
      }

      setSuccess(true);

      // Redirect after success
      setTimeout(() => {
        router.push('/secret-admin-panel-xyz/books');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء حفظ الكتاب');
    } finally {
      setSaving(false);
    }
  };

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
              <h1 className="text-2xl font-bold text-[#1a5f3f] dark:text-[#d4af37] arabic-text">
                إضافة كتاب جديد
              </h1>
            </div>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="islamic-button flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span className="arabic-text">جاري الحفظ...</span>
                </>
              ) : (
                <>
                  <FiSave className="w-5 h-5" />
                  <span className="arabic-text">حفظ الكتاب</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border-2 border-red-500 rounded-lg">
            <p className="text-red-500 arabic-text text-center font-bold">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-500/10 border-2 border-green-500 rounded-lg">
            <p className="text-green-500 arabic-text text-center font-bold">
              ✓ تم حفظ الكتاب بنجاح! جاري التحويل...
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info Card */}
          <div className="islamic-card p-6">
            <h2 className="text-2xl font-bold text-[#1a5f3f] dark:text-[#d4af37] arabic-text mb-6">
              المعلومات الأساسية
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div className="md:col-span-2">
                <label className="block text-[#1a5f3f] dark:text-[#d4af37] arabic-text font-bold mb-2">
                  عنوان الكتاب *
                </label>
                <input
                  type="text"
                  value={bookData.title}
                  onChange={(e) => setBookData({ ...bookData, title: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-lg border-2 border-[#e5dcc8] dark:border-[#2d3748] bg-white dark:bg-[#141b22] text-[#1a5f3f] dark:text-[#e8dcc4] focus:outline-none focus:border-[#d4af37] arabic-text"
                  placeholder="مثال: منهاج الصالحين"
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
                  onChange={(e) => setBookData({ ...bookData, author: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border-2 border-[#e5dcc8] dark:border-[#2d3748] bg-white dark:bg-[#141b22] text-[#1a5f3f] dark:text-[#e8dcc4] focus:outline-none focus:border-[#d4af37] arabic-text"
                  placeholder="مثال: السيد علي السيستاني"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-[#1a5f3f] dark:text-[#d4af37] arabic-text font-bold mb-2">
                  التصنيف *
                </label>
                <select
                  value={typeof bookData.category === 'string' ? bookData.category : ''}
                  onChange={(e) => setBookData({ ...bookData, category: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-lg border-2 border-[#e5dcc8] dark:border-[#2d3748] bg-white dark:bg-[#141b22] text-[#1a5f3f] dark:text-[#e8dcc4] focus:outline-none focus:border-[#d4af37] arabic-text"
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
                    💡 يمكنك رفع الصورة على Imgur أو Cloudinary أو أي خدمة استضافة صور ووضع الرابط هنا
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
                        <p className="text-[#1a5f3f] dark:text-[#d4af37] arabic-text font-bold mb-2">
                          ✅ معاينة الصورة
                        </p>
                        <p className="text-sm text-[#2d7a54] dark:text-[#e8dcc4]/70 arabic-text break-all">
                          {bookData.coverImage}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Chapters Card */}
          <div className="islamic-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#1a5f3f] dark:text-[#d4af37] arabic-text">
                الفصول والمحتوى
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

            {bookData.chapters && bookData.chapters.length > 0 ? (
              <div className="space-y-6">
                {bookData.chapters.map((chapter, chIndex) => (
                  <div
                    key={chapter.id}
                    className="p-6 bg-[#f5f1e8] dark:bg-[#141b22] rounded-lg border-2 border-[#e5dcc8] dark:border-[#2d3748]"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-bold text-[#1a5f3f] dark:text-[#d4af37] arabic-text">
                        الفصل {chIndex + 1}
                      </h3>
                      <button
                        type="button"
                        onClick={() => deleteChapter(chIndex)}
                        className="p-2 rounded-lg hover:bg-red-500/10 text-red-600 dark:text-red-400 transition-colors"
                      >
                        <FiTrash2 className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Chapter Title */}
                    <input
                      type="text"
                      value={chapter.title}
                      onChange={(e) => updateChapter(chIndex, 'title', e.target.value)}
                      className="w-full px-4 py-3 mb-4 rounded-lg border-2 border-[#e5dcc8] dark:border-[#2d3748] bg-white dark:bg-[#1a2028] text-[#1a5f3f] dark:text-[#e8dcc4] focus:outline-none focus:border-[#d4af37] arabic-text"
                      placeholder="عنوان الفصل"
                    />

                    {/* Add Section Button */}
                    <button
                      type="button"
                      onClick={() => addSection(chIndex)}
                      className="mb-4 px-4 py-2 rounded-lg bg-[#1a5f3f]/10 dark:bg-[#d4af37]/20 text-[#1a5f3f] dark:text-[#d4af37] hover:bg-[#1a5f3f]/20 dark:hover:bg-[#d4af37]/30 transition-colors flex items-center gap-2 arabic-text"
                    >
                      <FiPlus className="w-4 h-4" />
                      إضافة قسم
                    </button>

                    {/* Sections */}
                    {chapter.sections.map((section, secIndex) => (
                      <div
                        key={section.id}
                        className="p-4 bg-white dark:bg-[#1a2028] rounded-lg mb-3 border border-[#e5dcc8] dark:border-[#2d3748]"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <p className="text-sm font-bold text-[#2d7a54] dark:text-[#d4af37] arabic-text">
                            القسم {secIndex + 1}
                          </p>
                          <button
                            type="button"
                            onClick={() => deleteSection(chIndex, secIndex)}
                            className="p-1 rounded hover:bg-red-500/10 text-red-600 dark:text-red-400"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <input
                          type="text"
                          value={section.title}
                          onChange={(e) =>
                            updateSection(chIndex, secIndex, 'title', e.target.value)
                          }
                          className="w-full px-3 py-2 mb-2 rounded-lg border border-[#e5dcc8] dark:border-[#2d3748] bg-white dark:bg-[#141b22] text-[#1a5f3f] dark:text-[#e8dcc4] focus:outline-none focus:border-[#d4af37] arabic-text text-sm"
                          placeholder="عنوان القسم"
                        />

                        <textarea
                          value={section.content}
                          onChange={(e) =>
                            updateSection(chIndex, secIndex, 'content', e.target.value)
                          }
                          rows={4}
                          className="w-full px-3 py-2 rounded-lg border border-[#e5dcc8] dark:border-[#2d3748] bg-white dark:bg-[#141b22] text-[#1a5f3f] dark:text-[#e8dcc4] focus:outline-none focus:border-[#d4af37] arabic-text text-sm resize-none"
                          placeholder="محتوى القسم..."
                        ></textarea>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-[#2d7a54] dark:text-[#d4af37] arabic-text">
                <p className="text-lg mb-2">لا توجد فصول بعد</p>
                <p className="text-sm opacity-70">اضغط على "إضافة فصل" للبدء</p>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
