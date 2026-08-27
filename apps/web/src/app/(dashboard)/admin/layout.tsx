'use client';

import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isHydrated, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated) {
      router.push('/');
      return;
    }
    // user profildan hali yuklanmagan bo'lishi mumkin — shoshilib redirect qilmaymiz
    if (user && user.role !== 'admin') {
      router.push('/');
    }
  }, [isHydrated, isAuthenticated, user, router]);

  if (!isHydrated || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <h1 className="text-3xl font-bold mb-4 text-ink">Admin Dashboard</h1>

        <div className="mb-6 flex gap-4 border-b border-line pb-2">
          <a
            href="/admin"
            className="text-sm font-medium text-ink hover:text-neon transition-colors"
          >
            Quizzes
          </a>
          <a
            href="/admin/problems"
            className="text-sm font-medium text-ink hover:text-neon transition-colors"
          >
            Problems
          </a>
        </div>

        {children}
      </div>
    </div>
  );
}
