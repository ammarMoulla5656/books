'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FiLayers,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiArrowLeft,
  FiSave,
  FiX,
  FiBook,
  FiStar,
  FiBookOpen,
  FiFeather,
  FiHeart,
  FiUser,
  FiClock,
  FiUsers,
} from 'react-icons/fi';

interface Category {
  id: string;
  name: string;
  arabicName: string;
  description?: string;
  icon?: string;
  order: number;
  _count?: {
    books: number;
  };
}

const iconMap: { [key: string]: any } = {
  FiBook,
  FiStar,
  FiBookOpen,
  FiFeather,
  FiHeart,
  FiUser,
  FiClock,
  FiUsers,
  FiLayers,
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    arabicName: '',
    description: '',
    icon: 'FiBook',
    order: 0,
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        arabicName: category.arabicName,
        description: category.description || '',
        icon: category.icon || 'FiBook',
        order: category.order,
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        arabicName: '',
        description: '',
        icon: 'FiBook',
        order: categories.length,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({
      name: '',
      arabicName: '',
      description: '',
      icon: 'FiBook',
      order: 0,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingCategory
        ? `/api/categories/${editingCategory.id}`
        : '/api/categories';
      const method = editingCategory ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        loadCategories();
        handleCloseModal();
      }
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const handleDelete = async (categoryId: string) => {
    if (deleteConfirm === categoryId) {
      try {
        const response = await fetch(`/api/categories/${categoryId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          loadCategories();
        }
      } catch (error) {
        console.error('Error deleting category:', error);
      }
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(categoryId);
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
      {/* Header */}
      <header className="bg-white dark:bg-[#1a2028] shadow-lg border-b-2 border-[#d4af37]/20 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/secret-admin-panel-xyz/dashboard"
                className="p-2 rounded-lg hover:bg-[#f5f1e8] dark:hover:bg-[#2d3748] transition-colors text-[#1a5f3f] dark:text-[#d4af37]"
              >
                <FiArrowLeft className="w-6 h-6" />
              </Link>
              <div className="p-3 rounded-lg bg-gradient-to-br from-orange-600 to-orange-500">
                <FiLayers className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#1a5f3f] dark:text-[#d4af37] arabic-text">
                  إدارة التصنيفات
                </h1>
                <p className="text-sm text-[#2d7a54] dark:text-[#e8dcc4]/70 arabic-text">
                  {categories.length} تصنيف
                </p>
              </div>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="islamic-button flex items-center gap-2"
            >
              <FiPlus className="w-5 h-5" />
              <span className="arabic-text">إضافة تصنيف</span>
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => {
            const IconComponent = iconMap[category.icon || 'FiBook'] || FiBook;

            return (
              <div
                key={category.id}
                className="islamic-card p-6 hover:scale-105 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-gradient-to-br from-[#1a5f3f] to-[#2d7a54]">
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#1a5f3f] dark:text-[#d4af37] arabic-text">
                        {category.arabicName}
                      </h3>
                      <p className="text-sm text-[#2d7a54] dark:text-[#e8dcc4]/70">
                        {category.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenModal(category)}
                      className="p-2 rounded-lg hover:bg-[#d4af37]/10 text-[#d4af37] transition-colors"
                      title="تعديل"
                    >
                      <FiEdit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        deleteConfirm === category.id
                          ? 'bg-red-500 text-white'
                          : 'hover:bg-red-500/10 text-red-600 dark:text-red-400'
                      }`}
                      title={
                        deleteConfirm === category.id
                          ? 'اضغط مرة أخرى للتأكيد'
                          : 'حذف'
                      }
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {category.description && (
                  <p className="text-sm text-[#2d7a54] dark:text-[#e8dcc4]/70 arabic-text mb-3">
                    {category.description}
                  </p>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-[#e5dcc8] dark:border-[#2d3748]">
                  <span className="text-sm text-[#2d7a54] dark:text-[#e8dcc4]/70 arabic-text">
                    {category._count?.books || 0} كتاب
                  </span>
                  <span className="text-xs text-[#2d7a54] dark:text-[#e8dcc4]/50 arabic-text">
                    الترتيب: {category.order}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="islamic-card max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#1a5f3f] dark:text-[#d4af37] arabic-text">
                {editingCategory ? 'تعديل التصنيف' : 'إضافة تصنيف جديد'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 rounded-lg hover:bg-[#f5f1e8] dark:hover:bg-[#2d3748] transition-colors text-[#1a5f3f] dark:text-[#d4af37]"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Arabic Name */}
              <div>
                <label className="block text-[#1a5f3f] dark:text-[#d4af37] arabic-text font-bold mb-2">
                  الاسم بالعربية *
                </label>
                <input
                  type="text"
                  value={formData.arabicName}
                  onChange={(e) =>
                    setFormData({ ...formData, arabicName: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg border-2 border-[#e5dcc8] dark:border-[#2d3748] bg-white dark:bg-[#141b22] text-[#1a5f3f] dark:text-[#e8dcc4] arabic-text"
                  placeholder="مثال: القرآن الكريم"
                  required
                />
              </div>

              {/* English Name */}
              <div>
                <label className="block text-[#1a5f3f] dark:text-[#d4af37] arabic-text font-bold mb-2">
                  الاسم بالإنجليزية *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg border-2 border-[#e5dcc8] dark:border-[#2d3748] bg-white dark:bg-[#141b22] text-[#1a5f3f] dark:text-[#e8dcc4]"
                  placeholder="Example: Quran"
                  required
                  dir="ltr"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-[#1a5f3f] dark:text-[#d4af37] arabic-text font-bold mb-2">
                  الوصف
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg border-2 border-[#e5dcc8] dark:border-[#2d3748] bg-white dark:bg-[#141b22] text-[#1a5f3f] dark:text-[#e8dcc4] arabic-text"
                  placeholder="وصف التصنيف..."
                  rows={3}
                />
              </div>

              {/* Icon */}
              <div>
                <label className="block text-[#1a5f3f] dark:text-[#d4af37] arabic-text font-bold mb-2">
                  الأيقونة
                </label>
                <select
                  value={formData.icon}
                  onChange={(e) =>
                    setFormData({ ...formData, icon: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg border-2 border-[#e5dcc8] dark:border-[#2d3748] bg-white dark:bg-[#141b22] text-[#1a5f3f] dark:text-[#e8dcc4] arabic-text"
                >
                  <option value="FiBook">كتاب (Book)</option>
                  <option value="FiStar">نجمة (Star)</option>
                  <option value="FiBookOpen">كتاب مفتوح (Book Open)</option>
                  <option value="FiFeather">ريشة (Feather)</option>
                  <option value="FiHeart">قلب (Heart)</option>
                  <option value="FiUser">مستخدم (User)</option>
                  <option value="FiClock">ساعة (Clock)</option>
                  <option value="FiUsers">مستخدمون (Users)</option>
                  <option value="FiLayers">طبقات (Layers)</option>
                </select>
              </div>

              {/* Order */}
              <div>
                <label className="block text-[#1a5f3f] dark:text-[#d4af37] arabic-text font-bold mb-2">
                  الترتيب
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) =>
                    setFormData({ ...formData, order: parseInt(e.target.value) })
                  }
                  className="w-full px-4 py-3 rounded-lg border-2 border-[#e5dcc8] dark:border-[#2d3748] bg-white dark:bg-[#141b22] text-[#1a5f3f] dark:text-[#e8dcc4]"
                  min="0"
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-3 rounded-lg bg-gray-500 text-white hover:bg-gray-600 transition-colors arabic-text font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="islamic-button flex items-center gap-2"
                >
                  <FiSave className="w-5 h-5" />
                  <span className="arabic-text">
                    {editingCategory ? 'حفظ التغييرات' : 'إضافة التصنيف'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
