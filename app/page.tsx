'use client';

import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    // تحويل فوري إلى الصفحة الثابتة HTML/CSS
    window.location.replace('/index.html');
  }, []);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      fontFamily: 'Cairo, sans-serif',
      direction: 'rtl'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📚</div>
        <p style={{ fontSize: '18px', color: '#666' }}>جاري التحميل...</p>
      </div>
    </div>
  );
}
