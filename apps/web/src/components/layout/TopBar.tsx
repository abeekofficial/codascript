'use client';

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BellIcon, FlameIcon, SearchIcon, ZapIcon, MenuIcon, TerminalIcon, UserIcon, SettingsIcon, ClockIcon, BookmarkIcon, UsersIcon, HelpCircleIcon, LogOutIcon } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { MobileSidePanel } from "@/components/layout/MobileSidePanel";
import { api } from "@/services/api";
const NOTIFICATIONS = [
  { id: "n1", title: "Yangi haftalik reyting e’lon qilindi", time: "5 daqiqa oldin", unread: true },
  { id: "n2", title: "JavaScript testida 850 XP yig‘dingiz", time: "2 soat oldin", unread: true },
  { id: "n3", title: "“14 kunlik seriya” nishoni ochildi", time: "Kecha", unread: false }
];

export function TopBar() {
  const [open, setOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);

  const { user, logout } = useAuthStore();
  const pathname = usePathname();

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      if (user) {
        const count = await api.getUnreadNotificationsCount();
        setUnreadCount(count);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchNotifications = async () => {
    try {
      if (user) {
        const data = await api.getNotifications(1);
        setNotifications(data.slice(0, 5)); // Show max 5 in dropdown
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const intervalId = setInterval(fetchUnreadCount, 60000); // poll every 60s
    return () => clearInterval(intervalId);
  }, [user]);

  useEffect(() => {
    if (open) {
      fetchNotifications();
    }
  }, [open]);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-line bg-bg/90 px-5 backdrop-blur lg:justify-start lg:px-8">
        {/* Mobile Logo */}
        <div className="flex items-center gap-2.5 lg:hidden">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-neon/15 text-neon">
            <TerminalIcon className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="text-lg font-bold tracking-tight">
            Coda<span className="text-neon">Script</span>
          </span>
        </div>

        {/* Desktop Search */}
        <label className="relative hidden max-w-sm flex-1 items-center lg:flex">
          <SearchIcon className="pointer-events-none absolute left-3 h-4 w-4 text-ink-muted" aria-hidden="true" />
          <span className="sr-only">Qidiruv</span>
          <input
            type="search"
            placeholder="Test yoki mavzu qidirish..."
            className="h-10 w-full rounded-xl border border-line bg-surface pl-9 pr-3 text-sm text-ink placeholder:text-ink-muted transition-colors duration-150 focus:border-neon focus:outline-none"
          />
        </label>

        {/* Right side items */}
        <div className="flex items-center gap-3 lg:ml-auto">
          {/* Desktop Streak/XP */}
          <span className="hidden items-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-warning lg:flex">
            <FlameIcon className="h-3.5 w-3.5" aria-hidden="true" />
            {user?.streak || 0} kun
          </span>
          <span className="hidden items-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-neon lg:flex">
            <ZapIcon className="h-3.5 w-3.5" aria-hidden="true" />
            {user?.score || 0} XP
          </span>

          {/* Desktop Notifications */}
          <div className="relative hidden lg:block" ref={ref}>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-haspopup="true"
              aria-expanded={open}
              aria-label={`Bildirishnomalar${unreadCount ? `, ${unreadCount} ta o'qilmagan` : ""}`}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface text-ink-dim transition-colors duration-150 hover:border-neon/50 hover:text-ink"
            >
              <BellIcon className="h-[18px] w-[18px]" aria-hidden="true" />
              {unreadCount > 0 && (
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-neon ring-2 ring-surface" />
              )}
            </button>

            {open && (
              <div className="absolute right-0 top-12 w-80 overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl shadow-black/50">
                <div className="flex items-center justify-between border-b border-line px-4 py-3">
                  <p className="text-sm font-semibold">Bildirishnomalar</p>
                  <Link href="/notifications" onClick={() => setOpen(false)} className="text-xs text-neon hover:underline">Barchasini ko'rish</Link>
                </div>
                <ul className="max-h-[300px] overflow-y-auto coda-scroll">
                  {notifications.length === 0 ? (
                     <li className="px-4 py-6 text-center text-sm text-ink-dim">Bildirishnomalar yo'q</li>
                  ) : (
                    notifications.map((n) => (
                      <li key={n._id} className="border-b border-line/60 px-4 py-3 last:border-0 hover:bg-elevated transition-colors">
                        <Link href="/notifications" onClick={() => setOpen(false)}>
                          <p className={`text-sm ${!n.isRead ? "text-ink font-semibold" : "text-ink-dim"}`}>{n.title}</p>
                          <p className={`mt-1 text-xs ${!n.isRead ? "text-ink-dim" : "text-ink-muted"}`}>{n.message}</p>
                        </Link>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            )}
          </div>

          {/* Desktop Profile */}
          <Link
            href="/profile"
            className="hidden items-center gap-3 rounded-xl border border-line bg-surface py-1.5 pl-1.5 pr-3 transition-colors duration-150 hover:border-neon/50 lg:flex"
          >
            {user?.avatar ? (
              <img src={user.avatar} alt="Avatar" className="h-8 w-8 rounded-lg object-cover" />
            ) : (
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-neon text-sm font-bold text-bg">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </span>
            )}
            <span className="leading-tight">
              <span className="block text-sm font-semibold truncate max-w-[100px]">{user?.name || "User"}</span>
              <span className="block text-[11px] text-ink-dim">Level {user?.level || 1}</span>
            </span>
          </Link>

          {/* Mobile Hamburger Menu */}
          <button 
            type="button" 
            onClick={() => setDrawerOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface text-ink-dim hover:text-ink lg:hidden"
          >
            <MenuIcon className="h-5 w-5" />
          </button>
        </div>
      </header>

      <MobileSidePanel isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
