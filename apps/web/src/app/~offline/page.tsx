'use client';

import React from 'react';
import { ErrorCard } from '@/components/status/statusCard';

export default function OfflinePage() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-bg text-ink">
      <ErrorCard
        illustrationSrc="/illustrations/error-lost-connection.png"
        title="Aloqa uzildi"
        subtitle="Siz oflayn rejimdasiz. Iltimos, internetingizni tekshiring va qaytadan urinib ko'ring."
        actionLabel="Qayta urinib ko'rish"
        actionIcon="retry"
        onAction={() => typeof window !== 'undefined' && window.location.reload()}
      />
    </div>
  );
}
