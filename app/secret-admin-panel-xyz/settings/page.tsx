'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FiSettings,
  FiArrowLeft,
  FiSave,
  FiSun,
  FiMoon,
  FiImage,
  FiUpload,
  FiCheck,
} from 'react-icons/fi';

interface ThemeBackground {
  id?: string;
  name: string;
  imageUrl: string;
}

export default function SettingsPage() {
  const [dayBackground, setDayBackground] = useState('');
  const [nightBackground, setNightBackground] = useState('');
  const [siteName, setSiteName] = useState('المكتبة الإسلامية');
  const [siteDescription, setSiteDescription] = useState('مكتبة شاملة للكتب الإسلامية');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // Load settings from API
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data = await response.json();
        if (data.dayBackground) setDayBackground(data.dayBackground);
        if (data.nightBackground) setNightBackground(data.nightBackground);
        if (data.siteName) setSiteName(data.siteName);
        if (data.siteDescription) setSiteDescription(data.siteDescription);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dayBackground,
          nightBackground,
          siteName,
          siteDescription,
        }),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
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
          <div className="flex items-center gap-4">
            <Link
              href="/secret-admin-panel-xyz/dashboard"
              className="p-2 rounded-lg hover:bg-[#f5f1e8] dark:hover:bg-[#2d3748] transition-colors text-[#1a5f3f] dark:text-[#d4af37]"
            >
              <FiArrowLeft className="w-6 h-6" />
            </Link>
            <div className="p-3 rounded-lg bg-gradient-to-br from-purple-600 to-purple-500">
              <FiSettings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#1a5f3f] dark:text-[#d4af37] arabic-text">
                الإعدادات
              </h1>
              <p className="text-sm text-[#2d7a54] dark:text-[#e8dcc4]/70 arabic-text">
                إدارة إعدادات الموقع والثيمات
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
          {/* Success Message */}
          {success && (
            <div className="islamic-card p-4 bg-green-500/10 border-2 border-green-500">
              <div className="flex items-center gap-3 text-green-600 dark:text-green-400">
                <FiCheck className="w-6 h-6" />
                <p className="arabic-text font-bold">تم حفظ الإعدادات بنجاح!</p>
              </div>
            </div>
          )}

          {/* Site Information */}
          <div className="islamic-card p-6">
            <h2 className="text-xl font-bold text-[#1a5f3f] dark:text-[#d4af37] arabic-text mb-4">
              معلومات الموقع
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-[#1a5f3f] dark:text-[#d4af37] arabic-text font-bold mb-2">
                  اسم الموقع
                </label>
                <input
                  type="text"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border-2 border-[#e5dcc8] dark:border-[#2d3748] bg-white dark:bg-[#141b22] text-[#1a5f3f] dark:text-[#e8dcc4] arabic-text"
                  placeholder="مثال: المكتبة الإسلامية"
                />
              </div>

              <div>
                <label className="block text-[#1a5f3f] dark:text-[#d4af37] arabic-text font-bold mb-2">
                  وصف الموقع
                </label>
                <textarea
                  value={siteDescription}
                  onChange={(e) => setSiteDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border-2 border-[#e5dcc8] dark:border-[#2d3748] bg-white dark:bg-[#141b22] text-[#1a5f3f] dark:text-[#e8dcc4] arabic-text"
                  placeholder="وصف مختصر للموقع..."
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Theme Backgrounds */}
          <div className="islamic-card p-6">
            <h2 className="text-xl font-bold text-[#1a5f3f] dark:text-[#d4af37] arabic-text mb-4">
              خلفيات الثيمات
            </h2>

            <div className="space-y-6">
              {/* Day Mode Background */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-yellow-500/20">
                    <FiSun className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <label className="text-[#1a5f3f] dark:text-[#d4af37] arabic-text font-bold">
                    خلفية النهار (w.jpg)
                  </label>
                </div>

                <input
                  type="url"
                  value={dayBackground}
                  onChange={(e) => setDayBackground(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border-2 border-[#e5dcc8] dark:border-[#2d3748] bg-white dark:bg-[#141b22] text-[#1a5f3f] dark:text-[#e8dcc4]"
                  placeholder="https://example.com/day-background.jpg"
                  dir="ltr"
                />

                {dayBackground && (
                  <div className="mt-3 p-3 bg-[#f5f1e8] dark:bg-[#141b22] rounded-lg">
                    <p className="text-sm text-[#2d7a54] dark:text-[#e8dcc4]/70 arabic-text mb-2">
                      معاينة:
                    </p>
                    <div
                      className="w-full h-40 rounded-lg bg-cover bg-center"
                      style={{ backgroundImage: `url(${dayBackground})` }}
                    />
                  </div>
                )}

                <p className="mt-2 text-xs text-[#2d7a54] dark:text-[#e8dcc4]/70 arabic-text">
                  💡 ارفع الصورة على Imgur أو Cloudinary وضع الرابط هنا
                </p>
              </div>

              {/* Night Mode Background */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-blue-500/20">
                    <FiMoon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <label className="text-[#1a5f3f] dark:text-[#d4af37] arabic-text font-bold">
                    خلفية الليل (d.jpg)
                  </label>
                </div>

                <input
                  type="url"
                  value={nightBackground}
                  onChange={(e) => setNightBackground(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border-2 border-[#e5dcc8] dark:border-[#2d3748] bg-white dark:bg-[#141b22] text-[#1a5f3f] dark:text-[#e8dcc4]"
                  placeholder="https://example.com/night-background.jpg"
                  dir="ltr"
                />

                {nightBackground && (
                  <div className="mt-3 p-3 bg-[#f5f1e8] dark:bg-[#141b22] rounded-lg">
                    <p className="text-sm text-[#2d7a54] dark:text-[#e8dcc4]/70 arabic-text mb-2">
                      معاينة:
                    </p>
                    <div
                      className="w-full h-40 rounded-lg bg-cover bg-center"
                      style={{ backgroundImage: `url(${nightBackground})` }}
                    />
                  </div>
                )}

                <p className="mt-2 text-xs text-[#2d7a54] dark:text-[#e8dcc4]/70 arabic-text">
                  💡 ارفع الصورة على Imgur أو Cloudinary وضع الرابط هنا
                </p>
              </div>
            </div>
          </div>

          {/* Image Upload Guidelines */}
          <div className="islamic-card p-6 bg-blue-500/5 border-2 border-blue-500/20">
            <div className="flex items-start gap-3">
              <FiImage className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-blue-600 dark:text-blue-400 arabic-text mb-2">
                  نصائح لرفع الصور
                </h3>
                <ul className="space-y-2 text-sm text-[#1a5f3f] dark:text-[#e8dcc4] arabic-text">
                  <li className="flex items-start gap-2">
                    <span className="text-[#d4af37]">•</span>
                    <span>استخدم خدمات رفع الصور مثل Imgur أو Cloudinary</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#d4af37]">•</span>
                    <span>تأكد أن الرابط ينتهي بامتداد الصورة (.jpg, .png, .webp)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#d4af37]">•</span>
                    <span>استخدم صور عالية الجودة للحصول على أفضل مظهر</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#d4af37]">•</span>
                    <span>الدقة الموصى بها: 1920x1080 أو أعلى</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="islamic-button flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiSave className="w-5 h-5" />
              <span className="arabic-text">
                {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
