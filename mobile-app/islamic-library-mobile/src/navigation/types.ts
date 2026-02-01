/**
 * Navigation Types
 * TypeScript types لجميع navigators والشاشات
 */

import type { NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

/**
 * Root Navigator Params
 */
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainStackParamList>;
};

/**
 * Auth Stack Params
 */
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: {
    token: string;
  };
};

/**
 * Main Stack Params
 * Stack Navigator يحتوي على الـ Tabs والشاشات التفصيلية
 */
export type MainStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  BookDetails: {
    bookId: string;
  };
  BookReader: {
    bookId: string;
    bookTitle: string;
  };
  Search: undefined;
  Category: {
    categoryId: string;
    categoryName: string;
  };
  Settings: undefined;
};

/**
 * Main Tab Params
 * Bottom Tabs داخل Main Stack
 */
export type MainTabParamList = {
  Home: undefined;
  Library: undefined;
  Favorites: undefined;
  Profile: undefined;
};

/**
 * Screen Props Types
 */

// Root Stack
export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

// Auth Stack
export type AuthStackScreenProps<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>;

// Main Stack
export type MainStackScreenProps<T extends keyof MainStackParamList> =
  NativeStackScreenProps<MainStackParamList, T>;

// Main Tab
export type MainTabScreenProps<T extends keyof MainTabParamList> =
  BottomTabScreenProps<MainTabParamList, T>;

/**
 * Navigation Props Declaration
 * للاستخدام في useNavigation hook
 */
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
