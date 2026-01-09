'use client';

import Link from 'next/link';
import { FiBook, FiHeart, FiUsers, FiTarget } from 'react-icons/fi';
import { useVisitorTracking } from '@/lib/useVisitorTracking';

export default function AboutPage() {
  // Track about page visit
  useVisitorTracking('/about', 'page_view');

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#f5f1e8] to-[#e5dcc8] dark:from-[#0f1419] dark:via-[#1a2028] dark:to-[#0f1419]">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-16 islamic-pattern pb-8">
          <h1 className="text-5xl font-bold mb-4 islamic-gold-text arabic-text islamic-header">
            من نحن
          </h1>
          <div className="islamic-divider mt-6">
            <span className="islamic-divider-text">بسم الله الرحمن الرحيم</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Introduction */}
          <div className="islamic-card p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 rounded-full bg-gradient-to-br from-[#1a5f3f] to-[#2d7a54] text-white">
                <FiBook className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-bold text-[#1a5f3f] dark:text-[#d4af37] arabic-text">
                مكتبتنا
              </h2>
            </div>
            <p className="text-lg text-[#1a5f3f] dark:text-[#e8dcc4] arabic-text leading-relaxed mb-4">
              المكتبة الإسلامية هي مشروع رقمي شامل يهدف إلى توفير الكتب الإسلامية الفتوائية والفقهية بطريقة سهلة ومنظمة. نسعى لجعل العلم الشرعي متاحاً للجميع في أي وقت ومن أي مكان.
            </p>
            <p className="text-lg text-[#1a5f3f] dark:text-[#e8dcc4] arabic-text leading-relaxed">
              تحتوي مكتبتنا على مجموعة واسعة من الكتب المعتمدة من مراجع الدين والعلماء، مع واجهة عصرية وسهلة الاستخدام تدعم اللغة العربية بالكامل.
            </p>
          </div>

          {/* Mission */}
          <div className="islamic-card p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 rounded-full bg-gradient-to-br from-[#1a5f3f] to-[#2d7a54] text-white">
                <FiTarget className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-bold text-[#1a5f3f] dark:text-[#d4af37] arabic-text">
                رسالتنا
              </h2>
            </div>
            <ul className="space-y-4 text-lg text-[#1a5f3f] dark:text-[#e8dcc4] arabic-text">
              <li className="flex items-start gap-3">
                <span className="text-[#d4af37] text-2xl">✦</span>
                <span>نشر العلم الشرعي والمعرفة الإسلامية الصحيحة</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#d4af37] text-2xl">✦</span>
                <span>توفير مصادر موثوقة ومعتمدة للباحثين والدارسين</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#d4af37] text-2xl">✦</span>
                <span>تسهيل الوصول إلى الكتب الفقهية والفتوائية</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#d4af37] text-2xl">✦</span>
                <span>خدمة المجتمع الإسلامي بتقديم محتوى علمي موثوق</span>
              </li>
            </ul>
          </div>

          {/* Features */}
          <div className="islamic-card p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 rounded-full bg-gradient-to-br from-[#1a5f3f] to-[#2d7a54] text-white">
                <FiHeart className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-bold text-[#1a5f3f] dark:text-[#d4af37] arabic-text">
                مميزات المكتبة
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 bg-gradient-to-br from-white to-[#f5f1e8] dark:from-[#141b22] dark:to-[#1a2028] rounded-lg border border-[#e5dcc8] dark:border-[#2d3748]">
                <h3 className="text-xl font-bold text-[#1a5f3f] dark:text-[#d4af37] arabic-text mb-3">
                  📚 مكتبة شاملة
                </h3>
                <p className="text-[#2d7a54] dark:text-[#e8dcc4] arabic-text">
                  مجموعة واسعة من الكتب الفقهية والفتوائية المعتمدة
                </p>
              </div>
              <div className="p-6 bg-gradient-to-br from-white to-[#f5f1e8] dark:from-[#141b22] dark:to-[#1a2028] rounded-lg border border-[#e5dcc8] dark:border-[#2d3748]">
                <h3 className="text-xl font-bold text-[#1a5f3f] dark:text-[#d4af37] arabic-text mb-3">
                  🔍 بحث متقدم
                </h3>
                <p className="text-[#2d7a54] dark:text-[#e8dcc4] arabic-text">
                  إمكانية البحث الفوري في جميع الكتب والمحتويات
                </p>
              </div>
              <div className="p-6 bg-gradient-to-br from-white to-[#f5f1e8] dark:from-[#141b22] dark:to-[#1a2028] rounded-lg border border-[#e5dcc8] dark:border-[#2d3748]">
                <h3 className="text-xl font-bold text-[#1a5f3f] dark:text-[#d4af37] arabic-text mb-3">
                  🔖 علامات مرجعية
                </h3>
                <p className="text-[#2d7a54] dark:text-[#e8dcc4] arabic-text">
                  حفظ المواضع المهمة والرجوع إليها بسهولة
                </p>
              </div>
              <div className="p-6 bg-gradient-to-br from-white to-[#f5f1e8] dark:from-[#141b22] dark:to-[#1a2028] rounded-lg border border-[#e5dcc8] dark:border-[#2d3748]">
                <h3 className="text-xl font-bold text-[#1a5f3f] dark:text-[#d4af37] arabic-text mb-3">
                  🌙 وضع ليلي
                </h3>
                <p className="text-[#2d7a54] dark:text-[#e8dcc4] arabic-text">
                  قراءة مريحة في أي وقت مع الوضع الليلي
                </p>
              </div>
              <div className="p-6 bg-gradient-to-br from-white to-[#f5f1e8] dark:from-[#141b22] dark:to-[#1a2028] rounded-lg border border-[#e5dcc8] dark:border-[#2d3748]">
                <h3 className="text-xl font-bold text-[#1a5f3f] dark:text-[#d4af37] arabic-text mb-3">
                  ⚙️ إعدادات القراءة
                </h3>
                <p className="text-[#2d7a54] dark:text-[#e8dcc4] arabic-text">
                  تحكم كامل في حجم الخط وتباعد الأسطر
                </p>
              </div>
              <div className="p-6 bg-gradient-to-br from-white to-[#f5f1e8] dark:from-[#141b22] dark:to-[#1a2028] rounded-lg border border-[#e5dcc8] dark:border-[#2d3748]">
                <h3 className="text-xl font-bold text-[#1a5f3f] dark:text-[#d4af37] arabic-text mb-3">
                  📱 متجاوب
                </h3>
                <p className="text-[#2d7a54] dark:text-[#e8dcc4] arabic-text">
                  يعمل على جميع الأجهزة - حاسوب، لوحي، وجوال
                </p>
              </div>
            </div>
          </div>

          {/* Team */}
          <div className="islamic-card p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 rounded-full bg-gradient-to-br from-[#1a5f3f] to-[#2d7a54] text-white">
                <FiUsers className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-bold text-[#1a5f3f] dark:text-[#d4af37] arabic-text">
                فريق العمل
              </h2>
            </div>
            <p className="text-lg text-[#1a5f3f] dark:text-[#e8dcc4] arabic-text leading-relaxed mb-6">
              نحن فريق من المطورين والمتخصصين في التقنية، نعمل بشغف على تطوير هذه المكتبة لخدمة المجتمع الإسلامي. نسعى دائماً لتحسين وتطوير المكتبة بإضافة محتويات جديدة ومميزات أفضل.
            </p>
            <p className="text-lg text-[#1a5f3f] dark:text-[#e8dcc4] arabic-text leading-relaxed">
              نرحب بمساهماتكم واقتراحاتكم لتطوير المكتبة وجعلها أكثر فائدة للجميع.
            </p>
          </div>

          {/* Call to Action */}
          <div className="text-center space-y-6 py-8">
            <div className="islamic-divider">
              <span className="islamic-divider-text">تواصل معنا</span>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/contact" className="islamic-button">
                اتصل بنا
              </Link>
              <Link href="/" className="islamic-button">
                تصفح الكتب
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
