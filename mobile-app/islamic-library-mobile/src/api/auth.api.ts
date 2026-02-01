/**
 * API للمصادقة
 */

import { api } from './client';
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  RefreshTokenResponse,
  User,
} from '@/types';

export const authAPI = {
  /**
   * تسجيل الدخول
   */
  login: async (email: string, password: string, deviceInfo: any): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', {
      email,
      password,
      deviceInfo,
    });

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'فشل تسجيل الدخول');
    }

    return response.data;
  },

  /**
   * التسجيل
   */
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'فشل التسجيل');
    }

    return response.data;
  },

  /**
   * تسجيل الخروج
   */
  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  /**
   * تحديث Access Token
   */
  refreshToken: async (refreshToken: string): Promise<RefreshTokenResponse> => {
    const response = await api.post<RefreshTokenResponse>('/auth/refresh', {
      refreshToken,
    });

    if (!response.success || !response.data) {
      throw new Error('فشل تحديث التوكن');
    }

    return response.data;
  },

  /**
   * الحصول على بيانات المستخدم الحالي
   */
  getProfile: async (): Promise<User> => {
    const response = await api.get<User>('/auth/profile');

    if (!response.success || !response.data) {
      throw new Error('فشل جلب البيانات');
    }

    return response.data;
  },

  /**
   * تحديث البيانات الشخصية
   */
  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await api.put<User>('/auth/profile', data);

    if (!response.success || !response.data) {
      throw new Error('فشل تحديث البيانات');
    }

    return response.data;
  },

  /**
   * تغيير كلمة المرور
   */
  changePassword: async (
    currentPassword: string,
    newPassword: string
  ): Promise<void> => {
    const response = await api.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });

    if (!response.success) {
      throw new Error(response.error?.message || 'فشل تغيير كلمة المرور');
    }
  },

  /**
   * استعادة كلمة المرور
   */
  forgotPassword: async (email: string): Promise<void> => {
    const response = await api.post('/auth/forgot-password', { email });

    if (!response.success) {
      throw new Error(response.error?.message || 'فشل إرسال رابط الاستعادة');
    }
  },

  /**
   * إعادة تعيين كلمة المرور
   */
  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    const response = await api.post('/auth/reset-password', {
      token,
      newPassword,
    });

    if (!response.success) {
      throw new Error(response.error?.message || 'فشل إعادة تعيين كلمة المرور');
    }
  },
};
