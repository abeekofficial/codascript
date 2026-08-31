'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/services/api';
import { SessionProvider } from 'next-auth/react';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { hydrate, isAuthenticated, isHydrated, user, setUser, logout } = useAuthStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

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
            bio: (profile as any).bio,
            role: (profile as any).role,
            totalXP: profile.totalXP,
            level: profile.level,
            currentStreak: profile.currentStreak,
            completedQuizzes: profile.completedQuizzes,
          });
        })
        .catch(() => {
          logout();
        });
    }
  }, [isHydrated, isAuthenticated, user, setUser, logout]);

  return <SessionProvider basePath="/api/auth">{children}</SessionProvider>;
}
