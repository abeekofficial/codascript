"use client";
import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserIcon,
  SettingsIcon,
  ZapIcon,
  BookmarkIcon,
  UsersIcon,
  HelpCircleIcon,
  LogOutIcon,
  ShieldIcon,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";

// Note: /notifications is omitted as it does not exist in the codebase.
const PANEL_LINKS = [
  { to: "/profile", label: "Profilim", icon: UserIcon },
  { to: "/settings", label: "Sozlamalar", icon: SettingsIcon },
  { to: "/saved", label: "Saqlanganlar", icon: BookmarkIcon },
  { to: "/help", label: "Yordam", icon: HelpCircleIcon },
];

interface MobileSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileSidePanel({ isOpen, onClose }: MobileSidePanelProps) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  // Close panel on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Prevent scrolling when panel is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleLogout = () => {
    onClose();
    logout();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-bg/80 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="absolute right-0 top-0 h-full w-[85%] max-w-sm bg-bg border-l border-line shadow-2xl flex flex-col"
          >
            {/* Header / User Info */}
            <div className="p-5 flex flex-col gap-4 border-b border-line">
              <div className="flex items-center gap-3">
                {user?.avatar ? (
                  <img
                    src={user?.avatar}
                    alt="Avatar"
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-neon/15 text-neon text-lg font-bold">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </span>
                )}
                <div className="flex flex-col">
                  <span className="font-semibold text-ink">
                    {user?.name || "User"}
                  </span>
                  <span className="inline-flex w-fit items-center rounded-full bg-neon/10 px-2.5 py-0.5 text-xs font-medium text-neon mt-1">
                    Level {user?.level || 1}
                  </span>
                </div>
              </div>

              {/* XP Progress Bar */}
              <div className="flex flex-col gap-1.5 mt-2">
                <div className="flex items-center justify-between text-sm font-medium">
                  <span className="flex items-center gap-2 text-neon">
                    <ZapIcon className="h-4 w-4" />
                    {user?.totalXP || 0} XP
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-elevated overflow-hidden">
                  <div
                    className="h-full bg-neon transition-all duration-500"
                    style={{ width: `${((user?.totalXP || 0) % 1000) / 10}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Links List */}
            <nav className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1 coda-scroll">
              {PANEL_LINKS.map(({ to, label, icon: Icon }) => {
                const isActive = pathname === to;
                return (
                  <Link
                    key={to}
                    href={to}
                    onClick={onClose}
                    className={`flex items-center gap-4 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                      isActive
                        ? "text-neon bg-neon/5"
                        : "text-ink-dim hover:text-ink hover:bg-elevated"
                    }`}
                  >
                    <Icon className="h-[18px] w-[18px]" />
                    {label}
                  </Link>
                );
              })}
            </nav>

            {/* Logout Button */}
            <div className="p-4 border-t border-line mt-auto flex flex-col gap-1">
              {user?.role === "admin" && (
                <Link
                  href="/admin"
                  onClick={onClose}
                  className={`flex items-center gap-4 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                    pathname.startsWith("/admin")
                      ? "text-neon bg-neon/5"
                      : "text-ink-dim hover:text-ink hover:bg-elevated"
                  }`}
                >
                  <ShieldIcon className="h-[18px] w-[18px]" />
                  Admin panel
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-4 rounded-xl px-4 py-3 text-sm font-medium text-ink-dim hover:text-ink hover:bg-elevated transition-colors"
              >
                <LogOutIcon className="h-[18px] w-[18px]" />
                Chiqish
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
