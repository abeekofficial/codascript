"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  CheckCircle2Icon,
  ClockIcon,
  HomeIcon,
  MinusCircleIcon,
  WrenchIcon,
  XCircleIcon,
  ZapIcon,
} from "lucide-react";
import { TECH_MAP } from "@/data/tech";
import { useQuizStore } from "@/store/quizStore";

function verdict(pct: number) {
  if (pct >= 85)
    return {
      title: "A’lo natija!",
      text: "Siz bu mavzuni ishonchli egallagansiz.",
      color: "#10B981",
    };
  if (pct >= 65)
    return {
      title: "Yaxshi natija",
      text: "Bir necha mavzuni mustahkamlash kifoya.",
      color: "#FBBF24",
    };
  return {
    title: "Mashq kerak",
    text: "Xatolar ustida ishlab, testni qayta yeching.",
    color: "#F87171",
  };
}

export default function Natijalar() {
  const { questions, answers, topic } = useQuizStore();

  const tech = TECH_MAP[topic as keyof typeof TECH_MAP] || {
    label: topic,
    color: "#10B981",
  };

  let correct = 0;
  let wrong = 0;
  let skipped = 0;

  const mistakes: any[] = [];
  const topicBreakdown: Record<string, { correct: number; total: number }> = {};

  questions.forEach((q) => {
    if (!topicBreakdown[q.topic]) {
      topicBreakdown[q.topic] = { correct: 0, total: 0 };
    }
    topicBreakdown[q.topic].total++;

    const ans = answers[q.id];
    if (!ans) {
      skipped++;
    } else if (ans.isCorrect) {
      correct++;
      topicBreakdown[q.topic].correct++;
    } else {
      wrong++;
      mistakes.push({
        id: q.id,
        prompt: q.question,
        explanation: ans.explanation || "Izoh mavjud emas.",
      });
    }
  });

  const total = questions.length || 1;
  const xp = correct * 10;
  const pct = Math.round((correct / total) * 100);
  const v = verdict(pct);

  const radius = 84;
  const circumference = 2 * Math.PI * radius;
  // Temporary duration mock since we don't track start time in state perfectly right now
  const minutes = 0;
  const seconds = 0;

  const stats = [
    {
      id: "correct",
      label: "To‘g‘ri",
      value: correct,
      icon: CheckCircle2Icon,
      color: "#10B981",
    },
    {
      id: "wrong",
      label: "Noto‘g‘ri",
      value: wrong,
      icon: XCircleIcon,
      color: "#F87171",
    },
    {
      id: "skipped",
      label: "O‘tkazib yuborilgan",
      value: skipped,
      icon: MinusCircleIcon,
      color: "#8B949E",
    },
    {
      id: "xp",
      label: "Yig‘ilgan XP",
      value: xp,
      icon: ZapIcon,
      color: "#FBBF24",
    },
  ];

  return (
    <div className="mx-auto max-w-5xl">
      <section className="rounded-2xl border border-line bg-surface px-6 py-10 text-center">
        <p className="flex items-center justify-center gap-2 text-sm text-ink-dim">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: tech.color }}
          />
          {tech.label} testi yakunlandi
        </p>

        <div className="relative mx-auto mt-7 h-52 w-52">
          <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90">
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke="#1F2937"
              strokeWidth="14"
            />
            <motion.circle
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke={v.color}
              strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: circumference * (1 - pct / 100) }}
              transition={{ duration: 0.9, ease: [0.23, 1, 0.32, 1] }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-extrabold tabular-nums tracking-tight">
              {pct}%
            </span>
            <span className="mt-1 text-xs text-ink-dim">natija</span>
          </div>
        </div>

        <h1 className="mt-6 text-2xl font-bold" style={{ color: v.color }}>
          {v.title}
        </h1>
        <p className="mt-1.5 text-sm text-ink-dim">{v.text}</p>
      </section>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ id, label, value, icon: Icon, color }) => (
          <div
            key={id}
            className="flex flex-col rounded-2xl border border-line bg-surface p-5"
          >
            <span
              className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${color}1F`, color }}
            >
              <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
            </span>
            <span
              className="mt-4 text-3xl font-bold tabular-nums"
              style={{ color }}
            >
              {value}
            </span>
            <span className="mt-auto pt-1 text-sm text-ink-dim">{label}</span>
          </div>
        ))}
      </div>

      <section className="mt-6 rounded-2xl border border-line bg-surface p-6">
        <h2 className="text-base font-semibold">
          Ko‘rib chiqish uchun savollar (Xatolar)
        </h2>
        <ul className="mt-4 divide-y divide-line">
          {mistakes.slice(0, 3).map((q, i) => (
            <li
              key={q.id}
              className="flex items-start gap-4 py-4 first:pt-0 last:pb-0"
            >
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-danger/15 text-xs font-bold text-danger">
                {i + 1}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium">{q.prompt}</p>
                <p className="mt-1 text-xs text-ink-dim">{q.explanation}</p>
              </div>
            </li>
          ))}
          {mistakes.length === 0 && (
            <p className="text-sm text-ink-muted">
              Ajoyib! Hech qanday xato yo'q.
            </p>
          )}
        </ul>
      </section>

      {Object.keys(topicBreakdown).length > 1 && (
        <section className="mt-6 rounded-2xl border border-line bg-surface p-6">
          <h2 className="text-base font-semibold mb-4">
            Mavzular bo'yicha tahlil
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {Object.entries(topicBreakdown).map(([t, stats]) => {
              // t is the topic string from DB, e.g. "JavaScript"
              // TECH_MAP keys are 'js', 'html' etc. We need to find by label or map directly
              const techEntry = Object.values(TECH_MAP).find(
                (tech) => tech.label.toLowerCase() === t.toLowerCase(),
              );
              const techObj = techEntry || { label: t, color: "#10B981" };
              const perc = Math.round((stats.correct / stats.total) * 100);
              return (
                <div
                  key={t}
                  className="flex items-center justify-between rounded-xl bg-elevated p-4 border border-line"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: techObj.color }}
                    />
                    <span className="font-semibold text-sm">
                      {techObj.label}
                    </span>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-sm font-bold ${perc >= 70 ? "text-success" : perc >= 40 ? "text-warning" : "text-danger"}`}
                    >
                      {stats.correct} / {stats.total} to'g'ri
                    </span>
                    <p className="text-xs text-ink-muted mt-0.5">
                      {perc}% aniqlik
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/quizzes"
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-neon px-5 py-3 text-sm font-semibold text-bg transition-colors duration-150 hover:bg-neon-hover"
        >
          <WrenchIcon className="h-4 w-4" aria-hidden="true" />
          Yangi test boshlash
        </Link>
        <Link
          href="/dashboard"
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-line bg-elevated px-5 py-3 text-sm font-medium text-ink transition-colors duration-150 hover:border-ink-muted"
        >
          <HomeIcon className="h-4 w-4" aria-hidden="true" />
          Bosh sahifaga qaytish
        </Link>
      </div>
    </div>
  );
}
