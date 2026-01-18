'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AIFeatures from '@/components/AIFeatures';

interface Category {
  id: string;
  arabicName: string;
  icon: string;
  _count?: { books: number };
}

interface Book {
  id: string;
  title: string;
  author: string;
  coverImage?: string;
  category: any;
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load categories
      const categoriesRes = await fetch('/api/categories');
      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData);
      }

      // Load books
      const booksRes = await fetch('/api/books');
      if (booksRes.ok) {
        const booksData = await booksRes.json();
        setBooks(booksData.slice(0, 6)); // First 6 books
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <main style={{ paddingTop: 'var(--header-height)' }}>
      {/* قسم البطل - Hero Section */}
      <section className="hero">
        <div className="hero-bg islamic-pattern"></div>
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              المكتبة الإسلامية
              <span className="hero-title-accent">الذكية</span>
            </h1>
            <p className="hero-subtitle">
              اكتشف كنوز المعرفة الإسلامية من كتب أهل البيت عليهم السلام
              <br />
              مدعومة بتقنيات الذكاء الاصطناعي للتلخيص والشرح والبحث الذكي
            </p>

            {/* شريط البحث */}
            <form onSubmit={handleSearch} className="search-bar">
              <input
                type="text"
                className="search-input"
                placeholder="ابحث عن كتاب، مؤلف، أو موضوع..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoComplete="off"
              />
              <button type="submit" className="search-btn" aria-label="بحث">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </button>
            </form>

            <div className="hero-stats">
              <div className="hero-stat">
                <span className="hero-stat-number">300+</span>
                <span className="hero-stat-label">كتاب</span>
              </div>
              <div className="hero-stat">
                <span className="hero-stat-number">50+</span>
                <span className="hero-stat-label">مؤلف</span>
              </div>
              <div className="hero-stat">
                <span className="hero-stat-number">8</span>
                <span className="hero-stat-label">تصنيفات</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* قسم التصنيفات - Categories Section */}
      <section className="categories-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">تصفح حسب التصنيف</h2>
            <p className="section-subtitle">اختر التصنيف الذي يناسب اهتماماتك</p>
          </div>

          <div className="grid-auto" style={{ display: 'grid', gap: 'var(--spacing-lg)' }}>
            {loading ? (
              <p className="text-center">جاري التحميل...</p>
            ) : (
              categories.map((category) => (
                <Link
                  href={`/category/${category.id}`}
                  key={category.id}
                  className="category-card"
                >
                  <div className="category-icon">{category.icon}</div>
                  <h3 className="category-name">{category.arabicName}</h3>
                  <p className="category-count">{category._count?.books || 0} كتاب</p>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* قسم الكتب المميزة - Featured Books Section */}
      <section className="featured-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">الكتب المميزة</h2>
            <p className="section-subtitle">أهم المصادر في المكتبة الإسلامية</p>
          </div>

          <div className="grid-auto" style={{ display: 'grid', gap: 'var(--spacing-lg)' }}>
            {loading ? (
              <p className="text-center">جاري التحميل...</p>
            ) : books.length === 0 ? (
              <p className="text-center">لا توجد كتب متاحة حالياً</p>
            ) : (
              books.map((book) => (
                <Link href={`/books/${book.id}`} key={book.id} className="book-card">
                  <div className="book-card-cover">
                    <img
                      src={book.coverImage || '/placeholder-book.jpg'}
                      alt={book.title}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder-book.jpg';
                      }}
                    />
                  </div>
                  <div className="book-card-content">
                    <span className="book-card-category">
                      {typeof book.category === 'string' ? book.category : book.category?.arabicName || 'غير مصنف'}
                    </span>
                    <h3 className="book-card-title">{book.title}</h3>
                    <p className="book-card-author">{book.author}</p>
                  </div>
                </Link>
              ))
            )}
          </div>

          <div className="text-center mt-xl">
            <Link href="/search" className="btn btn-outline btn-lg">
              عرض جميع الكتب
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* قسم الميزات - Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">مميزات المكتبة الذكية</h2>
            <p className="section-subtitle">تقنيات حديثة بالذكاء الاصطناعي لتجربة قراءة فريدة</p>
          </div>

          <div className="grid-3" style={{ gap: 'var(--spacing-lg)' }}>
            {/* ميزات جديدة بالذكاء الاصطناعي */}
            <div className="feature-card feature-card-highlight">
              <div className="feature-icon">🔍</div>
              <h3 className="feature-title">أين ورد النص؟</h3>
              <p className="feature-desc">محرك بحث متقدم لإيجاد النصوص في جميع الكتب بسهولة</p>
              <span className="feature-badge">جديد</span>
            </div>

            <div className="feature-card feature-card-highlight">
              <div className="feature-icon">📖</div>
              <h3 className="feature-title">جلب النص الذكي</h3>
              <p className="feature-desc">البحث الذكي عن نصوص مشابهة وذات صلة بكلمات بسيطة</p>
              <span className="feature-badge">جديد</span>
            </div>

            <div className="feature-card feature-card-highlight">
              <div className="feature-icon">🤖</div>
              <h3 className="feature-title">المحادثة الذكية</h3>
              <p className="feature-desc">مساعد ذكي يجيب على أسئلتك حول النصوص الإسلامية</p>
              <span className="feature-badge">جديد</span>
            </div>

            <div className="feature-card feature-card-highlight">
              <div className="feature-icon">📝</div>
              <h3 className="feature-title">محرر التقارير</h3>
              <p className="feature-desc">محرر متقدم لكتابة التقارير والدراسات بسهولة وأدوات تنسيق كاملة</p>
              <span className="feature-badge">جديد</span>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🌓</div>
              <h3 className="feature-title">وضع ليلي</h3>
              <p className="feature-desc">اقرأ براحة في أي وقت مع دعم الوضع الداكن</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🔖</div>
              <h3 className="feature-title">علامات مرجعية</h3>
              <p className="feature-desc">احفظ مكانك وعد إليه في أي وقت</p>
            </div>
          </div>
        </div>
      </section>

      {/* قسم الدعوة للعمل - CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">ابدأ رحلتك في طلب العلم</h2>
            <p className="cta-text">
              "طلب العلم فريضة على كل مسلم ومسلمة"
              <br />
              <span className="cta-attribution">- رسول الله صلى الله عليه وآله</span>
            </p>
            <Link href="/search" className="btn btn-gold btn-lg">
              استكشف المكتبة
            </Link>
          </div>
        </div>
      </section>

      {/* الفوتر - Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="footer-logo">
                <span>📚</span>
                <span>المكتبة الإسلامية</span>
              </div>
              <p className="footer-desc">
                مكتبة رقمية شاملة لكتب أهل البيت عليهم السلام، مدعومة بتقنيات الذكاء الاصطناعي لتسهيل البحث والقراءة.
              </p>
            </div>

            <div className="footer-links-group">
              <h4 className="footer-title">التصنيفات</h4>
              <ul className="footer-links">
                <li><Link href="/category/fiqh" className="footer-link">الفقه</Link></li>
                <li><Link href="/category/aqeedah" className="footer-link">العقائد</Link></li>
                <li><Link href="/category/hadith" className="footer-link">الحديث</Link></li>
                <li><Link href="/category/tafsir" className="footer-link">التفسير</Link></li>
              </ul>
            </div>

            <div className="footer-links-group">
              <h4 className="footer-title">روابط سريعة</h4>
              <ul className="footer-links">
                <li><Link href="/" className="footer-link">الرئيسية</Link></li>
                <li><Link href="/search" className="footer-link">البحث</Link></li>
                <li><Link href="/bookmarks" className="footer-link">العلامات المرجعية</Link></li>
                <li><Link href="/contact" className="footer-link">تواصل معنا</Link></li>
              </ul>
            </div>

            <div className="footer-links-group">
              <h4 className="footer-title">المزيد</h4>
              <ul className="footer-links">
                <li><Link href="/category/history" className="footer-link">التاريخ</Link></li>
                <li><Link href="/category/ethics" className="footer-link">الأخلاق</Link></li>
                <li><Link href="/category/dua" className="footer-link">الأدعية</Link></li>
                <li><Link href="/category/usul" className="footer-link">أصول الفقه</Link></li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <p>جميع الحقوق محفوظة © 2024 المكتبة الإسلامية</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        /* قسم البطل */
        .hero {
          position: relative;
          padding: 120px 0 80px;
          background: var(--bg-secondary);
          overflow: hidden;
        }

        .hero-bg {
          position: absolute;
          inset: 0;
          opacity: 0.5;
        }

        .hero-content {
          position: relative;
          text-align: center;
          max-width: 800px;
          margin: 0 auto;
        }

        .hero-title {
          font-size: clamp(2rem, 5vw, 3.5rem);
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: var(--spacing-md);
          line-height: 1.2;
        }

        .hero-title-accent {
          color: var(--accent-primary);
          display: block;
        }

        .hero-subtitle {
          font-size: var(--font-size-lg);
          color: var(--text-secondary);
          margin-bottom: var(--spacing-xl);
          line-height: 1.8;
        }

        .hero .search-bar {
          max-width: 500px;
          margin: 0 auto var(--spacing-xl);
        }

        .hero-stats {
          display: flex;
          justify-content: center;
          gap: var(--spacing-2xl);
        }

        .hero-stat {
          text-align: center;
        }

        .hero-stat-number {
          display: block;
          font-size: var(--font-size-3xl);
          font-weight: 700;
          color: var(--accent-primary);
        }

        .hero-stat-label {
          font-size: var(--font-size-sm);
          color: var(--text-muted);
        }

        /* قسم التصنيفات */
        .categories-section {
          padding: var(--spacing-3xl) 0;
          background: var(--bg-primary);
        }

        /* قسم الكتب المميزة */
        .featured-section {
          padding: var(--spacing-3xl) 0;
          background: var(--bg-secondary);
        }

        /* قسم الميزات */
        .features-section {
          padding: var(--spacing-3xl) 0;
          background: var(--bg-primary);
        }

        /* قسم الدعوة للعمل */
        .cta-section {
          padding: var(--spacing-3xl) 0;
          background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-dark) 100%);
          text-align: center;
        }

        .cta-content {
          max-width: 600px;
          margin: 0 auto;
        }

        .cta-title {
          font-size: var(--font-size-3xl);
          color: white;
          margin-bottom: var(--spacing-lg);
        }

        .cta-text {
          font-family: var(--font-arabic);
          font-size: var(--font-size-xl);
          color: rgba(255, 255, 255, 0.9);
          margin-bottom: var(--spacing-xl);
          line-height: 2;
        }

        .cta-attribution {
          display: block;
          font-size: var(--font-size-base);
          opacity: 0.8;
          margin-top: var(--spacing-sm);
        }

        /* متجاوب */
        @media (max-width: 768px) {
          .hero {
            padding: 100px 0 60px;
          }

          .hero-stats {
            flex-wrap: wrap;
            gap: var(--spacing-lg);
          }
        }
      `}</style>

      {/* AI Features Floating Button */}
      <AIFeatures />
    </main>
  );
}
