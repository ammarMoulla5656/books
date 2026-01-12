'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';

// تحميل المكونات بشكل ديناميكي
const TextFinder = dynamic(() => import('./ai/TextFinder'), { ssr: false });
const SmartFetch = dynamic(() => import('./ai/SmartFetch'), { ssr: false });
const AIChat = dynamic(() => import('./ai/AIChat'), { ssr: false });

type AIFeatureType = 'text-finder' | 'smart-fetch' | 'ai-chat' | null;

export default function AIFeatures() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState<AIFeatureType>(null);

  const features = [
    {
      id: 'text-finder' as const,
      icon: '🔍',
      name: 'أين ورد النص؟',
      description: 'ابحث عن النص في جميع الكتب'
    },
    {
      id: 'smart-fetch' as const,
      icon: '📖',
      name: 'جلب النص الذكي',
      description: 'ابحث عن نصوص مشابهة'
    },
    {
      id: 'ai-chat' as const,
      icon: '🤖',
      name: 'المحادثة الذكية',
      description: 'اسأل عن أي موضوع'
    }
  ];

  const handleFeatureClick = (featureId: AIFeatureType) => {
    setActiveFeature(featureId);
    setMenuOpen(false);
  };

  const handleClose = () => {
    setActiveFeature(null);
  };

  return (
    <>
      {/* الزر العائم */}
      <button
        className="ai-features-button"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="ميزات الذكاء الاصطناعي"
      >
        🤖
      </button>

      {/* قائمة الميزات */}
      <div className={`ai-features-menu ${menuOpen ? 'visible' : ''}`}>
        <ul className="ai-features-menu-list">
          {features.map((feature) => (
            <li key={feature.id}>
              <button
                className="ai-feature-item"
                onClick={() => handleFeatureClick(feature.id)}
              >
                <span className="ai-feature-icon">{feature.icon}</span>
                <div>
                  <div style={{ fontWeight: 600 }}>{feature.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {feature.description}
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* المكونات */}
      {activeFeature === 'text-finder' && <TextFinder onClose={handleClose} />}
      {activeFeature === 'smart-fetch' && <SmartFetch onClose={handleClose} />}
      {activeFeature === 'ai-chat' && <AIChat onClose={handleClose} />}

      {/* Overlay لإغلاق القائمة */}
      {menuOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 998,
            cursor: 'pointer'
          }}
          onClick={() => setMenuOpen(false)}
        />
      )}
    </>
  );
}
