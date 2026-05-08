import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

export type UserRole = 'ADMIN' | 'MANAGER' | 'MARKETING' | 'RECEPTIONIST' | 'VIDEOGRAPHER' | 'EDITOR';

interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  emailVerified: boolean;
  isFirstLogin: boolean;
  needsVerification?: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  setAuth: (user: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
  initAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isInitialized: false,
  setAuth: async (user, token) => {
    await SecureStore.setItemAsync('access_token', token);
    await SecureStore.setItemAsync('user_data', JSON.stringify(user));
    set({ user, token, isAuthenticated: true, isInitialized: true });
  },
  logout: async () => {
    await SecureStore.deleteItemAsync('access_token');
    await SecureStore.deleteItemAsync('user_data');
    set({ user: null, token: null, isAuthenticated: false, isInitialized: true });
  },
  initAuth: async () => {
    try {
      const token = await SecureStore.getItemAsync('access_token');
      const userData = await SecureStore.getItemAsync('user_data');
      if (token && userData) {
        set({
          user: JSON.parse(userData),
          token,
          isAuthenticated: true,
          isInitialized: true
        });
      } else {
        set({ isInitialized: true });
      }
    } catch (e) {
      set({ isInitialized: true });
    }
  },
}));
