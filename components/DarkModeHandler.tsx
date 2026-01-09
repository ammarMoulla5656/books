'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';

export default function DarkModeHandler() {
  const { readingSettings } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;

    if (readingSettings.darkMode) {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
  }, [readingSettings.darkMode, mounted]);

  return null;
}
