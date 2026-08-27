'use client';

import React, { useEffect, useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { TECH_MAP } from '@/data/tech';
import { api } from '@/services/api';
import { ClockIcon, CheckCircle2Icon, XCircleIcon, Loader2Icon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

interface HistoryAttempt {
  _id: string;
  quizId: string;
  topic: string;
  difficulty: string;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  score: number;
  completedAt: string;
  answers: Array<{
    questionId: string;
    isCorrect: boolean;
    answeredAt: string;
  }>;
}

export default function Tarix() {
  const [attempts, setAttempts] = useState<HistoryAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedAttempt, setSelectedAttempt] = useState<HistoryAttempt | null>(null);
  const limit = 20;

  useEffect(() => {
    loadHistory();
  }, [page]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await api.getHistory(page, limit);
      setAttempts(data.attempts);
      setTotal(data.total);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-neon';
    if (score >= 65) return 'text-warning';
    return 'text-danger';
  };

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        eyebrow="Natijalar"
        title="Test tarixi"
        description="Barcha yakunlangan testlaringiz ro'yxati."
      />

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2Icon className="h-8 w-8 animate-spin text-ink-dim" />
        </div>
      ) : attempts.length === 0 ? (
        <div className="rounded-2xl border border-line bg-surface p-10 text-center">
          <p className="text-ink-dim">Hali yakunlangan testlar yo'q.</p>
          <a href="/quizzes" className="mt-4 inline-block rounded-xl bg-neon px-5 py-2.5 text-sm font-semibold text-bg hover:bg-neon-hover">
            Test boshlash
          </a>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {attempts.map((attempt) => {
              const tech = TECH_MAP[
                attempt.topic === 'JavaScript' ? 'js' :
                attempt.topic === 'TypeScript' ? 'ts' :
                attempt.topic === 'React' ? 'react' :
                attempt.topic === 'HTML' ? 'html' :
                attempt.topic === 'CSS' ? 'css' : 'js'
              ] || { color: '#10B981', label: attempt.topic };

              return (
                <button
                  key={attempt._id}
                  onClick={() => setSelectedAttempt(selectedAttempt?._id === attempt._id ? null : attempt)}
                  className="w-full rounded-2xl border border-line bg-surface p-5 text-left transition-colors hover:border-ink-muted"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: tech.color }} />
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{tech.label}</p>
                        <p className="text-xs text-ink-dim mt-0.5">
                          {attempt.difficulty} • {attempt.totalQuestions} savol
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-5 shrink-0">
                      <div className="flex items-center gap-1.5 text-sm">
                        <CheckCircle2Icon className="h-4 w-4 text-neon" />
                        <span className="font-medium">{attempt.correctAnswers}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm">
                        <XCircleIcon className="h-4 w-4 text-danger" />
                        <span className="font-medium">{attempt.wrongAnswers}</span>
                      </div>
                      <span className={`text-lg font-bold tabular-nums ${getScoreColor(attempt.score)}`}>
                        {Math.round(attempt.score)}%
                      </span>
                      <div className="flex items-center gap-1.5 text-xs text-ink-dim">
                        <ClockIcon className="h-3.5 w-3.5" />
                        <span>{formatDate(attempt.completedAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Batafsil natija (modal o'rniga inline) */}
                  {selectedAttempt?._id === attempt._id && (
                    <div className="mt-4 border-t border-line pt-4">
                      <p className="text-sm font-medium mb-3">Javoblar tafsiloti:</p>
                      <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                        {attempt.answers.map((ans, i) => (
                          <span
                            key={i}
                            className={`flex h-9 items-center justify-center rounded-lg border text-xs font-semibold ${
                              ans.isCorrect
                                ? 'border-neon/50 bg-neon/15 text-neon'
                                : 'border-danger/50 bg-danger/15 text-danger'
                            }`}
                          >
                            {i + 1}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-1 rounded-xl border border-line bg-elevated px-4 py-2 text-sm font-medium text-ink disabled:opacity-50 disabled:cursor-not-allowed hover:border-ink-muted"
              >
                <ChevronLeftIcon className="h-4 w-4" /> Oldingi
              </button>
              <span className="text-sm text-ink-dim">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex items-center gap-1 rounded-xl border border-line bg-elevated px-4 py-2 text-sm font-medium text-ink disabled:opacity-50 disabled:cursor-not-allowed hover:border-ink-muted"
              >
                Keyingi <ChevronRightIcon className="h-4 w-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
