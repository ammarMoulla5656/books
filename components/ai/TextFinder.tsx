'use client';

import { useState } from 'react';

interface TextFinderProps {
  onClose: () => void;
}

interface SearchResult {
  bookId: string;
  bookTitle: string;
  chapterId: string;
  chapterTitle: string;
  sectionId: string;
  sectionTitle: string;
  excerpt: string;
}

export default function TextFinder({ onClose }: TextFinderProps) {
  const [searchText, setSearchText] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = () => {
    if (!searchText || searchText.length < 3) {
      showToast('يرجى إدخال نص أطول (3 أحرف على الأقل)', 'warning');
      return;
    }

    setSearching(true);
    setSearched(false);

    // محاكاة البحث
    setTimeout(() => {
      // نتائج تجريبية
      const mockResults: SearchResult[] = [
        {
          bookId: 'kafi',
          bookTitle: 'الكافي',
          chapterId: 'ch1',
          chapterTitle: 'كتاب العقل والجهل',
          sectionId: 's1',
          sectionTitle: 'باب فرض العقل',
          excerpt: `...روي عن الإمام الصادق عليه السلام أنه قال: "${searchText}" والعقل هو الحجة الباطنة...`
        },
        {
          bookId: 'bihar',
          bookTitle: 'بحار الأنوار',
          chapterId: 'ch1',
          chapterTitle: 'كتاب العقل والعلم',
          sectionId: 's1',
          sectionTitle: 'أبواب العقل والجهل',
          excerpt: `...اعلم أن العقل أشرف الموجودات بعد "${searchText}" والذوات المقدسة...`
        }
      ];

      setResults(mockResults);
      setSearched(true);
      setSearching(false);
    }, 1500);
  };

  const showToast = (message: string, type: string) => {
    // يمكن إضافة نظام toast هنا
    alert(message);
  };

  const highlightText = (text: string, query: string) => {
    if (!text || !query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} style={{ background: 'var(--islamic-gold-light)', fontWeight: 600 }}>
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="modal-overlay" style={overlayStyle} onClick={onClose}>
      <div className="modal-container" style={containerStyle} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={headerStyle}>
          <h2 style={{ margin: 0, fontSize: 'var(--font-size-xl)' }}>أين ورد هذا النص؟</h2>
          <button onClick={onClose} style={closeButtonStyle}>
            &times;
          </button>
        </div>

        {/* Content */}
        <div style={contentStyle}>
          {/* Search Input */}
          <div style={{ marginBottom: 'var(--spacing-lg)' }}>
            <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
              <input
                type="text"
                className="input"
                placeholder="ادخل النص للبحث عنه..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                style={{ flex: 1 }}
                autoFocus
              />
              <button className="btn btn-primary" onClick={handleSearch} disabled={searching}>
                {searching ? 'جاري البحث...' : 'بحث'}
              </button>
            </div>
          </div>

          {/* Results */}
          {searching && (
            <div style={{ textAlign: 'center', padding: 'var(--spacing-3xl)' }}>
              <div className="spinner" style={{ margin: '0 auto var(--spacing-md)' }}></div>
              <p>جاري البحث في جميع الكتب...</p>
            </div>
          )}

          {searched && !searching && (
            <div>
              {results.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 'var(--spacing-3xl)' }}>
                  <div style={{ fontSize: '64px', marginBottom: 'var(--spacing-lg)' }}>🔍</div>
                  <h3>لم يتم العثور على نتائج</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    البحث عن: <strong>"{searchText}"</strong>
                  </p>
                </div>
              ) : (
                <>
                  <div
                    style={{
                      background: 'linear-gradient(135deg, var(--accent-light) 0%, var(--bg-tertiary) 100%)',
                      borderRadius: 'var(--radius-lg)',
                      padding: 'var(--spacing-lg)',
                      marginBottom: 'var(--spacing-lg)',
                      borderRight: '4px solid var(--accent-primary)'
                    }}
                  >
                    <h3>
                      📊 وُجد النص في <strong>{results.length}</strong> موضع
                    </h3>
                    <p style={{ fontSize: 'var(--font-size-sm)', margin: 0 }}>
                      البحث عن: <strong>"{searchText}"</strong>
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
                    {results.map((result, idx) => (
                      <div key={idx} className="card">
                        <div className="card-body">
                          <h4 style={{ marginBottom: 'var(--spacing-sm)' }}>
                            📖 {result.bookTitle}
                          </h4>
                          <div style={{ marginBottom: 'var(--spacing-sm)' }}>
                            <strong>{result.chapterTitle}</strong>
                            <br />
                            <small style={{ color: 'var(--text-muted)' }}>
                              {result.sectionTitle}
                            </small>
                          </div>
                          <p style={{ fontSize: 'var(--font-size-sm)', lineHeight: 1.6 }}>
                            {highlightText(result.excerpt, searchText)}
                          </p>
                          <button className="btn btn-primary btn-sm">فتح</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0, 0, 0, 0.5)',
  backdropFilter: 'blur(4px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 6000,
  cursor: 'pointer'
};

const containerStyle: React.CSSProperties = {
  background: 'var(--bg-secondary)',
  border: '1px solid var(--border-color)',
  borderRadius: 'var(--radius-2xl)',
  width: '90%',
  maxWidth: '700px',
  maxHeight: '80vh',
  overflow: 'auto',
  boxShadow: 'var(--shadow-xl)',
  cursor: 'default'
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: 'var(--spacing-lg)',
  borderBottom: '1px solid var(--border-color)',
  position: 'sticky',
  top: 0,
  background: 'var(--bg-secondary)',
  zIndex: 1
};

const closeButtonStyle: React.CSSProperties = {
  width: '32px',
  height: '32px',
  border: 'none',
  background: 'none',
  color: 'var(--text-muted)',
  fontSize: '24px',
  cursor: 'pointer',
  borderRadius: 'var(--radius-md)',
  transition: 'all var(--transition-fast)'
};

const contentStyle: React.CSSProperties = {
  padding: 'var(--spacing-lg)'
};
