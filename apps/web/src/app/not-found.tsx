'use client';

import React from 'react';
import { ErrorCard } from '@/components/status/statusCard';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center p-8 bg-bg">
      <ErrorCard
        illustrationSrc="/illustrations/error-cat-404.png"
        title="404 - Sahifa topilmadi"
        subtitle="Siz qidirayotgan sahifa mavjud emas yoki o'chirilgan bo'lishi mumkin."
        actionLabel="Bosh sahifaga qaytish"
        actionIcon="home"
        onAction={() => window.location.href = '/'}
      />
    </div>
  );
}
