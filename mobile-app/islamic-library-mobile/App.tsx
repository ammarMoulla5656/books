/**
 * المكتبة الإسلامية - التطبيق الرئيسي
 * تطبيق موبايل متكامل لقراءة الكتب الإسلامية
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Navigation
import { RootNavigator, linking } from './src/navigation';

// Stores
import { useAuthStore, useThemeStore } from './src/stores';

// Constants
import { Colors, Config } from './src/constants';

// إنشاء Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: Config.STALE_TIME,
      gcTime: Config.CACHE_TIME,
    },
  },
});

/**
 * شاشة التحميل الأولية
 */
const SplashScreen: React.FC = () => {
  const { colors } = useThemeStore();

  return (
    <View style={[styles.container, { backgroundColor: colors.primary }]}>
      <Text style={[styles.title, { color: Colors.light.text }]}>
        المكتبة الإسلامية
      </Text>
      <Text style={[styles.subtitle, { color: Colors.light.textSecondary }]}>
        📚 مكتبتك الإسلامية في جيبك
      </Text>
      <ActivityIndicator
        size="large"
        color={Colors.light.accent}
        style={styles.loader}
      />
      <Text style={[styles.version, { color: Colors.light.textMuted }]}>
        الإصدار {Config.APP_VERSION}
      </Text>
    </View>
  );
};


/**
 * المكون الرئيسي
 */
export default function App() {
  const [isReady, setIsReady] = useState(false);
  const { initialize: initializeTheme } = useThemeStore();
  const { colors, isDark } = useThemeStore();

  useEffect(() => {
    async function prepare() {
      try {
        // تهيئة الثيم
        await initializeTheme();

        // انتظار قليلاً لعرض شاشة Splash
        await new Promise(resolve => setTimeout(resolve, 1500));
      } catch (error) {
        console.error('Error during app initialization:', error);
      } finally {
        setIsReady(true);
      }
    }

    prepare();
  }, []);

  if (!isReady) {
    return <SplashScreen />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <NavigationContainer linking={linking}>
          <StatusBar
            barStyle={isDark ? 'light-content' : 'dark-content'}
            backgroundColor={colors.primary}
          />
          <RootNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  // Splash Screen
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 40,
    textAlign: 'center',
  },
  loader: {
    marginVertical: 20,
  },
  version: {
    fontSize: 12,
    position: 'absolute',
    bottom: 30,
  },
});
