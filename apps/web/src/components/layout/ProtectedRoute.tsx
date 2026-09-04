'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Loader2Icon } from 'lucide-react';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isHydrated, isAuthenticated, user } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.push('/login');
    }
  }, [isHydrated, isAuthenticated, router, pathname]);

  if (!mounted || !isHydrated) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-bg">
        <Loader2Icon className="h-8 w-8 animate-spin text-neon" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!user) {
    // Show a loading screen while AuthProvider fetches the real user profile
    return (
      <div className="flex flex-col h-screen w-full items-center justify-center bg-bg gap-4">
        <Loader2Icon className="h-10 w-10 animate-spin text-neon" />
        <p className="text-sm text-ink-dim">Profil yuklanmoqda...</p>
      </div>
    );
  }

  return <>{children}</>;
}
