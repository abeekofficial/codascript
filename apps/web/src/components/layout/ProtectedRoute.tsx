'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Loader2Icon } from 'lucide-react';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isHydrated, isAuthenticated } = useAuthStore();
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

  return <>{children}</>;
}
