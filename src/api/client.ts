import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// 📱 Use the environment variable from .env or fallback to local IP
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.29.155:3000';

export const apiClient = axios.create({
  baseURL: BASE_URL,  
  timeout: 45000, // ⏳ Give Render enough time to wake up (cold start)
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(async (config) => {
  try {
    const token = await SecureStore.getItemAsync('access_token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  } catch (error) {
    console.error('[API] Error fetching token for request', error);
    return config;
  }
}, (error) => {
  return Promise.reject(error);
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const isLoginRequest = error.config?.url?.includes('/auth/login');
      
      if (!isLoginRequest) {
        // Guard: only trigger logout once even if multiple requests 401 simultaneously
        const store = (await import('../store/authStore')).useAuthStore.getState();
        if (store.isAuthenticated) {
          console.log(`[AUTH] Session expired (401) on: ${error.config?.url}, logging out`);
          try {
            await store.logout();
          } catch (err) {
            console.error('Logout during 401 failed', err);
          }
        }
        return Promise.reject(error);
      }
    }

    if (error.response?.status === 403) {
      console.error(`[AUTH] 403 Forbidden: ${error.config?.url}`);
    }

    return Promise.reject(error);
  }
);
