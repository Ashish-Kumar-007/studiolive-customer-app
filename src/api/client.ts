import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// 📱 Use the environment variable from .env or fallback to local IP
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.29.155:3000';

export const apiClient = axios.create({
  baseURL: BASE_URL,  
  timeout: 45000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==========================================
// MOCK DATA LAYER (Delinked Backend for Dev)
// ==========================================
const MOCK_MODE = true;

const generateMockData = (url: string, method: string, data?: any) => {
  if (url.includes('/auth/login')) {
    return { token: 'mock-jwt-token', user: { id: '1', name: 'Demo User', role: 'CLIENT' } };
  }
  if (url.includes('/auth/me')) {
    return { id: '1', name: 'Demo User', role: 'CLIENT', email: 'demo@studiolive.com' };
  }
  if (url.includes('/targets/marketing-staff')) {
    return [
      {
        id: 'staff-1',
        name: 'Alice Sharma',
        email: 'alice@studiolive.com',
        weeklyTargets: [{ count: 50 }],
        monthlyTargets: [{ count: 200 }],
        _count: { leadsCreated: 35 }
      },
      {
        id: 'staff-2',
        name: 'Bob Verma',
        email: 'bob@studiolive.com',
        weeklyTargets: [{ count: 30 }],
        monthlyTargets: [{ count: 120 }],
        _count: { leadsCreated: 30 }
      }
    ];
  }
  if (url.includes('/tasks/')) {
    return {
      id: 'task-1',
      type: 'SHOOT',
      status: 'ASSIGNED',
      details: 'Bring drone for aerial shots.',
      deadline: new Date(Date.now() + 86400000 * 3).toISOString(),
      updatedAt: new Date().toISOString(),
      lead: {
        id: 'lead-1',
        name: 'Priya & Rahul',
        phone: '+91 9876543210',
        business: 'Wedding Event',
        tasks: [
          { type: 'SHOOT', status: 'ASSIGNED', updatedAt: new Date().toISOString() },
          { type: 'EDIT', status: 'AWAITING SHOOT', updatedAt: new Date().toISOString() }
        ]
      }
    };
  }
  
  // Default fallback mock
  return { success: true, message: 'Mock response' };
};

if (MOCK_MODE) {
  apiClient.interceptors.request.use((config) => {
    // Intercept and throw a custom error to short-circuit the actual network call
    throw new axios.Cancel(`MOCK_REQUEST_${config.method?.toUpperCase()}_${config.url}`);
  });

  apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
      // Catch the short-circuited request and return mock data
      if (error.message && error.message.startsWith('MOCK_REQUEST_')) {
        const parts = error.message.replace('MOCK_REQUEST_', '').split('_');
        const method = parts[0];
        const url = parts.slice(1).join('_');
        
        console.log(`[MOCK API] ${method} ${url}`);
        
        return Promise.resolve({
          data: generateMockData(url, method),
          status: 200,
          statusText: 'OK',
          headers: {},
          config: error.config || {}
        });
      }
      return Promise.reject(error);
    }
  );
} else {
  // Original Interceptors
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
          const store = (await import('../store/authStore')).useAuthStore.getState();
          if (store.isAuthenticated) {
            try {
              await store.logout();
            } catch (err) {}
          }
        }
      }
      return Promise.reject(error);
    }
  );
}
