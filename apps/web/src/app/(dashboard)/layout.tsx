import React from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { MobileTabBar } from '@/components/layout/MobileTabBar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full min-h-screen w-full bg-bg text-ink pb-[72px] lg:pb-0">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="coda-scroll flex-1 overflow-y-auto px-5 py-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
      <MobileTabBar />
    </div>
  );
}
