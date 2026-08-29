'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ListChecksIcon, CodeIcon, UsersIcon, TrophyIcon } from 'lucide-react';

const TABS = [
  { to: '/quizzes', label: 'Testlar', icon: ListChecksIcon },
  { to: '/problems', label: 'Amaliy masalalar', icon: CodeIcon },
  { to: '/community', label: 'Jamiyat', icon: UsersIcon },
  { to: '/leaderboard', label: 'Leaderboard', icon: TrophyIcon }
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-line bg-surface px-2 pb-safe pt-2 lg:hidden">
      {TABS.map(({ to, label, icon: Icon }) => {
        const isActive = pathname.startsWith(to);
        return (
          <Link
            key={to}
            href={to}
            className={`flex flex-col items-center gap-1 p-2 ${
              isActive ? 'text-neon' : 'text-ink-dim hover:text-ink'
            }`}
          >
            <div className="relative">
              <Icon className="h-6 w-6" aria-hidden="true" />
            </div>
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        );
      })}
    </div>
  );
}
