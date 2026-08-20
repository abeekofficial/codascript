import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  username?: string;
  email: string;
  avatar?: string;
  score?: number;
  streak?: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isHydrated: false,
  login: (user, token) => {
    if (typeof window !== 'undefined') localStorage.setItem('token', token);
    set({ user, token, isAuthenticated: true });
  },
  setUser: (user) => {
    set({ user });
  },
  logout: () => {
    if (typeof window !== 'undefined') localStorage.removeItem('token');
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
