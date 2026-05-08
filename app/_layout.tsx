import { useEffect } from 'react';
import { Stack, useRootNavigationState, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../src/store/authStore';
import { useTheme } from '../src/constants/theme';
import { setupMockAdapter } from '../src/api/mockData';
import { apiClient } from '../src/api/client';

// 🚀 Demo Mode: Set to false to use real backend API
const USE_DEMO_DATA = false;

export default function RootLayout() {
  const { initAuth, logout, isAuthenticated, user, isInitialized } = useAuthStore();
  const segments = useSegments();
  const theme = useTheme();
  const router = useRouter();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    let mounted = true;
    if (mounted) {
      if (USE_DEMO_DATA) {
        setupMockAdapter(apiClient);
      }
      initAuth();
    }
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!isInitialized || !navigationState?.key) return;
    
    const segmentPath = segments.join('/');
    const inAuthGroup = segments[0] === '(auth)';
    const needsVerification = user?.emailVerified === false;
    const needsPasswordChange = user?.isFirstLogin === true;

    console.log(`[NAV] Guard sync: ${segmentPath} | Auth: ${isAuthenticated} | Init: ${isInitialized}`);

    if (!isAuthenticated) {
      // Redirect to login only if NOT in auth group
      if (!inAuthGroup) {
        console.log('[AUTH] Access denied, redirecting to login');
        router.replace('/(auth)/login');
      }
    } else {
      // Authenticated users
      if (needsVerification && segmentPath !== '(auth)/verify') {
        router.replace('/(auth)/verify');
      } else if (needsPasswordChange && segmentPath !== '(auth)/onboarding') {
        router.replace('/(auth)/onboarding');
      } else if (!needsVerification && !needsPasswordChange && inAuthGroup) {
        // Redirect away from auth group if verified and finished onboarding
        console.log('[AUTH] Verified session, redirecting to app core');
        router.replace('/(app)');
      }
    }
  }, [isAuthenticated, segments, isInitialized, navigationState?.key, user?.emailVerified, user?.isFirstLogin]);

  return (
    <>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.background },
          headerTintColor: theme.text,
          headerTitleStyle: { fontWeight: 'bold' },
          contentStyle: { backgroundColor: theme.background },
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
