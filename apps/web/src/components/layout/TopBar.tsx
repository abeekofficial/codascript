'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { BellIcon, FlameIcon, SearchIcon, ZapIcon } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const NOTIFICATIONS = [
  { id: 'n1', title: 'Yangi haftalik reyting e’lon qilindi', time: '5 daqiqa oldin', unread: true },
  { id: 'n2', title: 'JavaScript testida 850 XP yig‘dingiz', time: '2 soat oldin', unread: true },
  { id: 'n3', title: '“14 kunlik seriya” nishoni ochildi', time: 'Kecha', unread: false }
];

export function TopBar() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const unread = NOTIFICATIONS.filter((n) => n.unread).length;
  const { user } = useAuthStore();

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-4 border-b border-line bg-bg/90 px-5 backdrop-blur lg:px-8">
      <label className="relative hidden max-w-sm flex-1 items-center md:flex">
        <SearchIcon className="pointer-events-none absolute left-3 h-4 w-4 text-ink-muted" aria-hidden="true" />
        <span className="sr-only">Qidiruv</span>
        <input
          type="search"
          placeholder="Test yoki mavzu qidirish..."
          className="h-10 w-full rounded-xl border border-line bg-surface pl-9 pr-3 text-sm text-ink placeholder:text-ink-muted transition-colors duration-150 focus:border-neon focus:outline-none"
        />
      </label>

      <div className="ml-auto flex items-center gap-3">
        <span className="hidden items-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-warning sm:flex">
          <FlameIcon className="h-3.5 w-3.5" aria-hidden="true" />
          {user?.streak || 0} kun
        </span>
        <span className="hidden items-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-neon sm:flex">
          <ZapIcon className="h-3.5 w-3.5" aria-hidden="true" />
          {user?.score || 0} XP
        </span>

        <div className="relative" ref={ref}>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-haspopup="true"
            aria-expanded={open}
            aria-label={`Bildirishnomalar${unread ? `, ${unread} ta o‘qilmagan` : ''}`}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface text-ink-dim transition-colors duration-150 hover:border-neon/50 hover:text-ink"
          >
            <BellIcon className="h-[18px] w-[18px]" aria-hidden="true" />
            {unread > 0 && (
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-neon ring-2 ring-surface" />
            )}
          </button>

          {open && (
            <div className="absolute right-0 top-12 w-80 overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl shadow-black/50">
              <p className="border-b border-line px-4 py-3 text-sm font-semibold">Bildirishnomalar</p>
              <ul>
                {NOTIFICATIONS.map((n) => (
                  <li key={n.id} className="border-b border-line/60 px-4 py-3 last:border-0">
                    <p className={`text-sm ${n.unread ? 'text-ink' : 'text-ink-dim'}`}>{n.title}</p>
                    <p className="mt-0.5 text-xs text-ink-muted">{n.time}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <Link
          href="/profil"
          className="flex items-center gap-3 rounded-xl border border-line bg-surface py-1.5 pl-1.5 pr-3 transition-colors duration-150 hover:border-neon/50"
        >
          {user?.avatar ? (
            <img src={user.avatar} alt="Avatar" className="h-8 w-8 rounded-lg object-cover" />
          ) : (
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-neon text-sm font-bold text-bg">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </span>
          )}
          <span className="hidden leading-tight sm:block">
            <span className="block text-sm font-semibold truncate max-w-[100px]">{user?.name || 'User'}</span>
            <span className="block text-[11px] text-ink-dim">Level {user?.level || 1}</span>
          </span>
        </Link>
      </div>
    </header>
  );
}
