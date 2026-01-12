'use client';

import { useState } from 'react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <main style={{ paddingTop: 'var(--header-height)', minHeight: '100vh' }}>
      <div className="container" style={{ padding: 'var(--spacing-3xl) var(--spacing-lg)' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h1 className="section-title" style={{ textAlign: 'center' }}>تواصل معنا</h1>
          <div className="card">
            <div className="card-body" style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
              <div style={{ fontSize: '64px', marginBottom: 'var(--spacing-md)' }}>📧</div>
              <h3>البريد الإلكتروني</h3>
              <p style={{ color: 'var(--text-secondary)' }}>info@islamic-library.com</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
