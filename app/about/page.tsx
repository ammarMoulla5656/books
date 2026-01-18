export default function AboutPage() {
  return (
    <main style={{ paddingTop: 'var(--header-height)', minHeight: '100vh' }}>
      <div className="container" style={{ padding: 'var(--spacing-3xl) var(--spacing-lg)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 className="section-title" style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)' }}>
            عن المكتبة الإسلامية
          </h1>

          <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
            <div className="card-body">
              <h2 style={{ marginBottom: 'var(--spacing-md)' }}>📚 ما هي المكتبة الإسلامية؟</h2>
              <p style={{ lineHeight: 1.8, color: 'var(--text-secondary)' }}>
                المكتبة الإسلامية هي منصة رقمية شاملة تجمع كنوز المعرفة الإسلامية من كتب أهل البيت عليهم السلام.
                نوفر للقراء إمكانية الوصول السهل إلى مئات الكتب في مختلف المجالات الإسلامية.
              </p>
            </div>
          </div>

          <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
            <div className="card-body">
              <h2 style={{ marginBottom: 'var(--spacing-md)' }}>✨ ميزات المكتبة</h2>
              <ul style={{ paddingRight: 'var(--spacing-xl)', lineHeight: 2 }}>
                <li>محرك بحث ذكي</li>
                <li>ذكاء اصطناعي</li>
                <li>تصنيفات متعددة</li>
                <li>واجهة عصرية</li>
                <li>وضع ليلي</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
