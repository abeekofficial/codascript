'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ClockIcon, PlayIcon, SparklesIcon, ZapIcon } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { DIFFICULTIES, QUESTION_COUNTS, TECHS } from '@/data/tech';
import { useQuiz } from '@/contexts/QuizContext';
import { DifficultyFilter, TechId } from '@/types/quiz';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useQuizStore } from '@/store/quizStore';

export default function TestTanlash() {
  const router = useRouter();
  const { config, setConfig } = useQuiz();
  
  const [tech, setTech] = useState<TechId>(config.tech);
  const [subtopic, setSubtopic] = useState<string>(config.subtopic || 'Barchasi');
  const [difficulty, setDifficulty] = useState<DifficultyFilter>(config.difficulty);
  const [count, setCount] = useState<number>(config.count);

  const selectedTech = TECHS.find((t) => t.id === tech)!;

  const { data: subtopicsData } = useQuery({
    queryKey: ['subtopics', tech],
    queryFn: () => api.getSubtopics(selectedTech.label),
    enabled: !!tech,
  });

  // Real data fetch instead of static
  const { data: availableData, isLoading } = useQuery({
    queryKey: ['questionCount', tech, difficulty, subtopic],
    queryFn: () => api.getQuestionCount(selectedTech.label, difficulty === 'all' ? 'mixed' : difficulty, 'topic', subtopic)
  });
  
  const available = availableData || 0;

  const dynamicCounts = useMemo(() => {
    const fitting = QUESTION_COUNTS.filter((c) => c <= available);
    if (fitting.length === 0 && available > 0) return [available];
    return fitting;
  }, [available]);

  useEffect(() => {
    if (dynamicCounts.length > 0 && !dynamicCounts.includes(count)) {
      setCount(dynamicCounts[0]);
    }
  }, [dynamicCounts, count]);

  const notEnough = available === 0 || !dynamicCounts.includes(count);
  const estimatedMinutes = Math.round(count * 1.2);

  const [starting, setStarting] = useState(false);

  async function start() {
    setStarting(true);
    setConfig({ tech, difficulty, count, subtopic });
    
    try {
      const mode = 'topic';
      const diff = difficulty === 'all' ? 'mixed' : difficulty;
      const data = await api.startQuiz(selectedTech.label, diff, mode, count, subtopic);
      
      useQuizStore.getState().startQuiz(
        data.quizId, 
        data.questions, 
        count * 60 // 1 min per question
      );
      useQuizStore.getState().setQuizConfig({
        topic: tech,
        subtopic: subtopic === 'Barchasi' ? undefined : subtopic,
        difficulty: diff as any,
        mode,
        questionCount: count
      });
      
      router.push('/quiz-session');
    } catch (e) {
      console.error(e);
      alert('Testni boshlashda xatolik yuz berdi');
      setStarting(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        eyebrow="Yangi test"
        title="Test sozlamalari"
        description="Texnologiya, qiyinlik darajasi va savollar sonini tanlang — test shu asosda avtomatik tuziladi."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-line bg-surface p-6">
            <div className="mb-4 flex items-baseline justify-between gap-3">
              <h2 className="text-base font-semibold">Texnologiya</h2>
              <span className="text-xs text-ink-muted">Bittasini tanlang</span>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {TECHS.map((t) => {
                const active = t.id === tech;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setTech(t.id);
                      setSubtopic('Barchasi');
                    }}
                    aria-pressed={active}
                    className={[
                      'flex items-center gap-2.5 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors duration-150',
                      active ? 'border-neon bg-neon/10 text-ink' : 'border-line bg-elevated text-ink-dim hover:border-ink-muted hover:text-ink'
                    ].join(' ')}
                  >
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: t.color }} />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </section>

          {subtopicsData && subtopicsData.length > 0 && (
            <section className="rounded-2xl border border-line bg-surface p-6">
              <h2 className="mb-4 text-base font-semibold">Submavzu (Ixtiyoriy)</h2>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSubtopic('Barchasi')}
                  className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${subtopic === 'Barchasi' ? 'border-neon bg-neon/10 text-ink' : 'border-line bg-elevated text-ink-dim hover:text-ink'}`}
                >
                  Barchasi
                </button>
                {subtopicsData.map((st: string) => (
                  <button
                    key={st}
                    onClick={() => setSubtopic(st)}
                    className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${subtopic === st ? 'border-neon bg-neon/10 text-ink' : 'border-line bg-elevated text-ink-dim hover:text-ink'}`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </section>
          )}

          <section className="rounded-2xl border border-line bg-surface p-6">
            <h2 className="mb-4 text-base font-semibold">Qiyinlik darajasi</h2>
            <div className="inline-flex w-full flex-wrap rounded-xl border border-line bg-elevated p-1 sm:w-auto">
              {DIFFICULTIES.map((d) => {
                const active = d.id === difficulty;
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setDifficulty(d.id)}
                    aria-pressed={active}
                    className={[
                      'flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-5 py-2 text-sm font-medium transition-colors duration-150 sm:flex-none',
                      active ? 'bg-surface text-ink' : 'text-ink-dim hover:text-ink'
                    ].join(' ')}
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: active ? d.color : '#6E7681' }}
                    />
                    {d.label}
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-xs text-ink-muted">
              {difficulty === 'hard'
                ? 'Murakkab savollar: real loyihalardagi nozik holatlar va optimizatsiya.'
                : difficulty === 'easy'
                ? 'Asosiy tushunchalar — sintaksis va tayanch bilimlar.'
                : difficulty === 'medium'
                ? 'Amaliy darajadagi savollar: kod tahlili va tipik xatolar.'
                : 'Barcha darajadagi savollar aralash tarzda beriladi.'}
            </p>
          </section>

          <section className="rounded-2xl border border-line bg-surface p-6">
            <h2 className="mb-4 text-base font-semibold">Savollar soni</h2>
            {available === 0 ? (
              <p className="text-sm text-ink-dim py-4">Bu submavzuda hozircha savol yo'q</p>
            ) : (
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-5">
                {dynamicCounts.map((c) => {
                  const active = c === count;
                  // Wait for loading or check against available
                  const disabled = !isLoading && c > available;
                  return (
                    <button
                      key={c}
                      type="button"
                      disabled={disabled}
                      onClick={() => setCount(c)}
                      aria-pressed={active}
                      className={[
                        'rounded-xl border py-4 text-center transition-colors duration-150',
                        disabled
                          ? 'cursor-not-allowed border-line/60 bg-elevated/40 text-ink-muted/50'
                          : active
                          ? 'border-neon bg-neon/10 text-ink'
                          : 'border-line bg-elevated text-ink-dim hover:border-ink-muted hover:text-ink'
                      ].join(' ')}
                    >
                      <span className="block text-xl font-bold">{c}</span>
                      <span className="block text-[11px] text-ink-muted">savol</span>
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-line bg-surface p-6">
            <h2 className="text-base font-semibold">Test xulosasi</h2>

            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-ink-dim">Texnologiya</dt>
                <dd className="flex items-center gap-2 font-medium">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: selectedTech.color }} />
                  {selectedTech.label}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-ink-dim">Daraja</dt>
                <dd className="font-medium">{DIFFICULTIES.find((d) => d.id === difficulty)!.label}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-ink-dim">Savollar</dt>
                <dd className="font-medium">{count} ta</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-ink-dim">Taxminiy vaqt</dt>
                <dd className="flex items-center gap-1.5 font-medium">
                  <ClockIcon className="h-3.5 w-3.5 text-ink-muted" aria-hidden="true" />
                  {estimatedMinutes} daqiqa
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-ink-dim">Mumkin XP</dt>
                <dd className="flex items-center gap-1.5 font-medium text-neon">
                  <ZapIcon className="h-3.5 w-3.5" aria-hidden="true" />
                  {count * 50} XP
                </dd>
              </div>
            </dl>

            <p className="mt-5 rounded-xl border border-line bg-elevated px-4 py-3 text-sm">
              <span className="text-ink-dim">Mavjud savollar: </span>
              <span className="font-semibold text-neon">
                {isLoading ? '...' : available} ta
              </span>
            </p>

            <button
              type="button"
              onClick={start}
              disabled={notEnough || starting || isLoading}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-neon px-5 py-3 text-sm font-semibold text-bg transition-colors duration-150 hover:bg-neon-hover disabled:cursor-not-allowed disabled:bg-elevated disabled:text-ink-muted"
            >
              <PlayIcon className="h-4 w-4" aria-hidden="true" />
              {starting ? 'Boshlanmoqda...' : 'Testni boshlash'}
            </button>

            <p className="mt-3 flex items-start gap-2 text-xs text-ink-muted">
              <SparklesIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              Test davomida javobni o‘zgartirishingiz va savollar orasida erkin harakatlanishingiz mumkin.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
