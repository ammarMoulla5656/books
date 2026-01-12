'use client';

import { useState } from 'react';

interface SmartFetchProps {
  onClose: () => void;
}

const suggestedTexts = [
  { name: 'حديث الكساء', description: 'حديث شريف يتناول فضائل أهل البيت عليهم السلام' },
  { name: 'دعاء كميل', description: 'دعاء من أدعية قنوت الليل المشهورة' },
  { name: 'آية التطهير', description: 'الآية التي تتحدث عن تطهير أهل البيت' },
  { name: 'خطبة الغدير', description: 'خطبة النبي في يوم غدير خم' },
  { name: 'دعاء أبي حمزة', description: 'دعاء موسى بن عبدالله أبي حمزة الثمالي' },
  { name: 'زيارة عاشوراء', description: 'زيارة الإمام الحسين في يوم عاشوراء' }
];

export default function SmartFetch({ onClose }: SmartFetchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setShowResults(false);

    setTimeout(() => {
      setLoading(false);
      setShowResults(true);
    }, 1000);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    handleSearch();
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={containerStyle} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={headerStyle}>
          <h2 style={{ margin: 0 }}>البحث الذكي عن النصوص</h2>
          <button onClick={onClose} style={closeButtonStyle}>
            &times;
          </button>
        </div>

        {/* Content */}
        <div style={contentStyle}>
          {/* Search Input */}
          <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-xl)' }}>
            <input
              type="text"
              className="input"
              placeholder="ماذا تريد أن تجد؟ (مثال: حديث الكساء، دعاء كميل)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              style={{ flex: 1 }}
              autoFocus
            />
            <button className="btn btn-primary" onClick={handleSearch}>
              🔍 ابحث
            </button>
          </div>

          {/* Loading */}
          {loading && (
            <div style={{ textAlign: 'center', padding: 'var(--spacing-3xl)' }}>
              <div className="spinner" style={{ margin: '0 auto var(--spacing-md)' }}></div>
              <p>جاري البحث...</p>
            </div>
          )}

          {/* Results */}
          {showResults && !loading && (
            <div>
              <h3 style={{ marginBottom: 'var(--spacing-lg)' }}>وجدنا 3 نتائج عن "{searchQuery}"</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="card">
                    <div className="card-body">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)' }}>
                        <span>📖</span>
                        <strong>كتاب {i}</strong>
                      </div>
                      <div style={{ marginBottom: 'var(--spacing-sm)' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: 'var(--spacing-xs) var(--spacing-sm)',
                            background: 'var(--accent-light)',
                            color: 'var(--accent-primary)',
                            borderRadius: 'var(--radius-md)',
                            fontSize: 'var(--font-size-sm)',
                            fontWeight: 600
                          }}
                        >
                          الفصل {i}
                        </span>
                      </div>
                      <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-md)' }}>
                        قطعة من الفصل تتعلق بـ "{searchQuery}"...
                      </p>
                      <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                        <button className="btn btn-primary btn-sm">فتح في الكتاب</button>
                        <button className="btn btn-ghost btn-sm">نسخ</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {!showResults && !loading && (
            <div>
              <h3 style={{ marginBottom: 'var(--spacing-md)' }}>نصوص مقترحة:</h3>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                  gap: 'var(--spacing-md)'
                }}
              >
                {suggestedTexts.map((text, idx) => (
                  <div
                    key={idx}
                    className="card"
                    style={{ cursor: 'pointer', textAlign: 'center' }}
                    onClick={() => handleSuggestionClick(text.name)}
                  >
                    <div className="card-body">
                      <div style={{ fontSize: '32px', marginBottom: 'var(--spacing-sm)' }}>📖</div>
                      <div style={{ fontWeight: 600, marginBottom: 'var(--spacing-xs)' }}>{text.name}</div>
                      <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginBottom: 'var(--spacing-md)' }}>
                        {text.description}
                      </div>
                      <button className="btn btn-sm btn-primary" style={{ width: '100%' }}>
                        جلب
                      </button>
                    </div>
                  </div>
                ))}
              </div>
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
  zIndex: 6000
};

const containerStyle: React.CSSProperties = {
  background: 'var(--bg-secondary)',
  border: '1px solid var(--border-color)',
  borderRadius: 'var(--radius-2xl)',
  width: '90%',
  maxWidth: '700px',
  maxHeight: '80vh',
  overflow: 'auto',
  boxShadow: 'var(--shadow-xl)'
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
  borderRadius: 'var(--radius-md)'
};

const contentStyle: React.CSSProperties = {
  padding: 'var(--spacing-lg)'
};
