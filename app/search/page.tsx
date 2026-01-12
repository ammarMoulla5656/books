'use client';

import { useState } from 'react';
import Link from 'next/link';
import { featuredBooks, categories, getAuthorName } from '@/lib/library-data';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(featuredBooks);

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);

    if (!searchQuery.trim()) {
      setResults(featuredBooks);
      return;
    }

    const filtered = featuredBooks.filter(book =>
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getAuthorName(book.author).toLowerCase().includes(searchQuery.toLowerCase())
    );

    setResults(filtered);
  };

  return (
    <main style={{ paddingTop: 'var(--header-height)', minHeight: '100vh' }}>
      <div className="container" style={{ padding: 'var(--spacing-3xl) var(--spacing-lg)' }}>
        {/* Search Header */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-2xl)' }}>
          <h1 className="section-title">البحث في المكتبة</h1>
          <p className="section-subtitle">ابحث عن كتاب، مؤلف، أو موضوع</p>
        </div>

        {/* Search Bar */}
        <div className="search-bar" style={{ marginBottom: 'var(--spacing-2xl)' }}>
          <input
            type="text"
            className="search-input"
            placeholder="ابحث عن كتاب، مؤلف، أو موضوع..."
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            autoFocus
          />
          <button className="search-btn" aria-label="بحث">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </div>

        {/* Results */}
        <div>
          <p style={{ marginBottom: 'var(--spacing-lg)', color: 'var(--text-secondary)' }}>
            {query ? `النتائج عن "${query}": ${results.length} كتاب` : `جميع الكتب: ${results.length}`}
          </p>

          {results.length > 0 ? (
            <div className="grid-auto" style={{ display: 'grid', gap: 'var(--spacing-lg)' }}>
              {results.map((book) => (
                <Link href={`/books/${book.id}`} key={book.id} className="book-card">
                  <div className="book-card-cover">
                    <img src={book.cover} alt={book.title} />
                  </div>
                  <div className="book-card-content">
                    <span className="book-card-category">
                      {categories.find(c => c.id === book.category)?.name || book.category}
                    </span>
                    <h3 className="book-card-title">{book.title}</h3>
                    <p className="book-card-author">{getAuthorName(book.author)}</p>
                    <p className="card-text">{book.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 'var(--spacing-3xl)' }}>
              <div style={{ fontSize: '64px', marginBottom: 'var(--spacing-lg)' }}>🔍</div>
              <h3>لم يتم العثور على نتائج</h3>
              <p style={{ color: 'var(--text-secondary)' }}>حاول البحث بكلمات أخرى</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
