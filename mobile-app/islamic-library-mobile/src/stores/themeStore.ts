/**
 * Store للثيم (الوضع الفاتح/الداكن)
 */

import { create } from 'zustand';
import { storage } from '@/utils';
import { Config, Colors } from '@/constants';
import { useColorScheme } from 'react-native';

export type ThemeMode = 'light' | 'dark' | 'auto';

interface ThemeState {
  // الحالة
  mode: ThemeMode;
  isDark: boolean;
  colors: typeof Colors.light | typeof Colors.dark;

  // الإجراءات
  setTheme: (mode: ThemeMode) => Promise<void>;
  toggleTheme: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  // الحالة الأولية
  mode: 'auto',
  isDark: false,
  colors: Colors.light,

  /**
   * تعيين الثيم
   */
  setTheme: async (mode: ThemeMode) => {
    try {
      // حفظ الوضع
      await storage.set(Config.STORAGE_KEYS.THEME, mode);

      // تحديد الوضع الفعلي (إذا كان auto)
      let isDark = false;
      if (mode === 'auto') {
        // سيتم استخدام useColorScheme من React Native
        // const systemTheme = useColorScheme();
        // isDark = systemTheme === 'dark';
        isDark = false; // افتراضياً فاتح
      } else {
        isDark = mode === 'dark';
      }

      set({
        mode,
        isDark,
        colors: isDark ? Colors.dark : Colors.light,
      });
    } catch (error) {
      console.error('Error setting theme:', error);
    }
  },

  /**
   * التبديل بين الفاتح والداكن
   */
  toggleTheme: async () => {
    const { mode, isDark } = get();

    // إذا كان auto، نجعله يدوي
    if (mode === 'auto') {
      await get().setTheme('dark');
    } else {
      await get().setTheme(isDark ? 'light' : 'dark');
    }
  },

  /**
   * التهيئة (تحميل الإعدادات المحفوظة)
   */
  initialize: async () => {
    try {
      const savedTheme = await storage.get<ThemeMode>(Config.STORAGE_KEYS.THEME);

      if (savedTheme) {
        await get().setTheme(savedTheme);
      } else {
        // افتراضياً: auto
        await get().setTheme('auto');
      }
    } catch (error) {
      console.error('Error initializing theme:', error);
      // استخدام الفاتح افتراضياً
      set({ mode: 'light', isDark: false, colors: Colors.light });
    }
  },
}));
