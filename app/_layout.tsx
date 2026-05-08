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
    console.log(`[NAV] Checking route stability: ${segmentPath} | Auth: ${isAuthenticated}`);
    const inAuthGroup = segments[0] === '(auth)';
    const currentScreen = segments[segments.length - 1];
    
    // Safety check for user state
    if (isAuthenticated && !user) {
      console.warn('[AUTH] Authenticated but user object missing, logging out to reset state');
      logout();
      return;
    }

    const needsVerification = user && !user.emailVerified;
    const needsPasswordChange = user && user.emailVerified && user.isFirstLogin;

    if (!isAuthenticated) {
      if (!inAuthGroup) {
        console.log('[AUTH] Not authenticated, redirecting to login');
        router.replace('/(auth)/login');
      }
    } else {
      if (needsVerification && currentScreen !== 'verify') {
        console.log('[AUTH] Email not verified, redirecting to verify');
        router.replace('/(auth)/verify');
      } else if (needsPasswordChange && currentScreen !== 'change-password') {
        console.log('[AUTH] First login, redirecting to password change');
        router.replace('/(auth)/change-password');
      } else if (!needsVerification && !needsPasswordChange && !segments.includes('(app)')) {
        console.log('[AUTH] Verified, redirecting to main app');
        router.replace('/(app)');
      }
    }
  }, [isAuthenticated, segments.join('/'), isInitialized, navigationState?.key, user?.emailVerified, user?.isFirstLogin]);

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
