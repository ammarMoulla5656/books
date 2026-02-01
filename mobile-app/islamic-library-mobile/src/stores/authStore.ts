/**
 * Store للمصادقة
 */

import { create } from 'zustand';
import { User } from '@/types';
import { authAPI } from '@/api';
import { tokenStorage, storage } from '@/utils';
import { Config } from '@/constants';

interface AuthState {
  // الحالة
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // الإجراءات
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // الحالة الأولية
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  /**
   * تسجيل الدخول
   */
  login: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });

      // معلومات الجهاز (سيتم تحسينه لاحقاً)
      const deviceInfo = {
        deviceToken: 'temp-token',
        deviceType: 'android' as const,
        deviceModel: 'Unknown',
        osVersion: 'Unknown',
        appVersion: Config.APP_VERSION,
      };

      const response = await authAPI.login(email, password, deviceInfo);

      // حفظ التوكنات
      await tokenStorage.setTokens(
        response.tokens.accessToken,
        response.tokens.refreshToken
      );

      // حفظ بيانات المستخدم
      await storage.set(Config.STORAGE_KEYS.USER, response.user);

      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'فشل تسجيل الدخول',
      });
      throw error;
    }
  },

  /**
   * التسجيل
   */
  register: async (data: any) => {
    try {
      set({ isLoading: true, error: null });

      // معلومات الجهاز
      const deviceInfo = {
        deviceToken: 'temp-token',
        deviceType: 'android' as const,
        deviceModel: 'Unknown',
        osVersion: 'Unknown',
        appVersion: Config.APP_VERSION,
      };

      const response = await authAPI.register({
        ...data,
        deviceInfo,
      });

      // حفظ التوكنات
      await tokenStorage.setTokens(
        response.tokens.accessToken,
        response.tokens.refreshToken
      );

      // حفظ بيانات المستخدم
      await storage.set(Config.STORAGE_KEYS.USER, response.user);

      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'فشل التسجيل',
      });
      throw error;
    }
  },

  /**
   * تسجيل الخروج
   */
  logout: async () => {
    try {
      set({ isLoading: true });

      // تسجيل الخروج من السيرفر
      await authAPI.logout();

      // مسح التوكنات والبيانات
      await tokenStorage.clearTokens();
      await storage.remove(Config.STORAGE_KEYS.USER);

      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      // حتى لو فشل الطلب، نقوم بمسح البيانات المحلية
      await tokenStorage.clearTokens();
      await storage.remove(Config.STORAGE_KEYS.USER);

      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },

  /**
   * تحميل بيانات المستخدم
   */
  loadUser: async () => {
    try {
      set({ isLoading: true });

      // التحقق من وجود access token
      const token = await tokenStorage.getAccessToken();

      if (!token) {
        set({ isLoading: false, isAuthenticated: false });
        return;
      }

      // محاولة جلب بيانات المستخدم من السيرفر
      const user = await authAPI.getProfile();

      // حفظ بيانات المستخدم
      await storage.set(Config.STORAGE_KEYS.USER, user);

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      // إذا فشل، نحاول تحميل من التخزين المحلي
      const cachedUser = await storage.get<User>(Config.STORAGE_KEYS.USER);

      if (cachedUser) {
        set({
          user: cachedUser,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        // مسح البيانات
        await tokenStorage.clearTokens();
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    }
  },

  /**
   * تحديث الملف الشخصي
   */
  updateProfile: async (data: Partial<User>) => {
    try {
      set({ isLoading: true, error: null });

      const updatedUser = await authAPI.updateProfile(data);

      // تحديث البيانات المحلية
      await storage.set(Config.STORAGE_KEYS.USER, updatedUser);

      set({
        user: updatedUser,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'فشل تحديث البيانات',
      });
      throw error;
    }
  },

  /**
   * تغيير كلمة المرور
   */
  changePassword: async (currentPassword: string, newPassword: string) => {
    try {
      set({ isLoading: true, error: null });

      await authAPI.changePassword(currentPassword, newPassword);

      set({
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'فشل تغيير كلمة المرور',
      });
      throw error;
    }
  },

  /**
   * مسح الخطأ
   */
  clearError: () => {
    set({ error: null });
  },
}));
