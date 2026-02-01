/**
 * أدوات التخزين المحلي
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Config } from '@/constants';

/**
 * التخزين العادي (AsyncStorage)
 */
export const storage = {
  /**
   * حفظ قيمة
   */
  async set(key: string, value: any): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error('Error saving to storage:', error);
      throw error;
    }
  },

  /**
   * استرجاع قيمة
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error('Error reading from storage:', error);
      return null;
    }
  },

  /**
   * حذف قيمة
   */
  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from storage:', error);
      throw error;
    }
  },

  /**
   * مسح كل البيانات
   */
  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  },

  /**
   * الحصول على جميع المفاتيح
   */
  async getAllKeys(): Promise<readonly string[]> {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      console.error('Error getting all keys:', error);
      return [];
    }
  },
};

/**
 * التخزين الآمن (SecureStore) - للبيانات الحساسة
 */
export const secureStorage = {
  /**
   * حفظ قيمة آمنة
   */
  async set(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error('Error saving to secure storage:', error);
      throw error;
    }
  },

  /**
   * استرجاع قيمة آمنة
   */
  async get(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error('Error reading from secure storage:', error);
      return null;
    }
  },

  /**
   * حذف قيمة آمنة
   */
  async remove(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error('Error removing from secure storage:', error);
      throw error;
    }
  },
};

/**
 * أدوات مساعدة للتوكينات
 */
export const tokenStorage = {
  async setTokens(accessToken: string, refreshToken: string): Promise<void> {
    await secureStorage.set(Config.STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    await secureStorage.set(Config.STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
  },

  async getAccessToken(): Promise<string | null> {
    return await secureStorage.get(Config.STORAGE_KEYS.ACCESS_TOKEN);
  },

  async getRefreshToken(): Promise<string | null> {
    return await secureStorage.get(Config.STORAGE_KEYS.REFRESH_TOKEN);
  },

  async clearTokens(): Promise<void> {
    await secureStorage.remove(Config.STORAGE_KEYS.ACCESS_TOKEN);
    await secureStorage.remove(Config.STORAGE_KEYS.REFRESH_TOKEN);
  },
};
