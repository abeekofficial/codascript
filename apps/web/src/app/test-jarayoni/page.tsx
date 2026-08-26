'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon, FlagIcon, TerminalIcon, TimerIcon, XIcon } from 'lucide-react';
import { TECH_MAP } from '@/data/tech';
import { useQuizStore } from '@/store/quizStore';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/services/api';
import { CodeQuestion } from '@/components/quiz/CodeQuestion';

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

function formatTime(total: number) {
  const h = Math.floor(total / 3600);
  const m = Math.floor(total % 3600 / 60);
  const s = total % 60;
  if (h > 0) return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':');
  return [m, s].map((v) => String(v).padStart(2, '0')).join(':');
}

export default function TestJarayoni() {
  const router = useRouter();
  const {
    quizId,
    questions,
    currentQuestionIndex,
    answers,
    timeRemaining,
    topic,
    difficulty,
    isFinished,
    nextQuestion,
    prevQuestion,
    answerQuestion,
    decrementTime,
    finishQuiz,
    resetQuiz
  } = useQuizStore();

  const tech = TECH_MAP[topic as keyof typeof TECH_MAP] || { label: topic, color: '#10B981' };
  const difficultyLabel = difficulty;

  useEffect(() => {
    if (!quizId || questions.length === 0) {
      router.push('/test-tanlash');
      return;
    }
    const id = window.setInterval(() => {
      decrementTime();
    }, 1000);
    return () => window.clearInterval(id);
  }, [quizId, questions.length, decrementTime, router]);

  const answeredCount = Object.keys(answers).length;
  const question = questions[currentQuestionIndex];
  const progressPct = ((currentQuestionIndex + 1) / questions.length) * 100;
  const lowTime = timeRemaining < 60;

  // We are storing answer via backend, so we need a local submitting state if we wait
  const [submitting, setSubmitting] = useState(false);

  async function select(index: number, optionText: string) {
    if (!quizId || !question) return;
    setSubmitting(true);
    try {
      const res = await api.submitAnswer(quizId, question.id, index, optionText);
      answerQuestion(question.id, res);
    } catch (e) {
      console.error(e);
      alert('Javobni saqlashda xatolik');
    } finally {
      setSubmitting(false);
    }
  }

  async function finish() {
    if (!quizId) return;
    try {
      await api.completeQuiz(quizId);
      
      // Update local profile stats after finishing the quiz
      try {
        const updatedProfile = await api.getProfile();
        useAuthStore.getState().login(updatedProfile, localStorage.getItem('token') || '');
      } catch (err) {}

      finishQuiz();
      router.push('/natijalar');
    } catch (e) {
      console.error(e);
      alert('Testni yakunlashda xatolik');
    }
  }

  useEffect(() => {
    if (isFinished) {
      finish();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFinished]);

  if (!question) return null;

  return (
    <div className="flex min-h-screen w-full flex-col bg-bg text-ink">
      <header className="sticky top-0 z-30 border-b border-line bg-bg/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-5 lg:px-8">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-neon/15 text-neon">
            <TerminalIcon className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: tech.color }} />
              <span className="truncate">
                {tech.label} <span className="text-ink-muted">•</span> {difficultyLabel}
              </span>
            </p>
            <p className="text-xs text-ink-dim">Faol test</p>
          </div>

          <p className="ml-auto hidden text-sm font-semibold sm:block">
            <span className="text-neon">{currentQuestionIndex + 1}</span>
            <span className="text-ink-muted"> / {questions.length}</span>
          </p>

          <span
            className={[
              'flex items-center gap-2 rounded-xl border px-3.5 py-2 font-mono text-sm font-medium tabular-nums',
              lowTime ? 'border-danger/50 bg-danger/10 text-danger' : 'border-line bg-surface text-ink'
            ].join(' ')}
          >
            <TimerIcon className="h-4 w-4" aria-hidden="true" />
            {formatTime(timeRemaining)}
          </span>

          <button
            type="button"
            onClick={() => {
              resetQuiz();
              router.push('/test-tanlash');
            }}
            aria-label="Testdan chiqish"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface text-ink-dim transition-colors duration-150 hover:border-danger/50 hover:text-danger"
          >
            <XIcon className="h-[18px] w-[18px]" aria-hidden="true" />
          </button>
        </div>
        <div className="h-0.5 w-full bg-elevated">
          <div
            className="h-full bg-neon transition-[width] duration-300 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </header>

      <div className={`mx-auto w-full max-w-7xl flex-1 px-5 py-7 lg:px-8 ${question.type === 'code' ? 'flex flex-col' : 'grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]'}`}>
        <div className="min-w-0 flex-1">
          <motion.section
            key={question.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className={`rounded-2xl bg-surface ${question.type === 'code' ? '' : 'border border-line p-6 lg:p-7'}`}
            aria-live="polite"
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-ink-dim uppercase tracking-wider">
                <span className="text-neon">{question.topic || topic}</span>
                {question.subtopic && (
                  <>
                    <span>&rsaquo;</span>
                    <span className="text-warning">{question.subtopic}</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded-lg bg-elevated px-2.5 py-1 text-xs font-semibold text-ink-dim">
                  Savol {currentQuestionIndex + 1}
                </span>
                <span className="text-xs font-medium text-warning">{difficultyLabel}</span>
              </div>
            </div>

            {question.type !== 'code' && (
              <h1 className="mt-4 text-lg font-semibold leading-snug lg:text-xl">{question.question}</h1>
            )}

            {question.type === 'code' ? (
              <CodeQuestion 
                question={question} 
                disabled={!!answers[question.id] || submitting}
                onAnswerSubmit={async (isCorrect, code) => {
                  if (!quizId || !question) return;
                  setSubmitting(true);
                  try {
                    const res = await api.submitAnswer(quizId, question.id, isCorrect ? 1 : 0, code); // option text as code
                    answerQuestion(question.id, res);
                  } catch (e) {
                    console.error(e);
                    alert('Javobni saqlashda xatolik');
                  } finally {
                    setSubmitting(false);
                  }
                }} 
              />
            ) : (
              <div className="mt-6 space-y-2.5" role="radiogroup" aria-label="Javob variantlari">
                {question.options.map((option, i) => {
                  const answered = answers[question.id];
                  const active = answered?.selectedOptionIndex === i;
                  const isSelectedCorrect = answered?.isCorrect && active;
                  const isSelectedWrong = !answered?.isCorrect && active;
                  
                  // If it was answered incorrectly, highlight the correct option by matching text
                  const isActuallyCorrect = answered && !answered.isCorrect && answered.correctAnswerText === option;

                  return (
                    <button
                      key={i}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => {
                        if (!answered) select(i, option);
                      }}
                      disabled={!!answered || submitting}
                      className={[
                        'flex w-full items-center gap-4 rounded-xl border px-4 py-3.5 text-left transition-colors duration-150',
                        isSelectedCorrect || isActuallyCorrect ? 'border-neon bg-neon/10' :
                        isSelectedWrong ? 'border-danger bg-danger/10' :
                        !answered && answers[question.id]?.selectedOptionIndex === i ? 'border-neon bg-neon/10' :
                        'border-line bg-elevated hover:border-ink-muted'
                      ].join(' ')}
                    >
                      <span
                        className={[
                          'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold',
                          isSelectedCorrect || isActuallyCorrect ? 'bg-neon text-bg' :
                          isSelectedWrong ? 'bg-danger text-bg' :
                          !answered && answers[question.id]?.selectedOptionIndex === i ? 'bg-neon text-bg' : 'bg-surface text-ink-dim'
                        ].join(' ')}
                      >
                        {LETTERS[i]}
                      </span>
                      <span className={`font-mono text-sm ${active || isActuallyCorrect ? 'text-ink' : 'text-ink-dim'}`}>
                        {option}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Explanation box */}
            {answers[question.id] && answers[question.id].explanation && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-6 overflow-hidden rounded-xl bg-elevated/50 p-4 border border-line"
              >
                <div className="flex items-center gap-2 text-sm font-semibold mb-2">
                  <span className={answers[question.id].isCorrect ? 'text-neon' : 'text-danger'}>
                    {answers[question.id].isCorrect ? "To'g'ri!" : "Noto'g'ri"}
                  </span>
                </div>
                <p className="text-sm text-ink-dim">{answers[question.id].explanation}</p>
              </motion.div>
            )}
          </motion.section>

          <div className="mt-5 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={prevQuestion}
              disabled={currentQuestionIndex === 0}
              className="flex items-center gap-2 rounded-xl border border-line bg-elevated px-5 py-2.5 text-sm font-medium text-ink transition-colors duration-150 hover:border-ink-muted disabled:cursor-not-allowed disabled:text-ink-muted/60"
            >
              <ChevronLeftIcon className="h-4 w-4" aria-hidden="true" />
              Oldingi
            </button>

            {currentQuestionIndex === questions.length - 1 ? (
              <button
                type="button"
                onClick={finish}
                className="flex items-center gap-2 rounded-xl bg-neon px-5 py-2.5 text-sm font-semibold text-bg transition-colors duration-150 hover:bg-neon-hover"
              >
                <FlagIcon className="h-4 w-4" aria-hidden="true" />
                Testni yakunlash
              </button>
            ) : (
              <button
                type="button"
                onClick={nextQuestion}
                className="flex items-center gap-2 rounded-xl bg-neon px-5 py-2.5 text-sm font-semibold text-bg transition-colors duration-150 hover:bg-neon-hover"
              >
                Keyingi
                <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        {question.type !== 'code' && (
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-line bg-surface p-5">
              <div className="flex items-baseline justify-between">
                <h2 className="text-sm font-semibold">Savollar xaritasi</h2>
                <span className="text-xs text-ink-muted">
                  {answeredCount}/{questions.length}
                </span>
              </div>

              <div className="coda-scroll mt-4 grid max-h-[280px] grid-cols-5 gap-2 overflow-y-auto">
                {questions.map((q, i) => {
                  const isCurrent = i === currentQuestionIndex;
                  const isAnswered = !!answers[q.id];
                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => useQuizStore.setState({ currentQuestionIndex: i })}
                      aria-current={isCurrent ? 'true' : undefined}
                      aria-label={`Savol ${i + 1}${isAnswered ? ', javob berilgan' : ''}`}
                      className={[
                        'flex h-10 items-center justify-center rounded-lg border text-sm font-semibold transition-colors duration-150',
                        isCurrent
                          ? 'border-warning bg-warning/15 text-warning'
                          : isAnswered
                          ? 'border-neon/50 bg-neon/15 text-neon'
                          : 'border-line bg-elevated text-ink-muted hover:border-ink-muted hover:text-ink-dim'
                      ].join(' ')}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>

              <ul className="mt-5 space-y-2 border-t border-line pt-4 text-xs text-ink-dim">
                <li className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded border border-neon/50 bg-neon/15" />
                  Javob berilgan
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded border border-warning bg-warning/15" />
                  Joriy savol
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded border border-line bg-elevated" />
                  Javobsiz
                </li>
              </ul>

              <button
                type="button"
                onClick={finish}
                className="mt-5 w-full rounded-xl border border-line bg-elevated px-4 py-2.5 text-sm font-medium text-ink transition-colors duration-150 hover:border-neon/60 hover:text-neon"
              >
                Yakunlash va topshirish
              </button>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
