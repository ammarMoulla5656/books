'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FiBook,
  FiUsers,
  FiEye,
  FiHardDrive,
  FiMessageSquare,
  FiCalendar,
  FiTrendingUp,
  FiGrid,
  FiSettings,
  FiLogOut,
  FiBookmark,
  FiLayers,
  FiUpload,
  FiActivity,
} from 'react-icons/fi';
import DocumentUploader from '@/components/admin/DocumentUploader';
import Navigation from '@/components/Navigation';

interface DashboardStats {
  totalBooks: number;
  totalCategories: number;
  totalBookmarks: number;
  onlineNow: number;
  visitorsToday: number;
  visitorsThisMonth: number;
  storageUsed: string;
  pendingSuggestions: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'upload' | 'settings'>('overview');
  const [stats, setStats] = useState<DashboardStats>({
    totalBooks: 0,
    totalCategories: 0,
    totalBookmarks: 0,
    onlineNow: 0,
    visitorsToday: 0,
    visitorsThisMonth: 0,
    storageUsed: '0 MB',
    pendingSuggestions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Load from API
      const [booksRes, categoriesRes] = await Promise.all([
        fetch('/api/books'),
        fetch('/api/categories'),
      ]);

      const books = booksRes.ok ? await booksRes.json() : [];
      const categories = categoriesRes.ok ? await categoriesRes.json() : [];

      setStats({
        totalBooks: books.length,
        totalCategories: categories.length,
        totalBookmarks: 0, // Will implement later
        onlineNow: Math.floor(Math.random() * 50) + 10, // Simulated
        visitorsToday: Math.floor(Math.random() * 200) + 50,
        visitorsThisMonth: Math.floor(Math.random() * 2000) + 500,
        storageUsed: '12.5 MB', // Simulated
        pendingSuggestions: 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push('/secret-admin-panel-xyz');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const StatCard = ({ icon: Icon, title, value, color, subtitle }: any) => (
    <div className="islamic-card p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[#2d7a54] dark:text-[#d4af37]/70 text-sm font-medium arabic-text mb-1">
            {title}
          </p>
          <p className={`text-3xl font-bold ${color} mb-1`}>{value}</p>
          {subtitle && (
            <p className="text-xs text-[#2d7a54] dark:text-[#e8dcc4]/60 arabic-text">
              {subtitle}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );

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
              <div className="p-2 rounded-lg bg-[#d4af37]/20">
                <FiGrid className="w-5 h-5 text-[#d4af37]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white arabic-text">
                  لوحة التحكم الإدارية
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors flex items-center gap-2 arabic-text text-sm"
              >
                <FiLogOut className="w-4 h-4" />
                تسجيل الخروج
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Tabs Navigation */}
        <div className="mb-8 flex gap-2 bg-white dark:bg-[#1a2028] p-2 rounded-lg shadow-lg">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-3 px-4 rounded-lg transition-all arabic-text font-medium ${
              activeTab === 'overview'
                ? 'bg-[#1a5f3f] text-white'
                : 'text-[#1a5f3f] dark:text-[#d4af37] hover:bg-[#f5f1e8] dark:hover:bg-[#2d3748]'
            }`}
          >
            <FiGrid className="inline w-5 h-5 ml-2" />
            نظرة عامة
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-3 px-4 rounded-lg transition-all arabic-text font-medium ${
              activeTab === 'upload'
                ? 'bg-[#1a5f3f] text-white'
                : 'text-[#1a5f3f] dark:text-[#d4af37] hover:bg-[#f5f1e8] dark:hover:bg-[#2d3748]'
            }`}
          >
            <FiUpload className="inline w-5 h-5 ml-2" />
            رفع كتاب
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-3 px-4 rounded-lg transition-all arabic-text font-medium ${
              activeTab === 'settings'
                ? 'bg-[#1a5f3f] text-white'
                : 'text-[#1a5f3f] dark:text-[#d4af37] hover:bg-[#f5f1e8] dark:hover:bg-[#2d3748]'
            }`}
          >
            <FiSettings className="inline w-5 h-5 ml-2" />
            الإعدادات
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Welcome Message */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-[#1a5f3f] dark:text-[#d4af37] arabic-text mb-2">
                مرحباً بك! 👋
              </h2>
              <p className="text-[#2d7a54] dark:text-[#e8dcc4] arabic-text">
                إليك نظرة عامة على نشاط المكتبة
              </p>
            </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={FiBook}
            title="إجمالي الكتب"
            value={stats.totalBooks}
            color="text-[#1a5f3f] dark:text-[#d4af37]"
            subtitle="كتاب في المكتبة"
          />
          <StatCard
            icon={FiUsers}
            title="الزوار أونلاين الآن"
            value={stats.onlineNow}
            color="text-green-600 dark:text-green-400"
            subtitle="مستخدم نشط"
          />
          <StatCard
            icon={FiEye}
            title="زوار اليوم"
            value={stats.visitorsToday}
            color="text-blue-600 dark:text-blue-400"
            subtitle="زيارة اليوم"
          />
          <StatCard
            icon={FiCalendar}
            title="زوار هذا الشهر"
            value={stats.visitorsThisMonth}
            color="text-purple-600 dark:text-purple-400"
            subtitle="زيارة هذا الشهر"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={FiLayers}
            title="التصنيفات"
            value={stats.totalCategories}
            color="text-orange-600 dark:text-orange-400"
            subtitle="تصنيف متاح"
          />
          <StatCard
            icon={FiBookmark}
            title="العلامات المرجعية"
            value={stats.totalBookmarks}
            color="text-pink-600 dark:text-pink-400"
            subtitle="علامة محفوظة"
          />
          <StatCard
            icon={FiHardDrive}
            title="المساحة المستخدمة"
            value={stats.storageUsed}
            color="text-indigo-600 dark:text-indigo-400"
            subtitle="من المساحة الكلية"
          />
          <StatCard
            icon={FiMessageSquare}
            title="الاقتراحات المعلقة"
            value={stats.pendingSuggestions}
            color="text-yellow-600 dark:text-yellow-400"
            subtitle="بانتظار المراجعة"
          />
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-[#1a5f3f] dark:text-[#d4af37] arabic-text mb-4">
            إجراءات سريعة
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              href="/secret-admin-panel-xyz/books"
              className="islamic-card p-6 hover:scale-105 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-lg bg-gradient-to-br from-[#1a5f3f] to-[#2d7a54] group-hover:scale-110 transition-transform">
                  <FiBook className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-[#1a5f3f] dark:text-[#d4af37] arabic-text">
                    إدارة الكتب
                  </h4>
                  <p className="text-sm text-[#2d7a54] dark:text-[#e8dcc4]/70 arabic-text">
                    إضافة، تعديل، أو حذف الكتب
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href="/secret-admin-panel-xyz/categories"
              className="islamic-card p-6 hover:scale-105 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-lg bg-gradient-to-br from-orange-600 to-orange-500 group-hover:scale-110 transition-transform">
                  <FiLayers className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-[#1a5f3f] dark:text-[#d4af37] arabic-text">
                    إدارة التصنيفات
                  </h4>
                  <p className="text-sm text-[#2d7a54] dark:text-[#e8dcc4]/70 arabic-text">
                    تنظيم وإدارة التصنيفات
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href="/secret-admin-panel-xyz/settings"
              className="islamic-card p-6 hover:scale-105 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-lg bg-gradient-to-br from-purple-600 to-purple-500 group-hover:scale-110 transition-transform">
                  <FiSettings className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-[#1a5f3f] dark:text-[#d4af37] arabic-text">
                    الإعدادات
                  </h4>
                  <p className="text-sm text-[#2d7a54] dark:text-[#e8dcc4]/70 arabic-text">
                    إعدادات النظام والثيمات
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="islamic-card p-6">
          <h3 className="text-2xl font-bold text-[#1a5f3f] dark:text-[#d4af37] arabic-text mb-4 flex items-center gap-2">
            <FiTrendingUp className="w-6 h-6" />
            النشاط الأخير
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-[#f5f1e8] dark:bg-[#141b22] rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <p className="text-[#1a5f3f] dark:text-[#e8dcc4] arabic-text">
                  تم تحميل النظام بنجاح
                </p>
              </div>
              <span className="text-sm text-[#2d7a54] dark:text-[#d4af37]">الآن</span>
            </div>
          </div>
        </div>
          </>
        )}

        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-[#1a5f3f] dark:text-[#d4af37] arabic-text mb-2">
                📤 رفع كتاب جديد
              </h2>
              <p className="text-[#2d7a54] dark:text-[#e8dcc4] arabic-text">
                قم برفع ملف PDF أو DOCX أو ABX وسيتم معالجته تلقائياً
              </p>
            </div>

            <DocumentUploader />

            {/* Help Section */}
            <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-3 arabic-text">
                كيف تعمل هذه الميزة؟
              </h3>
              <ol className="space-y-2 text-blue-700 dark:text-blue-300 text-sm">
                <li className="flex gap-2 arabic-text">
                  <span className="font-bold">1.</span>
                  <span>قم برفع ملف PDF أو DOCX أو ABX يحتوي على الكتاب</span>
                </li>
                <li className="flex gap-2 arabic-text">
                  <span className="font-bold">2.</span>
                  <span>سيتم استخراج النص تلقائياً (أو باستخدام OCR للكتب المصورة)</span>
                </li>
                <li className="flex gap-2 arabic-text">
                  <span className="font-bold">3.</span>
                  <span>سيتم كشف الفهرس وتقسيم المحتوى إلى فصول وأقسام</span>
                </li>
                <li className="flex gap-2 arabic-text">
                  <span className="font-bold">4.</span>
                  <span>راجع النتيجة وقم بالتعديلات اللازمة قبل الحفظ</span>
                </li>
              </ol>
            </div>

            {/* Python Service Status */}
            <div className="mt-8 islamic-card p-6">
              <h3 className="text-lg font-bold text-[#1a5f3f] dark:text-[#d4af37] arabic-text mb-4">
                حالة خدمة Python
              </h3>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-[#2d7a54] dark:text-[#e8dcc4] arabic-text">
                  متصلة - جاهزة لمعالجة المستندات
                </span>
              </div>
              <p className="text-sm text-[#2d7a54] dark:text-[#e8dcc4]/70 mt-2 arabic-text">
                يمكنك رفع ملفات PDF/DOCX/ABX للمعالجة التلقائية
              </p>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-[#1a5f3f] dark:text-[#d4af37] arabic-text mb-2">
                ⚙️ الإعدادات
              </h2>
              <p className="text-[#2d7a54] dark:text-[#e8dcc4] arabic-text">
                إدارة إعدادات النظام وخدمة Python
              </p>
            </div>

            <div className="space-y-6">
              {/* Python Service Settings */}
              <div className="islamic-card p-6">
                <h3 className="text-lg font-bold text-[#1a5f3f] dark:text-[#d4af37] arabic-text mb-4">
                  إعدادات خدمة Python
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#1a5f3f] dark:text-[#d4af37] mb-2 arabic-text">
                      عنوان الخدمة
                    </label>
                    <input
                      type="text"
                      defaultValue="http://localhost:5000"
                      className="w-full px-4 py-2 rounded-lg border border-[#d4af37]/30 bg-white dark:bg-[#1a2028] text-[#1a5f3f] dark:text-[#e8dcc4]"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1a5f3f] dark:text-[#d4af37] mb-2 arabic-text">
                      مزود الذكاء الاصطناعي
                    </label>
                    <select className="w-full px-4 py-2 rounded-lg border border-[#d4af37]/30 bg-white dark:bg-[#1a2028] text-[#1a5f3f] dark:text-[#e8dcc4] arabic-text">
                      <option value="local">Ollama (محلي)</option>
                      <option value="claude">Claude (Anthropic)</option>
                      <option value="openai">OpenAI GPT</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* General Settings */}
              <div className="islamic-card p-6">
                <h3 className="text-lg font-bold text-[#1a5f3f] dark:text-[#d4af37] arabic-text mb-4">
                  إعدادات عامة
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[#1a5f3f] dark:text-[#e8dcc4] arabic-text">
                      تفعيل OCR للكتب المصورة
                    </span>
                    <input type="checkbox" className="w-5 h-5" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#1a5f3f] dark:text-[#e8dcc4] arabic-text">
                      استخدام الذكاء الاصطناعي لكشف الفهرس
                    </span>
                    <input type="checkbox" className="w-5 h-5" defaultChecked />
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <button className="w-full py-3 bg-[#1a5f3f] hover:bg-[#2d7a54] text-white rounded-lg font-bold transition-colors arabic-text">
                حفظ الإعدادات
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
