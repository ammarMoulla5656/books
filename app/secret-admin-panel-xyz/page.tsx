'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FiMail, FiLock, FiLogIn, FiEye, FiEyeOff, FiArrowRight,
  FiBook, FiSearch, FiMessageCircle, FiFileText, FiSettings, FiTrendingUp
} from 'react-icons/fi';

interface Feature {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  status: 'active' | 'inactive';
}

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [stayLoggedIn, setStayLoggedIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showFeatures, setShowFeatures] = useState(false);

  const features: Feature[] = [
    {
      id: 'text-finder',
      name: 'أين ورد النص',
      icon: '🔍',
      description: 'محرك بحث متقدم لإيجاد النصوص في جميع الكتب',
      color: 'from-blue-500 to-blue-600',
      status: 'active'
    },
    {
      id: 'smart-fetch',
      name: 'جلب النص الذكي',
      icon: '📖',
      description: 'البحث الذكي عن نصوص مشابهة وذات صلة',
      color: 'from-green-500 to-green-600',
      status: 'active'
    },
    {
      id: 'ai-chat',
      name: 'المحادثة الذكية',
      icon: '🤖',
      description: 'محادثة تفاعلية مع مساعد ذكي متقدم',
      color: 'from-purple-500 to-purple-600',
      status: 'active'
    },
    {
      id: 'report-editor',
      name: 'محرر التقارير',
      icon: '📝',
      description: 'محرر نصوص متقدم مع أدوات تنسيق كاملة',
      color: 'from-orange-500 to-orange-600',
      status: 'active'
    },
    {
      id: 'context-menu',
      name: 'قائمة السياق',
      icon: '⚙️',
      description: 'قائمة ذكية توفر 9 خيارات متقدمة',
      color: 'from-red-500 to-red-600',
      status: 'active'
    },
    {
      id: 'analytics',
      name: 'التحليلات والإحصائيات',
      icon: '📊',
      description: 'تتبع الاستخدام والإحصائيات المتقدمة',
      color: 'from-indigo-500 to-indigo-600',
      status: 'active'
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, stayLoggedIn }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'فشل تسجيل الدخول');
        return;
      }

      // Redirect to dashboard
      router.push('/secret-admin-panel-xyz/dashboard');
    } catch (err) {
      setError('حدث خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1419] via-[#1a2028] to-[#0f1419]">
      {/* Header with Features Preview */}
      <div className="fixed top-0 right-0 p-4 z-10">
        <button
          onClick={() => setShowFeatures(!showFeatures)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#d4af37]/20 border border-[#d4af37]/50 text-[#d4af37] hover:bg-[#d4af37]/30 transition-colors arabic-text"
        >
          <FiTrendingUp className="w-5 h-5" />
          المزايا الجديدة
        </button>
      </div>

      {/* Features Modal */}
      {showFeatures && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <div className="bg-[#1a2028] border-2 border-[#d4af37] rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 p-6 border-b border-[#d4af37]/30 bg-[#1a2028]">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-[#d4af37] arabic-text">المزايا المتقدمة الجديدة</h2>
                <button
                  onClick={() => setShowFeatures(false)}
                  className="text-[#e8dcc4] hover:text-[#d4af37] transition-colors"
                >
                  ✕
                </button>
              </div>
              <p className="text-[#e8dcc4] arabic-text mt-2">تم تطوير 6 مزايا جديدة متقدمة</p>
            </div>

            {/* Features Grid */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {features.map((feature) => (
                <div
                  key={feature.id}
                  className="p-4 rounded-lg bg-gradient-to-br from-[#141b22] to-[#1a2028] border border-[#2d3748] hover:border-[#d4af37] transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{feature.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-bold text-[#d4af37] arabic-text">{feature.name}</h3>
                      <p className="text-sm text-[#e8dcc4] arabic-text mt-1">{feature.description}</p>
                      <div className="flex items-center gap-2 mt-3">
                        <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                        <span className="text-xs text-green-500 arabic-text">نشط الآن</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-[#d4af37]/30 bg-[#1a2028]">
              <p className="text-sm text-[#e8dcc4] arabic-text text-center">
                ✨ تم دمج جميع المزايا في الواجهة الرئيسية والسياق الذكي
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Login Container */}
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#0d7377] to-[#14919b] mb-4 shadow-lg">
              <span className="text-4xl">📚</span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#0d7377] to-[#14919b] bg-clip-text text-transparent mb-2">
              <span className="block arabic-text">لوحة التحكم</span>
              <span className="block arabic-text text-2xl mt-2">المكتبة الإسلامية</span>
            </h1>
            <div className="flex items-center justify-center gap-2 mt-4">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[#0d7377]"></div>
              <span className="text-[#0d7377] text-sm arabic-text">الإدارة المتقدمة</span>
              <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[#0d7377]"></div>
            </div>
          </div>

          {/* Login Form */}
          <div className="islamic-card p-8 border-2 border-[#0d7377]/30">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-500/10 border-2 border-red-500 rounded-lg">
                  <p className="text-red-500 arabic-text text-center">{error}</p>
                </div>
              )}

              {/* Email Field */}
              <div>
                <label className="block text-[#0d7377] arabic-text font-semibold mb-2">
                  البريد الإلكتروني
                </label>
                <div className="relative">
                  <FiMail className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0d7377] w-5 h-5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pr-12 pl-4 py-3 rounded-lg border-2 border-[#0d7377]/30 bg-[#0d7377]/5 text-[#0f1419] focus:outline-none focus:border-[#0d7377] focus:bg-white transition-colors placeholder-gray-500"
                    placeholder="admin@example.com"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-[#0d7377] arabic-text font-semibold mb-2">
                  كلمة المرور
                </label>
                <div className="relative">
                  <FiLock className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0d7377] w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pr-12 pl-12 py-3 rounded-lg border-2 border-[#0d7377]/30 bg-[#0d7377]/5 text-[#0f1419] focus:outline-none focus:border-[#0d7377] focus:bg-white transition-colors placeholder-gray-500"
                    placeholder="••••••••"
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0d7377] hover:text-[#14919b] transition-colors"
                  >
                    {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Stay Logged In */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="stayLoggedIn"
                  checked={stayLoggedIn}
                  onChange={(e) => setStayLoggedIn(e.target.checked)}
                  className="w-5 h-5 rounded border-2 border-[#0d7377]/50 bg-[#0d7377]/10 text-[#0d7377] focus:ring-2 focus:ring-[#0d7377]"
                />
                <label htmlFor="stayLoggedIn" className="text-[#0f1419] arabic-text cursor-pointer">
                  البقاء مسجلاً للدخول
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#0d7377] to-[#14919b] hover:from-[#0d7377]/90 hover:to-[#14919b]/90 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span className="arabic-text">جاري تسجيل الدخول...</span>
                  </>
                ) : (
                  <>
                    <FiLogIn className="w-5 h-5" />
                    <span className="arabic-text">تسجيل الدخول</span>
                  </>
                )}
              </button>
            </form>

            {/* Features Showcase */}
            <div className="mt-6 space-y-3">
              <p className="text-sm text-[#0f1419] arabic-text font-semibold text-center">
                المزايا المتاحة:
              </p>
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2 bg-blue-50 rounded text-center">
                  <span className="text-lg">🔍</span>
                  <p className="text-xs text-[#0f1419] arabic-text mt-1">البحث</p>
                </div>
                <div className="p-2 bg-green-50 rounded text-center">
                  <span className="text-lg">🤖</span>
                  <p className="text-xs text-[#0f1419] arabic-text mt-1">AI</p>
                </div>
                <div className="p-2 bg-purple-50 rounded text-center">
                  <span className="text-lg">📝</span>
                  <p className="text-xs text-[#0f1419] arabic-text mt-1">التقارير</p>
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="mt-6 p-4 bg-[#0d7377]/10 border-l-4 border-[#0d7377] rounded">
              <p className="text-[#0d7377] text-sm arabic-text">
                🔒 هذه لوحة تحكم محمية. الدخول للمصرح لهم فقط.
              </p>
            </div>
          </div>

          {/* Features Info */}
          <div className="mt-6 p-4 bg-[#0d7377]/20 border border-[#0d7377]/50 rounded-lg">
            <p className="text-[#0f1419] text-sm arabic-text text-center">
              ✨ تم تطوير 6 مزايا جديدة | انقر أعلى لرؤية التفاصيل
            </p>
          </div>

          {/* Footer */}
          <p className="text-center text-[#0f1419]/60 text-sm mt-6 arabic-text">
            المكتبة الإسلامية © 2024 | جميع الحقوق محفوظة
          </p>
        </div>
      </div>
    </div>
  );
}
