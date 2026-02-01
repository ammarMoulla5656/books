/**
 * MainNavigator
 * Stack Navigator للشاشات الرئيسية + Bottom Tabs
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import {
  HomeScreen,
  LibraryScreen,
  FavoritesScreen,
  ProfileScreen,
  BookDetailsScreen,
  BookReaderScreen,
  SearchScreen,
  CategoryScreen,
  SettingsScreen,
} from '@/screens';
import type { MainStackParamList, MainTabParamList } from './types';
import { Colors } from '@/constants';

const Stack = createNativeStackNavigator<MainStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

/**
 * MainTabsNavigator
 * Bottom Tabs داخل Main Stack
 */
const MainTabsNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.light.primary,
        tabBarInactiveTintColor: Colors.light.textSecondary,
        tabBarStyle: {
          backgroundColor: Colors.light.background,
          borderTopWidth: 1,
          borderTopColor: Colors.light.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'الرئيسية',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Library"
        component={LibraryScreen}
        options={{
          title: 'المكتبة',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="library" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{
          title: 'المفضلة',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'الملف الشخصي',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

/**
 * MainNavigator
 * Stack Navigator الرئيسي
 */
export const MainNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="MainTabs"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      {/* Main Tabs */}
      <Stack.Screen
        name="MainTabs"
        component={MainTabsNavigator}
        options={{
          title: 'الرئيسية',
        }}
      />

      {/* Detail Screens */}
      <Stack.Screen
        name="BookDetails"
        component={BookDetailsScreen}
        options={{
          title: 'تفاصيل الكتاب',
          animation: 'slide_from_left',
        }}
      />

      <Stack.Screen
        name="BookReader"
        component={BookReaderScreen}
        options={{
          title: 'قراءة الكتاب',
          animation: 'fade',
        }}
      />

      <Stack.Screen
        name="Search"
        component={SearchScreen}
        options={{
          title: 'البحث',
          animation: 'fade_from_bottom',
        }}
      />

      <Stack.Screen
        name="Category"
        component={CategoryScreen}
        options={{
          title: 'التصنيف',
          animation: 'slide_from_left',
        }}
      />

      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'الإعدادات',
          animation: 'slide_from_left',
        }}
      />
    </Stack.Navigator>
  );
};
