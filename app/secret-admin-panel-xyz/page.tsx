'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiMail, FiLock, FiLogIn, FiEye, FiEyeOff } from 'react-icons/fi';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [stayLoggedIn, setStayLoggedIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
    <div className="min-h-screen bg-gradient-to-br from-[#0f1419] via-[#1a2028] to-[#0f1419] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#1a5f3f] to-[#2d7a54] mb-4">
            <span className="text-4xl">🔐</span>
          </div>
          <h1 className="text-3xl font-bold text-[#d4af37] arabic-text mb-2">
            لوحة التحكم الإدارية
          </h1>
          <p className="text-[#e8dcc4] arabic-text">
            المكتبة الإسلامية
          </p>
        </div>

        {/* Login Form */}
        <div className="islamic-card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-500/10 border-2 border-red-500 rounded-lg">
                <p className="text-red-500 arabic-text text-center">{error}</p>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-[#d4af37] arabic-text font-semibold mb-2">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <FiMail className="absolute right-3 top-1/2 -translate-y-1/2 text-[#d4af37] w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pr-12 pl-4 py-3 rounded-lg border-2 border-[#2d3748] bg-[#141b22] text-[#e8dcc4] focus:outline-none focus:border-[#d4af37] transition-colors"
                  placeholder="admin@example.com"
                  dir="ltr"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-[#d4af37] arabic-text font-semibold mb-2">
                كلمة المرور
              </label>
              <div className="relative">
                <FiLock className="absolute right-3 top-1/2 -translate-y-1/2 text-[#d4af37] w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pr-12 pl-12 py-3 rounded-lg border-2 border-[#2d3748] bg-[#141b22] text-[#e8dcc4] focus:outline-none focus:border-[#d4af37] transition-colors"
                  placeholder="••••••••"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#d4af37] hover:text-[#e5c35a] transition-colors"
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
                className="w-5 h-5 rounded border-2 border-[#2d3748] bg-[#141b22] text-[#d4af37] focus:ring-2 focus:ring-[#d4af37]"
              />
              <label htmlFor="stayLoggedIn" className="text-[#e8dcc4] arabic-text cursor-pointer">
                البقاء مسجلاً للدخول
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full islamic-button flex items-center justify-center gap-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
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

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-lg">
            <p className="text-[#d4af37] text-sm arabic-text text-center">
              🔒 هذه لوحة تحكم محمية. الدخول للمصرح لهم فقط.
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[#e8dcc4]/60 text-sm mt-6 arabic-text">
          المكتبة الإسلامية © 2024
        </p>
      </div>
    </div>
  );
}
