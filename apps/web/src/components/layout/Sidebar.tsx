"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
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
  UsersIcon,
  ZapIcon,
  BookmarkIcon,
  HelpCircleIcon,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";

const NAV = [
  {
    to: "/dashboard",
    label: "Boshqaruv paneli",
    icon: LayoutDashboardIcon,
    end: true,
  },
  { to: "/quizzes", label: "Testlar", icon: ListChecksIcon },
  { to: "/problems", label: "Amaliy masalalar", icon: CodeIcon },
  { to: "/community", label: "Jamiyat", icon: UsersIcon },
  { to: "/leaderboard", label: "Leaderboard", icon: TrophyIcon },
];

const NAV_SECONDARY = [
  { to: "/history-xp", label: "XP Tarixi", icon: ZapIcon },
  { to: "/history", label: "Test tarixi", icon: ClockIcon },
  { to: "/saved", label: "Saqlanganlar", icon: BookmarkIcon },
  { to: "/friends", label: "Do‘stlar", icon: UsersIcon },
  { to: "/profile", label: "Profilim", icon: UserIcon },
  { to: "/settings", label: "Sozlamalar", icon: SettingsIcon },
  { to: "/help", label: "Yordam", icon: HelpCircleIcon },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-line bg-surface lg:flex">
      <div className="flex h-16 items-center gap-2.5 border-b border-line px-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-neon/15 text-neon">
          {/* <TerminalIcon className="h-5 w-5" aria-hidden="true" /> */}
          <Image src={"/icon.png"} alt="Logo" width={"32"} height={"32"} />
        </span>
        <span className="text-[17px] font-bold tracking-tight">
          Coda<span className="text-neon">Script</span>
        </span>
      </div>

      <div className="coda-scroll flex-1 overflow-y-auto">
        <nav aria-label="Asosiy navigatsiya" className="space-y-1 px-3 py-5">
          {NAV.map(({ to, label, icon: Icon, end }) => {
            const isActive = end ? pathname === to : pathname.startsWith(to);
            return (
              <Link
                key={to}
                href={to}
                className={[
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-150",
                  isActive
                    ? "bg-neon/10 text-neon"
                    : "text-ink-dim hover:bg-elevated hover:text-ink",
                ].join(" ")}
              >
                <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                <span>{label}</span>
                {isActive && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-neon" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="my-2 border-t border-line mx-3" />

        <nav
          aria-label="Qo'shimcha navigatsiya"
          className="space-y-1 px-3 py-5"
        >
          {NAV_SECONDARY.map(({ to, label, icon: Icon }) => {
            const isActive = pathname.startsWith(to);
            return (
              <Link
                key={to}
                href={to}
                className={[
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-150",
                  isActive
                    ? "bg-neon/10 text-neon"
                    : "text-ink-dim hover:bg-elevated hover:text-ink",
                ].join(" ")}
              >
                <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                <span>{label}</span>
                {isActive && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-neon" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {user?.role === "admin" && (
        <div className="border-t border-line p-3">
          <Link
            href="/admin"
            className={[
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-150",
              pathname.startsWith("/admin")
                ? "bg-elevated text-ink"
                : "text-ink-muted hover:bg-elevated hover:text-ink",
            ].join(" ")}
          >
            <ShieldIcon className="h-[18px] w-[18px]" aria-hidden="true" />
            Admin panel
          </Link>
        </div>
      )}
    </aside>
  );
}
