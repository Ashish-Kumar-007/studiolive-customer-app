import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// 📱 Use the environment variable from .env or fallback to local IP
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.29.155:3000';

export const apiClient = axios.create({
  baseURL: BASE_URL,  
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // 🚨 Don't trigger logout if we are already on the login page or attempting to login
      const isLoginRequest = error.config?.url?.includes('/auth/login');
      
      if (!isLoginRequest) {
        console.log(`[AUTH] Session expired (401) on: ${error.config?.url}, logging out`);
        try {
          const { logout } = (await import('../store/authStore')).useAuthStore.getState();
          await logout();
        } catch (err) {
          console.error('Logout during 401 failed', err);
        }
        return new Promise(() => { }); // Silence the error as we're redirecting to login
      }
    }

    if (error.response?.status === 403) {
      console.error(`[AUTH] 403 Forbidden: ${error.config?.url}`);
    }

    return Promise.reject(error);
  }
);
