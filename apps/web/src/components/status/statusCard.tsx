"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { RefreshCwIcon, HomeIcon, type LucideIcon } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Illustratsiya to'plamlari — public/illustrations/... ga joylang   */
/* ------------------------------------------------------------------ */

export const LOADER_ILLUSTRATIONS = [
  "/illustrations/loader-coding-boy.png",
  "/illustrations/loader-dino.png",
  "/illustrations/loader-terminal.png",
  "/illustrations/loader-astronaut.png",
] as const;

export const ERROR_ILLUSTRATIONS = [
  "/illustrations/error-confused-boy.png",
  "/illustrations/error-broken-robot.png",
  "/illustrations/error-spilled-coffee.png",
  "/illustrations/error-cat-404.png",
] as const;

export function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/* ------------------------------------------------------------------ */
/*  LoaderCard                                                        */
/* ------------------------------------------------------------------ */

interface LoaderCardProps {
  illustrationSrc: string;
  title: string;
  subtitle?: string;
  /** 0–100 oralig'ida, berilmasa progress-bar chizilmaydi */
  progress?: number;
}

export function LoaderCard({
  illustrationSrc,
  title,
  subtitle = "Iltimos, kuting",
  progress,
}: LoaderCardProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="flex flex-col items-center p-6 text-center"
    >
      <motion.div
        animate={reduceMotion ? {} : { y: [0, -6, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        className="relative mb-6 h-56 w-56"
      >
        <Image
          src={illustrationSrc}
          alt=""
          fill
          sizes="224px"
          className="object-contain"
        />
      </motion.div>

      <h3 className="text-xl font-bold text-neon">{title}</h3>
      <p className="mt-2 text-base text-ink-dim">{subtitle}</p>

      {typeof progress === "number" && (
        <div className="mt-6 flex w-full max-w-xs items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-elevated">
            <motion.div
              className="h-full rounded-full bg-neon"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
          <span className="w-10 shrink-0 text-right text-xs font-medium text-ink-dim">
            {Math.round(progress)}%
          </span>
        </div>
      )}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  ErrorCard                                                         */
/* ------------------------------------------------------------------ */

interface ErrorCardProps {
  illustrationSrc: string;
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: "retry" | "home";
}

export function ErrorCard({
  illustrationSrc,
  title,
  subtitle,
  actionLabel = "Qayta urinib ko'rish",
  onAction,
  actionIcon = "retry",
}: ErrorCardProps) {
  const reduceMotion = useReducedMotion();
  const Icon: LucideIcon = actionIcon === "home" ? HomeIcon : RefreshCwIcon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{
        opacity: 1,
        scale: 1,
        x: reduceMotion ? 0 : [0, -8, 8, -6, 6, -3, 3, 0],
      }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col items-center p-6 text-center"
    >
      <div className="relative mb-6 h-56 w-56">
        <Image
          src={illustrationSrc}
          alt=""
          fill
          sizes="224px"
          className="object-contain drop-shadow-xl"
        />
      </div>

      <h3 className="text-xl font-bold text-danger">{title}</h3>
      <p className="mt-2 text-base text-ink-dim max-w-sm">{subtitle}</p>

      {onAction && (
        <motion.button
          type="button"
          whileHover={reduceMotion ? {} : { scale: 1.05 }}
          whileTap={reduceMotion ? {} : { scale: 0.95 }}
          onClick={onAction}
          className="mt-6 flex items-center gap-2 rounded-xl border border-danger/40 bg-danger/10 px-6 py-2.5 text-sm font-medium text-danger transition-colors duration-150 hover:bg-danger/20"
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
          {actionLabel}
        </motion.button>
      )}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Foydalanish namunasi:
 *
 *  // apps/web/src/app/(dashboard)/masalalar/loading.tsx
 *  'use client';
 *  import { LoaderCard, LOADER_ILLUSTRATIONS, pickRandom } from '@/components/status/statusCard';
 *  import { useMemo } from 'react';
 *
 *  export default function Loading() {
 *    const src = useMemo(() => pickRandom(LOADER_ILLUSTRATIONS), []);
 *    return <LoaderCard illustrationSrc={src} title="Masalalar yuklanmoqda..." progress={68} />;
 *  }
 *
 *  // xato holati uchun (masalan TanStack Query'ning onError'ida yoki error.tsx'da):
 *  <ErrorCard
 *    illustrationSrc="/illustrations/error-confused-boy.png"
 *    title="Xatolik yuz berdi!"
 *    subtitle="Server bilan bog'lanishda muammo yuz berdi."
 *    onAction={() => refetch()}
 *  />
 * ------------------------------------------------------------------ */
