'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3Icon,
  ClockIcon,
  LayoutDashboardIcon,
  ListChecksIcon,
  SettingsIcon,
  ShieldIcon,
  TerminalIcon,
  TrophyIcon,
  UserIcon,
  CodeIcon,
  UsersIcon
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const NAV = [
  { to: '/dashboard', label: 'Boshqaruv paneli', icon: LayoutDashboardIcon, end: true },
  { to: '/quizzes', label: 'Testlar', icon: ListChecksIcon },
  { to: '/history', label: 'Test tarixi', icon: ClockIcon },
  { to: '/results', label: 'Natijalarim', icon: BarChart3Icon },
  { to: '/problems', label: 'Amaliy masalalar', icon: CodeIcon },
  { to: '/community', label: 'Jamiyat', icon: UsersIcon },
  { to: '/leaderboard', label: 'Leaderboard', icon: TrophyIcon },
  { to: '/profile', label: 'Profilim', icon: UserIcon },
  { to: '/settings', label: 'Sozlamalar', icon: SettingsIcon }
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-line bg-surface lg:flex">
      <div className="flex h-16 items-center gap-2.5 border-b border-line px-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-neon/15 text-neon">
          <TerminalIcon className="h-5 w-5" aria-hidden="true" />
        </span>
        <span className="text-[17px] font-bold tracking-tight">
          Coda<span className="text-neon">Script</span>
        </span>
      </div>

      <nav aria-label="Asosiy navigatsiya" className="flex-1 space-y-1 px-3 py-5">
        {NAV.map(({ to, label, icon: Icon, end }) => {
          const isActive = end ? pathname === to : pathname.startsWith(to);
          return (
            <Link
              key={to}
              href={to}
              className={[
                'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-150',
                isActive ? 'bg-neon/10 text-neon' : 'text-ink-dim hover:bg-elevated hover:text-ink'
              ].join(' ')}
            >
              <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
              <span>{label}</span>
              {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-neon" />}
            </Link>
          );
        })}
      </nav>

      {user?.role === 'admin' && (
        <div className="border-t border-line p-3">
          <Link
            href="/admin"
            className={[
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-150',
              pathname.startsWith('/admin') ? 'bg-elevated text-ink' : 'text-ink-muted hover:bg-elevated hover:text-ink'
            ].join(' ')}
          >
            <ShieldIcon className="h-[18px] w-[18px]" aria-hidden="true" />
            Admin panel
          </Link>
        </div>
      )}
    </aside>
  );
}
