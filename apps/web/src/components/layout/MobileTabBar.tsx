'use client';
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, CodeIcon, UsersIcon, TrophyIcon } from "lucide-react";

const TABS = [
  { to: "/quizzes", label: "Testlar", icon: HomeIcon },
  { to: "/problems", label: "Amaliy masalalar", icon: CodeIcon },
  { to: "/community", label: "Jamiyat", icon: UsersIcon },
  { to: "/leaderboard", label: "Leaderboard", icon: TrophyIcon }
];

export function MobileTabBar() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-line bg-surface px-2 pb-safe pt-2 lg:hidden">
      {TABS.map(({ to, label, icon: Icon }) => {
        const isActive = pathname.startsWith(to);
        return (
          <Link
            key={to}
            href={to}
            className={`flex flex-col items-center gap-1 p-2 ${isActive ? "text-neon" : "text-ink-muted hover:text-ink"}`}
          >
            <div className="relative">
              <Icon className="h-6 w-6" aria-hidden="true" />
              {isActive && (
                <span className="absolute -top-3 left-1/2 h-1 w-6 -translate-x-1/2 rounded-full bg-neon" />
              )}
            </div>
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        );
      })}
    </div>
  );
}

