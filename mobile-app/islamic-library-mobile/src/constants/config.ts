/**
 * إعدادات التطبيق
 */

import Constants from 'expo-constants';

export const Config = {
  // API
  API_URL: process.env.API_URL || 'http://localhost:3000/api/v1',
  API_TIMEOUT: 30000, // 30 ثانية

  // App Info
  APP_NAME: 'المكتبة الإسلامية',
  APP_VERSION: Constants.expoConfig?.version || '1.0.0',

  // Storage Keys
  STORAGE_KEYS: {
    ACCESS_TOKEN: 'access_token',
    REFRESH_TOKEN: 'refresh_token',
    USER: 'user',
    THEME: 'theme',
    LANGUAGE: 'language',
    LAST_SYNC: 'last_sync',
    READING_SETTINGS: 'reading_settings',
    NOTIFICATIONS_ENABLED: 'notifications_enabled',
  },

  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,

  // Cache
  CACHE_TIME: 1000 * 60 * 5, // 5 دقائق
  STALE_TIME: 1000 * 60 * 2, // دقيقتين

  // Offline
  MAX_OFFLINE_BOOKS: 50,
  OFFLINE_SYNC_INTERVAL: 1000 * 60 * 15, // 15 دقيقة

  // Reading
  DEFAULT_FONT_SIZE: 16,
  MIN_FONT_SIZE: 12,
  MAX_FONT_SIZE: 32,
  DEFAULT_LINE_HEIGHT: 1.8,

  // Notifications
  DAILY_REMINDER_DEFAULT_TIME: {
    hour: 20, // 8 مساءً
    minute: 0,
  },

  // Rate Limiting
  MAX_REQUESTS_PER_MINUTE: 60,

  // File Upload
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10 MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],

  // Features Flags
  FEATURES: {
    AUDIO_BOOKS: false,
    SOCIAL_SHARING: true,
    PREMIUM_FEATURES: false,
    DARK_MODE: true,
    OFFLINE_MODE: true,
    PUSH_NOTIFICATIONS: true,
  },

  // URLs
  URLS: {
    PRIVACY_POLICY: 'https://islamic-library.com/privacy',
    TERMS_OF_SERVICE: 'https://islamic-library.com/terms',
    SUPPORT: 'https://islamic-library.com/support',
    WEBSITE: 'https://islamic-library.com',
  },

  // Contact
  CONTACT: {
    EMAIL: 'support@islamic-library.com',
    PHONE: '+966123456789',
  },
};
