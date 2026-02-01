/**
 * RootNavigator
 * Root Navigator يتحكم في التنقل بين Auth و Main
 */

import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import type { RootStackParamList } from './types';
import { useAuthStore } from '@/stores';
import { LoadingSpinner } from '@/components';
import { View, StyleSheet } from 'react-native';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const { user, isLoading, loadUser } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize auth store on mount
  useEffect(() => {
    const initialize = async () => {
      await loadUser();
      setIsInitialized(true);
    };
    initialize();
  }, [loadUser]);

  // Show loading spinner while checking auth state
  if (isLoading || !isInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner size="large" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    >
      {user ? (
        // User is signed in
        <Stack.Screen name="Main" component={MainNavigator} />
      ) : (
        // User is not signed in
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
