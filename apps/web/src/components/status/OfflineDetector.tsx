'use client';

import React, { useState, useEffect } from 'react';
import { ErrorCard } from '@/components/status/statusCard';

export function OfflineDetector({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Check initial status
    setIsOnline(typeof navigator !== 'undefined' ? navigator.onLine : true);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isMounted) {
    return <>{children}</>;
  }

  if (!isOnline) {
    return (
      <div className="fixed inset-0 z-[9999] bg-bg flex items-center justify-center p-4">
        <ErrorCard
          illustrationSrc="/illustrations/error-lost-connection.png"
          title="Aloqa uzildi"
          subtitle="Internet tarmog'iga ulanish yo'q. Iltimos, aloqani tekshiring."
          actionLabel="Qayta urinib ko'rish"
          actionIcon="retry"
          onAction={() => window.location.reload()}
        />
      </div>
    );
  }

  return <>{children}</>;
}
