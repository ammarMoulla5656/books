'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FiMail, FiPhone, FiMapPin, FiSend, FiMessageSquare } from 'react-icons/fi';
import { useVisitorTracking } from '@/lib/useVisitorTracking';

export default function ContactPage() {
  // Track contact page visit
  useVisitorTracking('/contact', 'page_view');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // في التطبيق الحقيقي، سيتم إرسال البيانات إلى API
    console.log('Contact form submitted:', formData);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#f5f1e8] to-[#e5dcc8] dark:from-[#0f1419] dark:via-[#1a2028] dark:to-[#0f1419]">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-16 islamic-pattern pb-8">
          <h1 className="text-5xl font-bold mb-4 islamic-gold-text arabic-text islamic-header">
            اتصل بنا
          </h1>
          <p className="text-xl text-[#1a5f3f] dark:text-[#e8dcc4] arabic-text font-medium">
            نسعد بتواصلكم معنا
          </p>
          <div className="islamic-divider mt-6">
            <span className="islamic-divider-text">بسم الله الرحمن الرحيم</span>
          </div>
        </div>

        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="islamic-card p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 rounded-full bg-gradient-to-br from-[#1a5f3f] to-[#2d7a54] text-white">
                <FiMessageSquare className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-bold text-[#1a5f3f] dark:text-[#d4af37] arabic-text">
                أرسل رسالة
              </h2>
            </div>

            {submitted ? (
              <div className="bg-gradient-to-r from-[#1a5f3f] to-[#2d7a54] text-white p-6 rounded-lg text-center">
                <div className="text-5xl mb-4">✓</div>
                <h3 className="text-2xl font-bold mb-2 arabic-text">تم إرسال الرسالة بنجاح!</h3>
                <p className="arabic-text">شكراً لتواصلك معنا. سنرد عليك في أقرب وقت ممكن.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-[#1a5f3f] dark:text-[#d4af37] arabic-text font-semibold mb-2">
                    الاسم
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border-2 border-[#e5dcc8] dark:border-[#2d3748] bg-white dark:bg-[#141b22] text-[#1a5f3f] dark:text-[#e8dcc4] focus:outline-none focus:border-[#d4af37] arabic-text"
                    placeholder="أدخل اسمك"
                  />
                </div>

                <div>
                  <label className="block text-[#1a5f3f] dark:text-[#d4af37] arabic-text font-semibold mb-2">
                    البريد الإلكتروني
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border-2 border-[#e5dcc8] dark:border-[#2d3748] bg-white dark:bg-[#141b22] text-[#1a5f3f] dark:text-[#e8dcc4] focus:outline-none focus:border-[#d4af37]"
                    placeholder="example@email.com"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-[#1a5f3f] dark:text-[#d4af37] arabic-text font-semibold mb-2">
                    الموضوع
                  </label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border-2 border-[#e5dcc8] dark:border-[#2d3748] bg-white dark:bg-[#141b22] text-[#1a5f3f] dark:text-[#e8dcc4] focus:outline-none focus:border-[#d4af37] arabic-text"
                  >
                    <option value="">اختر الموضوع</option>
                    <option value="suggestion">اقتراح</option>
                    <option value="issue">مشكلة تقنية</option>
                    <option value="content">محتوى الكتب</option>
                    <option value="other">أخرى</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#1a5f3f] dark:text-[#d4af37] arabic-text font-semibold mb-2">
                    الرسالة
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 rounded-lg border-2 border-[#e5dcc8] dark:border-[#2d3748] bg-white dark:bg-[#141b22] text-[#1a5f3f] dark:text-[#e8dcc4] focus:outline-none focus:border-[#d4af37] arabic-text resize-none"
                    placeholder="اكتب رسالتك هنا..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full islamic-button flex items-center justify-center gap-3 text-lg"
                >
                  <FiSend className="w-5 h-5" />
                  <span className="arabic-text">إرسال الرسالة</span>
                </button>
              </form>
            )}
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            {/* Info Card */}
            <div className="islamic-card p-8">
              <h2 className="text-3xl font-bold text-[#1a5f3f] dark:text-[#d4af37] arabic-text mb-6">
                معلومات التواصل
              </h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-gradient-to-br from-[#1a5f3f] to-[#2d7a54] text-white">
                    <FiMail className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#1a5f3f] dark:text-[#d4af37] arabic-text mb-2">
                      البريد الإلكتروني
                    </h3>
                    <p className="text-[#2d7a54] dark:text-[#e8dcc4]" dir="ltr">
                      info@islamic-library.com
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-gradient-to-br from-[#1a5f3f] to-[#2d7a54] text-white">
                    <FiPhone className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#1a5f3f] dark:text-[#d4af37] arabic-text mb-2">
                      الهاتف
                    </h3>
                    <p className="text-[#2d7a54] dark:text-[#e8dcc4]" dir="ltr">
                      +964 XXX XXX XXXX
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-gradient-to-br from-[#1a5f3f] to-[#2d7a54] text-white">
                    <FiMapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#1a5f3f] dark:text-[#d4af37] arabic-text mb-2">
                      العنوان
                    </h3>
                    <p className="text-[#2d7a54] dark:text-[#e8dcc4] arabic-text">
                      النجف الأشرف، العراق
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Working Hours */}
            <div className="islamic-card p-8">
              <h2 className="text-2xl font-bold text-[#1a5f3f] dark:text-[#d4af37] arabic-text mb-4">
                أوقات العمل
              </h2>
              <div className="space-y-3 text-[#2d7a54] dark:text-[#e8dcc4] arabic-text">
                <div className="flex justify-between">
                  <span>السبت - الخميس</span>
                  <span dir="ltr">9:00 AM - 5:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>الجمعة</span>
                  <span>مغلق</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="islamic-card p-8">
              <h2 className="text-2xl font-bold text-[#1a5f3f] dark:text-[#d4af37] arabic-text mb-4">
                روابط سريعة
              </h2>
              <div className="space-y-3">
                <Link
                  href="/"
                  className="block text-[#2d7a54] dark:text-[#e8dcc4] arabic-text hover:text-[#d4af37] transition-colors"
                >
                  → الصفحة الرئيسية
                </Link>
                <Link
                  href="/about"
                  className="block text-[#2d7a54] dark:text-[#e8dcc4] arabic-text hover:text-[#d4af37] transition-colors"
                >
                  → من نحن
                </Link>
                <Link
                  href="/bookmarks"
                  className="block text-[#2d7a54] dark:text-[#e8dcc4] arabic-text hover:text-[#d4af37] transition-colors"
                >
                  → العلامات المرجعية
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
