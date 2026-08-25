import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../src/store/authStore';
import { Colors } from '../src/constants/theme';
import { setupMockAdapter } from '../src/api/mockData';
import { apiClient } from '../src/api/client';

// 🚀 Demo Mode: false = real backend (https://studiolive-api.onrender.com)
const USE_DEMO_DATA = false;

export default function RootLayout() {
  const { initAuth, logout, isAuthenticated, user, isInitialized } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  // One-time initialization
  useEffect(() => {
    if (USE_DEMO_DATA) {
      setupMockAdapter(apiClient);
    }
    initAuth();
  }, []);

  // Navigation guard
  useEffect(() => {
    if (!isInitialized) return;

    const segmentPath = segments.join('/');
    const inAuthGroup = segments[0] === '(auth)';
    const inAppGroup = segments[0] === '(app)';

    const needsVerification = user?.emailVerified === false;

    console.log(`[NAV] Segment: ${segmentPath || 'root'}, Auth: ${isAuthenticated}, Initialized: ${isInitialized}, User: ${user?.email}, Verified: ${user?.emailVerified}`);

    if (!isAuthenticated) {
      if (!inAuthGroup) {
        console.log('[NAV] Redirecting to login...');
        router.replace('/(auth)/login');
      }
    } else {
      if (needsVerification && segmentPath !== '(auth)/verify') {
        console.log('[NAV] Redirecting to verify...');
        router.replace('/(auth)/verify');
      } else if (!needsVerification && !inAppGroup) {
        console.log('[NAV] Redirecting to app dashboard...');
        router.replace('/(app)');
      }
    }
  }, [isAuthenticated, segments.join('/'), isInitialized, user?.emailVerified]);

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.text,
          headerTitleStyle: { fontWeight: 'bold' },
          contentStyle: { backgroundColor: Colors.background },
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(app)" />
      </Stack>
    </>
  );
}
