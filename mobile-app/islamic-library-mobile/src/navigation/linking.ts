/**
 * Deep Linking Configuration
 * إعدادات الروابط العميقة للتطبيق
 */

import type { LinkingOptions } from '@react-navigation/native';
import type { RootStackParamList } from './types';

/**
 * Deep Linking Configuration
 *
 * يدعم التطبيق الروابط التالية:
 * - islamiclibrary://reset-password/:token - إعادة تعيين كلمة المرور
 * - https://islamiclibrary.app/reset-password/:token - نفس الرابط عبر الويب
 *
 * @example
 * // من الإيميل:
 * islamiclibrary://reset-password/abc123token
 *
 * // من الويب:
 * https://islamiclibrary.app/reset-password/abc123token
 */
export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [
    'islamiclibrary://',
    'https://islamiclibrary.app',
    'http://islamiclibrary.app',
  ],
  config: {
    screens: {
      Auth: {
        screens: {
          Login: 'login',
          Register: 'register',
          ForgotPassword: 'forgot-password',
          ResetPassword: 'reset-password/:token',
        },
      },
      Main: {
        screens: {
          Home: 'home',
          Library: 'library',
          Favorites: 'favorites',
          Profile: 'profile',
        },
      },
    },
  },
};

/**
 * Get Deep Link URL
 * دالة مساعدة لإنشاء روابط عميقة
 *
 * @example
 * getDeepLink('ResetPassword', { token: 'abc123' })
 * // Returns: islamiclibrary://reset-password/abc123
 */
export const getDeepLink = (
  screen: string,
  params?: Record<string, string>
): string => {
  const baseUrl = 'islamiclibrary://';

  switch (screen) {
    case 'ResetPassword':
      return `${baseUrl}reset-password/${params?.token || ''}`;
    case 'Login':
      return `${baseUrl}login`;
    case 'Register':
      return `${baseUrl}register`;
    case 'ForgotPassword':
      return `${baseUrl}forgot-password`;
    default:
      return baseUrl;
  }
};
