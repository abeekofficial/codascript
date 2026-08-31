import React from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="flex h-full min-h-screen w-full bg-bg text-ink pb-[72px] lg:pb-0">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar />
          <main className="coda-scroll flex-1 overflow-y-auto px-5 py-6 pb-20 lg:px-8 lg:py-8 lg:pb-8">
            {children}
          </main>
        </div>
        <MobileBottomNav />
      </div>
    </ProtectedRoute>
  );
}
