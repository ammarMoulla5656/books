/**
 * API Client باستخدام Axios
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { Config } from '@/constants';
import { tokenStorage } from '@/utils';
import { ApiResponse } from '@/types';

/**
 * إنشاء Axios instance
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: Config.API_URL,
  timeout: Config.API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

/**
 * Request Interceptor
 * إضافة Access Token إلى كل طلب
 */
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await tokenStorage.getAccessToken();

      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Log للتطوير
      if (__DEV__) {
        console.log('📤 API Request:', {
          url: config.url,
          method: config.method?.toUpperCase(),
          data: config.data,
        });
      }

      return config;
    } catch (error) {
      console.error('Error in request interceptor:', error);
      return config;
    }
  },
  (error: AxiosError) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * معالجة الاستجابات والأخطاء
 */
apiClient.interceptors.response.use(
  (response) => {
    // Log للتطوير
    if (__DEV__) {
      console.log('📥 API Response:', {
        url: response.config.url,
        status: response.status,
        data: response.data,
      });
    }

    // إرجاع البيانات مباشرة
    return response.data;
  },
  async (error: AxiosError<ApiResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Log للأخطاء
    if (__DEV__) {
      console.error('❌ API Error:', {
        url: originalRequest?.url,
        status: error.response?.status,
        message: error.message,
        data: error.response?.data,
      });
    }

    // إذا كان الخطأ 401 وليس طلب refresh token
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      originalRequest._retry = true;

      try {
        // محاولة تحديث Access Token
        const refreshToken = await tokenStorage.getRefreshToken();

        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const response = await axios.post<ApiResponse>(
          `${Config.API_URL}/auth/refresh`,
          {},
          {
            headers: {
              Authorization: `Bearer ${refreshToken}`,
            },
          }
        );

        if (response.data.success && response.data.data) {
          const { accessToken } = response.data.data;

          // حفظ Token الجديد
          await tokenStorage.setTokens(accessToken, refreshToken);

          // إعادة المحاولة مع Token الجديد
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }

          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // فشل التحديث - مسح الـ tokens وإعادة توجيه للـ Login
        await tokenStorage.clearTokens();

        // يمكن إضافة navigation للـ Login هنا
        // navigationRef.navigate('Login');

        return Promise.reject(refreshError);
      }
    }

    // معالجة أنواع الأخطاء المختلفة
    const errorMessage = getErrorMessage(error);
    return Promise.reject(new Error(errorMessage));
  }
);

/**
 * استخراج رسالة الخطأ من الاستجابة
 */
const getErrorMessage = (error: AxiosError<ApiResponse>): string => {
  // إذا كان هناك رسالة خطأ من السيرفر
  if (error.response?.data?.error?.message) {
    return error.response.data.error.message;
  }

  // حسب نوع الخطأ
  if (error.code === 'ECONNABORTED') {
    return 'انتهت مهلة الطلب. يرجى المحاولة مرة أخرى.';
  }

  if (error.code === 'ERR_NETWORK') {
    return 'خطأ في الاتصال. يرجى التحقق من الإنترنت.';
  }

  if (error.response) {
    switch (error.response.status) {
      case 400:
        return 'طلب غير صحيح. يرجى التحقق من البيانات.';
      case 401:
        return 'غير مصرح. يرجى تسجيل الدخول مرة أخرى.';
      case 403:
        return 'ممنوع. ليس لديك صلاحية للوصول.';
      case 404:
        return 'غير موجود. لم يتم العثور على المورد.';
      case 422:
        return 'بيانات غير صالحة. يرجى التحقق من المدخلات.';
      case 429:
        return 'تجاوزت عدد الطلبات المسموح. يرجى الانتظار قليلاً.';
      case 500:
        return 'خطأ في الخادم. يرجى المحاولة لاحقاً.';
      case 503:
        return 'الخدمة غير متوفرة حالياً. يرجى المحاولة لاحقاً.';
      default:
        return 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.';
    }
  }

  return error.message || 'حدث خطأ غير متوقع.';
};

/**
 * تصدير API Client
 */
export default apiClient;

/**
 * مساعدات لإنشاء الطلبات
 */
export const api = {
  get: <T = any>(url: string, params?: any) =>
    apiClient.get<any, ApiResponse<T>>(url, { params }),

  post: <T = any>(url: string, data?: any) =>
    apiClient.post<any, ApiResponse<T>>(url, data),

  put: <T = any>(url: string, data?: any) =>
    apiClient.put<any, ApiResponse<T>>(url, data),

  patch: <T = any>(url: string, data?: any) =>
    apiClient.patch<any, ApiResponse<T>>(url, data),

  delete: <T = any>(url: string) =>
    apiClient.delete<any, ApiResponse<T>>(url),
};
