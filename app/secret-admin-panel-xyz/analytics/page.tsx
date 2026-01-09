'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FiTrendingUp,
  FiArrowLeft,
  FiUsers,
  FiEye,
  FiBook,
  FiCalendar,
  FiDownload,
  FiActivity,
  FiClock,
  FiBarChart2,
} from 'react-icons/fi';

interface AnalyticsData {
  totalVisitors: number;
  todayVisitors: number;
  weekVisitors: number;
  monthVisitors: number;
  totalBooks: number;
  totalCategories: number;
  totalBookmarks: number;
  averageReadTime: number;
  popularBooks: Array<{ title: string; views: number }>;
  recentActivity: Array<{ action: string; time: string; details: string }>;
  dailyStats: Array<{ date: string; visitors: number; pageViews: number }>;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      const response = await fetch(`/api/analytics?range=${timeRange}`);
      if (response.ok) {
        const analyticsData = await response.json();
        setData(analyticsData);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    if (!data) return;

    const csvContent = [
      ['Metric', 'Value'],
      ['Total Visitors', data.totalVisitors],
      ['Today Visitors', data.todayVisitors],
      ['Week Visitors', data.weekVisitors],
      ['Month Visitors', data.monthVisitors],
      ['Total Books', data.totalBooks],
      ['Total Categories', data.totalCategories],
      ['Total Bookmarks', data.totalBookmarks],
      ['Average Read Time', `${data.averageReadTime} min`],
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-[#f5f1e8] to-[#e5dcc8] dark:from-[#0f1419] dark:via-[#1a2028] dark:to-[#0f1419] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#d4af37] border-t-transparent mx-auto mb-4"></div>
          <p className="text-xl text-[#1a5f3f] dark:text-[#d4af37] arabic-text">
            جاري تحميل البيانات...
          </p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-[#f5f1e8] to-[#e5dcc8] dark:from-[#0f1419] dark:via-[#1a2028] dark:to-[#0f1419] flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-[#1a5f3f] dark:text-[#d4af37] arabic-text">
            فشل تحميل البيانات
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
              <div className="p-3 rounded-lg bg-gradient-to-br from-blue-600 to-blue-500">
                <FiTrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#1a5f3f] dark:text-[#d4af37] arabic-text">
                  التحليلات والإحصائيات
                </h1>
                <p className="text-sm text-[#2d7a54] dark:text-[#e8dcc4]/70 arabic-text">
                  نظرة شاملة على أداء الموقع
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Time Range Selector */}
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="px-4 py-2 rounded-lg border-2 border-[#e5dcc8] dark:border-[#2d3748] bg-white dark:bg-[#1a2028] text-[#1a5f3f] dark:text-[#e8dcc4] arabic-text"
              >
                <option value="week">آخر أسبوع</option>
                <option value="month">آخر شهر</option>
                <option value="year">آخر سنة</option>
              </select>

              {/* Export Button */}
              <button
                onClick={exportData}
                className="islamic-button flex items-center gap-2"
              >
                <FiDownload className="w-5 h-5" />
                <span className="arabic-text">تصدير البيانات</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="islamic-card p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[#2d7a54] dark:text-[#d4af37]/70 text-sm font-medium arabic-text mb-1">
                  إجمالي الزوار
                </p>
                <p className="text-3xl font-bold text-[#1a5f3f] dark:text-[#d4af37]">
                  {data.totalVisitors.toLocaleString()}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 arabic-text mt-1">
                  ↑ +12% من الشهر الماضي
                </p>
              </div>
              <div className="p-3 rounded-lg bg-blue-500/10">
                <FiUsers className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="islamic-card p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[#2d7a54] dark:text-[#d4af37]/70 text-sm font-medium arabic-text mb-1">
                  زوار اليوم
                </p>
                <p className="text-3xl font-bold text-[#1a5f3f] dark:text-[#d4af37]">
                  {data.todayVisitors}
                </p>
                <p className="text-xs text-[#2d7a54] dark:text-[#e8dcc4]/60 arabic-text mt-1">
                  نشط الآن: {Math.floor(data.todayVisitors * 0.15)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-green-500/10">
                <FiEye className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="islamic-card p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[#2d7a54] dark:text-[#d4af37]/70 text-sm font-medium arabic-text mb-1">
                  إجمالي الكتب
                </p>
                <p className="text-3xl font-bold text-[#1a5f3f] dark:text-[#d4af37]">
                  {data.totalBooks}
                </p>
                <p className="text-xs text-[#2d7a54] dark:text-[#e8dcc4]/60 arabic-text mt-1">
                  {data.totalCategories} تصنيف
                </p>
              </div>
              <div className="p-3 rounded-lg bg-orange-500/10">
                <FiBook className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </div>

          <div className="islamic-card p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[#2d7a54] dark:text-[#d4af37]/70 text-sm font-medium arabic-text mb-1">
                  متوسط وقت القراءة
                </p>
                <p className="text-3xl font-bold text-[#1a5f3f] dark:text-[#d4af37]">
                  {data.averageReadTime}
                </p>
                <p className="text-xs text-[#2d7a54] dark:text-[#e8dcc4]/60 arabic-text mt-1">
                  دقيقة
                </p>
              </div>
              <div className="p-3 rounded-lg bg-purple-500/10">
                <FiClock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts and Detailed Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Daily Stats Chart */}
          <div className="islamic-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[#1a5f3f] dark:text-[#d4af37] arabic-text flex items-center gap-2">
                <FiBarChart2 className="w-5 h-5" />
                الإحصائيات اليومية
              </h2>
            </div>

            <div className="space-y-3">
              {data.dailyStats.slice(0, 7).map((stat, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-24 text-sm text-[#2d7a54] dark:text-[#e8dcc4]/70 arabic-text">
                    {stat.date}
                  </div>
                  <div className="flex-1">
                    <div className="h-8 bg-[#f5f1e8] dark:bg-[#141b22] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#1a5f3f] to-[#2d7a54] rounded-full flex items-center justify-end px-3"
                        style={{
                          width: `${(stat.visitors / Math.max(...data.dailyStats.map((s) => s.visitors))) * 100}%`,
                        }}
                      >
                        <span className="text-xs text-white font-bold">
                          {stat.visitors}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-[#2d7a54] dark:text-[#e8dcc4]/70">
                    {stat.pageViews} صفحة
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Popular Books */}
          <div className="islamic-card p-6">
            <h2 className="text-xl font-bold text-[#1a5f3f] dark:text-[#d4af37] arabic-text mb-4 flex items-center gap-2">
              <FiActivity className="w-5 h-5" />
              الكتب الأكثر مشاهدة
            </h2>

            <div className="space-y-3">
              {data.popularBooks.map((book, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-[#f5f1e8] dark:bg-[#141b22] rounded-lg"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-[#1a5f3f] to-[#2d7a54] text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-[#1a5f3f] dark:text-[#e8dcc4] arabic-text font-bold">
                      {book.title}
                    </p>
                  </div>
                  <div className="text-[#d4af37] font-bold">
                    {book.views.toLocaleString()}
                    <span className="text-xs text-[#2d7a54] dark:text-[#e8dcc4]/70 mr-1 arabic-text">
                      مشاهدة
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="islamic-card p-6">
          <h2 className="text-xl font-bold text-[#1a5f3f] dark:text-[#d4af37] arabic-text mb-4 flex items-center gap-2">
            <FiCalendar className="w-5 h-5" />
            النشاط الأخير
          </h2>

          <div className="space-y-3">
            {data.recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 bg-[#f5f1e8] dark:bg-[#141b22] rounded-lg hover:bg-[#e5dcc8] dark:hover:bg-[#1a2028] transition-colors"
              >
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <div className="flex-1">
                  <p className="text-[#1a5f3f] dark:text-[#e8dcc4] arabic-text font-bold">
                    {activity.action}
                  </p>
                  <p className="text-sm text-[#2d7a54] dark:text-[#e8dcc4]/70 arabic-text">
                    {activity.details}
                  </p>
                </div>
                <span className="text-sm text-[#2d7a54] dark:text-[#d4af37]">
                  {activity.time}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="islamic-card p-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 mb-3">
              <FiUsers className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-3xl font-bold text-[#1a5f3f] dark:text-[#d4af37] mb-1">
              {data.weekVisitors}
            </p>
            <p className="text-sm text-[#2d7a54] dark:text-[#e8dcc4]/70 arabic-text">
              زوار هذا الأسبوع
            </p>
          </div>

          <div className="islamic-card p-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/10 mb-3">
              <FiCalendar className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-[#1a5f3f] dark:text-[#d4af37] mb-1">
              {data.monthVisitors}
            </p>
            <p className="text-sm text-[#2d7a54] dark:text-[#e8dcc4]/70 arabic-text">
              زوار هذا الشهر
            </p>
          </div>

          <div className="islamic-card p-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-500/10 mb-3">
              <FiBook className="w-8 h-8 text-orange-600 dark:text-orange-400" />
            </div>
            <p className="text-3xl font-bold text-[#1a5f3f] dark:text-[#d4af37] mb-1">
              {data.totalBookmarks}
            </p>
            <p className="text-sm text-[#2d7a54] dark:text-[#e8dcc4]/70 arabic-text">
              علامة مرجعية
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
