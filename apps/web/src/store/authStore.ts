import { create } from 'zustand';

interface User {
  id?: string;
  _id?: string;
  name: string;
  username?: string;
  email: string;
  avatar?: string;
  bio?: string;
  score?: number; // legacy for totalXP maybe
  totalXP?: number;
  currentStreak?: number;
  completedQuizzes?: number;
  streak?: number;
  role?: string;
  level?: number;
  accuracy?: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  login: (user: User, token: string, refreshToken?: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isHydrated: false,
  login: (user, token, refreshToken?) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
    }
    set({ user, token, isAuthenticated: true });
  },
  setUser: (user) => {
    set({ user });
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    }
    set({ user: null, token: null, isAuthenticated: false });
  },
  hydrate: () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        set({ token, isAuthenticated: true, isHydrated: true });
      } else {
        set({ isHydrated: true });
      }
    }
  },
}));
