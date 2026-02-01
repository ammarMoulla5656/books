/**
 * نظام الألوان للتطبيق
 * يدعم الوضع الفاتح والداكن
 */

export const Colors = {
  light: {
    // الألوان الأساسية
    primary: '#1a472a',      // الأخضر الداكن الإسلامي
    secondary: '#2d5f3f',    // الأخضر المتوسط
    accent: '#d4af37',       // الذهبي

    // الخلفيات
    background: '#ffffff',
    backgroundSecondary: '#f9f9f9',
    surface: '#f5f5f5',
    card: '#ffffff',
    errorBackground: '#ffebee',

    // النصوص
    text: '#1a1a1a',
    textSecondary: '#666666',
    textMuted: '#999999',

    // الحدود
    border: '#e0e0e0',
    divider: '#eeeeee',

    // الحالات
    success: '#4caf50',
    error: '#f44336',
    warning: '#ff9800',
    info: '#2196f3',

    // الظلال
    shadow: 'rgba(0, 0, 0, 0.1)',
  },

  dark: {
    // الألوان الأساسية
    primary: '#2d5f3f',
    secondary: '#1a472a',
    accent: '#d4af37',

    // الخلفيات
    background: '#121212',
    surface: '#1e1e1e',
    card: '#2a2a2a',

    // النصوص
    text: '#ffffff',
    textSecondary: '#b3b3b3',
    textMuted: '#808080',

    // الحدود
    border: '#333333',
    divider: '#2a2a2a',

    // الحالات
    success: '#66bb6a',
    error: '#ef5350',
    warning: '#ffa726',
    info: '#42a5f5',

    // الظلال
    shadow: 'rgba(0, 0, 0, 0.5)',
  },
};

// ألوان إضافية مشتركة
export const CommonColors = {
  transparent: 'transparent',
  white: '#ffffff',
  black: '#000000',

  // تدرجات الرمادي
  gray: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#eeeeee',
    300: '#e0e0e0',
    400: '#bdbdbd',
    500: '#9e9e9e',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },

  // تدرجات الأخضر الإسلامي
  islamic: {
    50: '#e8f5e9',
    100: '#c8e6c9',
    200: '#a5d6a7',
    300: '#81c784',
    400: '#66bb6a',
    500: '#1a472a',
    600: '#2d5f3f',
    700: '#388e3c',
    800: '#2e7d32',
    900: '#1b5e20',
  },
};
