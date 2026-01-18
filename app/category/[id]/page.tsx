'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { categories, featuredBooks, getAuthorName } from '@/lib/library-data';

export default function CategoryPage() {
  const params = useParams();
  const categoryId = params.id as string;
  const category = categories.find(c => c.id === categoryId);

  if (!category) {
    return (
      <main style={{ paddingTop: 'var(--header-height)', minHeight: '100vh' }}>
        <div className="container" style={{ padding: 'var(--spacing-3xl) var(--spacing-lg)', textAlign: 'center' }}>
          <h1>التصنيف غير موجود</h1>
          <Link href="/" className="btn btn-primary">العودة للرئيسية</Link>
        </div>
      </main>
    );
  }

  const categoryBooks = featuredBooks.filter(book => book.category === categoryId);

  return (
    <main style={{ paddingTop: 'var(--header-height)', minHeight: '100vh' }}>
      <div className="container" style={{ padding: 'var(--spacing-3xl) var(--spacing-lg)' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-2xl)' }}>
          <div style={{ fontSize: '64px', marginBottom: 'var(--spacing-md)' }}>{category.icon}</div>
          <h1 className="section-title">{category.name}</h1>
          <p className="section-subtitle">{category.description}</p>
          <p style={{ color: 'var(--text-muted)', marginTop: 'var(--spacing-sm)' }}>
            {category.count} كتاب في هذا التصنيف
          </p>
        </div>

        {/* Books Grid */}
        {categoryBooks.length > 0 ? (
          <div className="grid-auto" style={{ display: 'grid', gap: 'var(--spacing-lg)' }}>
            {categoryBooks.map((book) => (
              <Link href={`/books/${book.id}`} key={book.id} className="book-card">
                <div className="book-card-cover">
                  <img src={book.cover} alt={book.title} />
                </div>
                <div className="book-card-content">
                  <span className="book-card-category">{category.name}</span>
                  <h3 className="book-card-title">{book.title}</h3>
                  <p className="book-card-author">{getAuthorName(book.author)}</p>
                  <p className="card-text">{book.description}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: 'var(--spacing-3xl)' }}>
            <div style={{ fontSize: '64px', marginBottom: 'var(--spacing-lg)' }}>📚</div>
            <h3>لا توجد كتب في هذا التصنيف حالياً</h3>
            <Link href="/" className="btn btn-primary" style={{ marginTop: 'var(--spacing-lg)' }}>
              العودة للرئيسية
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
