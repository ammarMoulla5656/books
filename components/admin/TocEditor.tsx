'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface TocItem {
  id: string;
  title: string;
  pageNumber?: number;
  level: number;
  order: number;
  children?: TocItem[];
}

interface Category {
  id: string;
  name: string;
  arabicName: string;
}

export default function TocEditor({ uploadId }: { uploadId: string }) {
  const router = useRouter();

  const [toc, setToc] = useState<TocItem[]>([]);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedItem, setSelectedItem] = useState<TocItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch TOC and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tocRes, catRes] = await Promise.all([
          fetch(`/api/admin/documents/${uploadId}/toc`),
          fetch('/api/categories'),
        ]);

        if (!tocRes.ok) throw new Error('فشل جلب الفهرس');
        if (!catRes.ok) throw new Error('فشل جلب الفئات');

        const tocData = await tocRes.json();
        const catData = await catRes.json();

        setToc(tocData.toc || []);
        setTitle(tocData.detectedTitle || '');
        setAuthor(tocData.detectedAuthor || '');
        setCategories(catData.categories || catData || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'حدث خطأ');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [uploadId]);

  // Update TOC item
  const updateTocItem = (itemId: string, updates: Partial<TocItem>) => {
    const updateInArray = (items: TocItem[]): TocItem[] => {
      return items.map(item => {
        if (item.id === itemId) {
          return { ...item, ...updates };
        }
        if (item.children) {
          return { ...item, children: updateInArray(item.children) };
        }
        return item;
      });
    };

    setToc(updateInArray(toc));
  };

  // Delete TOC item
  const deleteTocItem = (itemId: string) => {
    const deleteFromArray = (items: TocItem[]): TocItem[] => {
      return items
        .filter(item => item.id !== itemId)
        .map(item => ({
          ...item,
          children: item.children ? deleteFromArray(item.children) : undefined,
        }));
    };

    setToc(deleteFromArray(toc));
    if (selectedItem?.id === itemId) {
      setSelectedItem(null);
    }
  };

  // Save and create book
  const handleSave = async () => {
    if (!selectedCategory) {
      setError('يرجى اختيار فئة للكتاب');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Save TOC updates
      await fetch(`/api/admin/documents/${uploadId}/toc`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toc, detectedTitle: title, detectedAuthor: author }),
      });

      // Create book
      const response = await fetch(`/api/admin/documents/${uploadId}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId: selectedCategory,
          title,
          author,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'فشل إنشاء الكتاب');
      }

      // Redirect to book page
      router.push(`/secret-admin-panel-xyz/books`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ');
    } finally {
      setSaving(false);
    }
  };

  // Render TOC tree
  const renderTocTree = (items: TocItem[], depth: number = 0) => {
    return items.map(item => (
      <div key={item.id} className={`${depth > 0 ? 'mr-6' : ''}`}>
        <div
          onClick={() => setSelectedItem(item)}
          className={`
            flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors
            ${selectedItem?.id === item.id
              ? 'bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700'
              : 'hover:bg-gray-50 dark:hover:bg-gray-700'
            }
          `}
        >
          {/* Level indicator */}
          <div className={`w-2 h-2 rounded-full ${
            item.level === 1 ? 'bg-emerald-500' :
            item.level === 2 ? 'bg-blue-500' : 'bg-gray-400'
          }`} />

          {/* Title */}
          <span className="flex-1 text-gray-800 dark:text-gray-200 truncate">
            {item.title}
          </span>

          {/* Page number */}
          {item.pageNumber && (
            <span className="text-sm text-gray-500">
              ص. {item.pageNumber}
            </span>
          )}
        </div>

        {/* Children */}
        {item.children && item.children.length > 0 && (
          <div className="border-r-2 border-gray-200 dark:border-gray-600 mr-4">
            {renderTocTree(item.children, depth + 1)}
          </div>
        )}
      </div>
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <svg className="w-8 h-8 text-emerald-600 animate-spin" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Book Info */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
          معلومات الكتاب
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              العنوان
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200
                focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="عنوان الكتاب"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              المؤلف
            </label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200
                focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="اسم المؤلف"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              الفئة *
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200
                focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="">اختر فئة...</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.arabicName || cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* TOC Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* TOC Tree */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              الفهرس المستخرج
            </h3>
            <span className="text-sm text-gray-500">
              {toc.length} فصل
            </span>
          </div>

          <div className="space-y-1 max-h-96 overflow-y-auto">
            {toc.length > 0 ? (
              renderTocTree(toc)
            ) : (
              <p className="text-gray-500 text-center py-8">
                لم يتم العثور على فهرس
              </p>
            )}
          </div>
        </div>

        {/* Edit Panel */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
            تحرير العنصر
          </h3>

          {selectedItem ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  العنوان
                </label>
                <input
                  type="text"
                  value={selectedItem.title}
                  onChange={(e) => updateTocItem(selectedItem.id, { title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                    bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200
                    focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    رقم الصفحة
                  </label>
                  <input
                    type="number"
                    value={selectedItem.pageNumber || ''}
                    onChange={(e) => updateTocItem(selectedItem.id, {
                      pageNumber: e.target.value ? parseInt(e.target.value) : undefined
                    })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                      bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200
                      focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    المستوى
                  </label>
                  <select
                    value={selectedItem.level}
                    onChange={(e) => updateTocItem(selectedItem.id, { level: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                      bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200
                      focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value={1}>المستوى 1 (كتاب/باب)</option>
                    <option value={2}>المستوى 2 (فصل)</option>
                    <option value={3}>المستوى 3 (مسألة)</option>
                  </select>
                </div>
              </div>

              <button
                onClick={() => deleteTocItem(selectedItem.id)}
                className="w-full py-2 px-4 border border-red-300 text-red-600 rounded-lg
                  hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                حذف هذا العنصر
              </button>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              اختر عنصراً من الفهرس للتحرير
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button
          onClick={handleSave}
          disabled={saving || !selectedCategory}
          className={`
            flex-1 py-3 px-6 rounded-xl font-semibold transition-colors
            ${saving || !selectedCategory
              ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }
          `}
        >
          {saving ? 'جاري الحفظ...' : 'حفظ وإنشاء الكتاب'}
        </button>

        <button
          onClick={() => router.push('/secret-admin-panel-xyz/books')}
          className="py-3 px-6 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200
            rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          إلغاء
        </button>
      </div>
    </div>
  );
}
