'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRightIcon, FlameIcon, PlayIcon, TargetIcon, TrophyIcon, ZapIcon, AlertTriangleIcon, SparklesIcon } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { TECHS } from '@/data/tech';
import { useAuthStore } from '@/store/authStore';
import { api, ProfileStats } from '@/services/api';

export default function Dashboard() {
  const { user } = useAuthStore();
  const [profileStats, setProfileStats] = useState<ProfileStats | null>(null);
  const [recentAttempts, setRecentAttempts] = useState<any[]>([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [stats, history] = await Promise.all([
          api.getProfileStats(),
          api.getHistory(1, 5)  // So'nggi 5 ta test
        ]);
        setProfileStats(stats);
        setRecentAttempts(history.attempts || []);
      } catch (err) {
        console.error('Dashboard data load error:', err);
      }
    };

    loadDashboardData();
  }, []);

  if (!user) return null;

  const level = user.level || 1;
  const xp = user.totalXP || 0;
  const xpForNextLevel = level * 1000;
  const levelPct = Math.min(Math.round((xp / xpForNextLevel) * 100), 100);
  const streak = user.currentStreak || 0;

  // Streak eslatma: agar streak > 0 va bugun hali test yakunlanmagan
  const todayHasQuiz = recentAttempts.some(a => {
    const completedDate = new Date(a.completedAt);
    const today = new Date();
    return completedDate.toDateString() === today.toDateString();
  });
  const showStreakWarning = streak > 0 && !todayHasQuiz;

  // Adaptiv tavsiya: agar so'nggi 3 ta test 90%+ natija bilan yakunlangan bo'lsa
  const lastThree = recentAttempts.slice(0, 3);
  const showAdaptiveSuggestion = lastThree.length >= 3 &&
    lastThree.every(a => a.score >= 90 && a.difficulty === 'easy');

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        eyebrow="Xush kelibsiz"
        title={`Salom, ${user.name || 'Foydalanuvchi'} 👋`}
        description={streak > 0 ? `${streak} kunlik seriyangiz bor. Uzmang!` : "Bugun birinchi testingizni yeching!"}
        actions={
          <Link
            href="/quizzes"
            className="flex items-center gap-2 rounded-xl bg-neon px-4 py-2.5 text-sm font-semibold text-bg transition-colors duration-150 hover:bg-neon-hover"
          >
            <PlayIcon className="h-4 w-4" aria-hidden="true" />
            Testni boshlash
          </Link>
        }
      />

      {/* Streak eslatma banneri */}
      {showStreakWarning && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-warning/30 bg-warning/5 px-5 py-4">
          <AlertTriangleIcon className="h-5 w-5 shrink-0 text-warning" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-warning">Streak'ingizni saqlab qoling!</p>
            <p className="text-xs text-ink-dim mt-0.5">
              {streak} kunlik seriyangiz bor. Bugun test yechib, uni uzmang!
            </p>
          </div>
          <Link
            href="/quizzes"
            className="ml-auto shrink-0 rounded-lg bg-warning/15 px-3 py-1.5 text-xs font-semibold text-warning hover:bg-warning/25"
          >
            Test yechish
          </Link>
        </div>
      )}

      {/* Adaptiv tavsiya banneri */}
      {showAdaptiveSuggestion && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-neon/30 bg-neon/5 px-5 py-4">
          <SparklesIcon className="h-5 w-5 shrink-0 text-neon" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-neon">Endi "medium" darajasini sinab ko'ring!</p>
            <p className="text-xs text-ink-dim mt-0.5">
              So'nggi 3 ta easy testda a'lo natija ko'rsatdingiz. Qiyinroq darajaga o'ting!
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <section className="rounded-2xl border border-line bg-surface p-6">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-base font-semibold">Level {level}</h2>
            <span className="text-xs text-ink-dim">
              {xp.toLocaleString('ru-RU')} / {xpForNextLevel.toLocaleString('ru-RU')} XP
            </span>
          </div>
          <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-elevated">
            <div className="h-full rounded-full bg-neon" style={{ width: `${levelPct}%` }} />
          </div>

          <div className="mt-6 grid grid-cols-3 gap-4">
            {[
              { icon: FlameIcon, value: String(streak), label: 'kunlik seriya', color: '#FBBF24' },
              { icon: TargetIcon, value: profileStats ? `${profileStats.accuracy}%` : '—', label: 'aniqlik', color: '#10B981' },
              { icon: TrophyIcon, value: `${user.completedQuizzes || 0}`, label: 'testlar', color: '#60A5FA' }
            ].map(({ icon: Icon, value, label, color }) => (
              <div key={label} className="rounded-xl border border-line bg-elevated p-4">
                <Icon className="h-4 w-4" style={{ color }} aria-hidden="true" />
                <p className="mt-3 text-xl font-bold tabular-nums">{value}</p>
                <p className="text-xs text-ink-dim">{label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-line bg-surface p-6">
          <h2 className="text-base font-semibold">Texnologiyalar</h2>
          <ul className="mt-4 space-y-2">
            {TECHS.map((t) => (
              <li key={t.id}>
                <Link
                  href={`/quizzes?tech=${t.id}`}
                  className="flex items-center gap-3 rounded-xl border border-line bg-elevated px-4 py-3 text-sm transition-colors duration-150 hover:border-neon/50"
                >
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: t.color }} />
                  <span className="font-medium">{t.label}</span>
                  <span className="ml-auto text-xs text-ink-muted">{t.questionCount} savol</span>
                  <ArrowRightIcon className="h-3.5 w-3.5 text-ink-muted" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="mt-6 rounded-2xl border border-line bg-surface p-6">
        <div className="mb-4 flex items-baseline justify-between gap-3">
          <h2 className="text-base font-semibold">So'nggi testlar</h2>
          <Link href="/history" className="text-sm font-medium text-neon hover:text-neon-hover">
            Barchasi
          </Link>
        </div>
        <ul className="divide-y divide-line">
          {recentAttempts.length === 0 ? (
            <div className="py-8 text-center text-ink-muted text-sm">
              Hozircha natijalar yo'q. Birinchi testingizni ishlashni boshlang!
            </div>
          ) : (
            recentAttempts.map((a: any) => (
              <li key={a._id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <span className="font-medium text-sm">{a.topic}</span>
                  <span className="text-xs text-ink-dim">{a.difficulty}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-ink-dim">
                    {a.correctAnswers}/{a.totalQuestions}
                  </span>
                  <span className={`font-bold text-sm tabular-nums ${
                    a.score >= 85 ? 'text-neon' : a.score >= 65 ? 'text-warning' : 'text-danger'
                  }`}>
                    {Math.round(a.score)}%
                  </span>
                </div>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}
