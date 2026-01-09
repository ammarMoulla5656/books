'use client';

import { useEffect } from 'react';

export function useVisitorTracking(page: string, action: string = 'page_view') {
  useEffect(() => {
    // Track page visit
    const trackVisit = async () => {
      try {
        const response = await fetch('/api/visitor/track', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            page,
            action,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          // Store session ID in cookie if provided
          if (data.sessionId) {
            document.cookie = `visitor_session=${data.sessionId}; path=/; max-age=31536000`; // 1 year
          }
        }
      } catch (error) {
        // Silently fail - tracking should not break the app
        console.error('Visitor tracking error:', error);
      }
    };

    trackVisit();
  }, [page, action]);
}
