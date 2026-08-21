'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/services/api';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { hydrate, isAuthenticated, isHydrated, user, setUser, logout } = useAuthStore();

  // Hydrate auth state from localStorage on mount
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Auto-fetch profile when authenticated but user data is missing
  useEffect(() => {
    if (isHydrated && isAuthenticated && !user) {
      api.getProfile()
        .then((profile) => {
          setUser({
            id: (profile as any)._id?.toString() || '',
            name: profile.name,
            username: (profile as any).username,
            email: profile.email,
            avatar: (profile as any).avatar,
            role: (profile as any).role,
          });
        })
        .catch(() => {
          // Token is invalid/expired — clear auth state
          logout();
        });
    }
  }, [isHydrated, isAuthenticated, user, setUser, logout]);

  return <>{children}</>;
}
