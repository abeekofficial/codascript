'use client';

import { PageHeader } from '@/components/ui/PageHeader';
import { DIFFICULTIES, TECHS, TECH_MAP } from '@/data/tech';
import { api } from '@/services/api';
import { Difficulty, TechId } from '@/types/quiz';
import { ErrorCard } from '@/components/status/statusCard';
import { AnimatePresence, motion } from 'framer-motion';
import {
  PencilIcon,
  PlusIcon,
  SearchIcon,
  Trash2Icon,
  UploadCloudIcon,
  XIcon,
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';

const DIFFICULTY_COLOR: Record<Difficulty | string, string> = {
  easy: '#10B981',
  medium: '#FBBF24',
  hard: '#F87171',
  Beginner: '#10B981',
  Intermediate: '#FBBF24',
  Advanced: '#F87171',
};

interface Draft {
  topic: string;
  subtopic: string;
  difficulty: string;
  question: string;
  options: string[];
  correctOptionId: number;
  explanation: string;
  code: string;
  type: 'multiple_choice' | 'code';
  language: string;
  starterCode: string;
  testCases: { input: string; expectedOutput: string; isHidden: boolean }[];
}

const emptyDraft: Draft = {
  topic: 'JavaScript',
  subtopic: '',
  difficulty: 'easy',
  question: '',
  options: ['', '', '', ''],
  correctOptionId: 0,
  explanation: '',
  code: '',
  type: 'multiple_choice',
  language: 'javascript',
  starterCode: '',
  testCases: [],
};

export default function AdminPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [statsMap, setStatsMap] = useState<Record<string, any>>({});
  const [search, setSearch] = useState('');
  const [techFilter, setTechFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');

  const [panelOpen, setPanelOpen] = useState<boolean>(false);
  const [jsonPanelOpen, setJsonPanelOpen] = useState<boolean>(false);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [jsonInput, setJsonInput] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [qs, stats] = await Promise.all([
          api.getQuestions(),
          api.getQuestionStats(),
        ]);
        setQuestions(qs);

        const smap: Record<string, any> = {};
        stats.forEach((s: any) => {
          smap[s.questionId] = s;
        });
        setStatsMap(smap);
      } catch (err) {
        console.error('Failed to load admin data:', err);
      }
    };
    loadData();
  }, []);

  const filtered = useMemo(
    () =>
      questions.filter(
        q =>
          (techFilter === 'all' ||
            q.topic.toLowerCase() === techFilter.toLowerCase()) &&
          (difficultyFilter === 'all' || q.difficulty === difficultyFilter) &&
          q.question.toLowerCase().includes(search.trim().toLowerCase())
      ),
    [questions, techFilter, difficultyFilter, search]
  );

  function openNew() {
    setDraft(emptyDraft);
    setEditingId(null);
    setPanelOpen(true);
  }

  function openEdit(q: any) {
    setDraft({
      topic: q.topic || '',
      subtopic: q.subtopic || '',
      difficulty: q.difficulty || 'easy',
      question: q.question || '',
      options: q.options || ['', '', '', ''],
      correctOptionId: q.correctOptionId || 0,
      explanation: q.explanation || '',
      code: q.code || '',
      type: q.type || 'multiple_choice',
      language: q.language || 'javascript',
      starterCode: q.starterCode || '',
      testCases: q.testCases || [],
    });
    setEditingId(q._id);
    setPanelOpen(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.question.trim()) return;
    setIsLoading(true);
    try {
      const q = {
        ...draft,
        options: draft.options.filter(o => o.trim() !== ''),
      };

      if (editingId) {
        await api.updateQuestion(editingId, q);
        setMessage('Savol muvaffaqiyatli yangilandi!');
      } else {
        await api.addQuestion(q);
        setMessage("Savol muvaffaqiyatli qo'shildi!");
      }
      setPanelOpen(false);
    } catch (err: any) {
      setMessage(`Xatolik: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }

  const handleJsonSubmit = async () => {
    setIsLoading(true);
    try {
      const parsed = JSON.parse(jsonInput);
      let arr = Array.isArray(parsed) ? parsed : [parsed];

      // Auto-map aliases to correct schema fields
      arr = arr.map((q: any) => ({
        ...q,
        correctOptionId:
          q.correctOptionId !== undefined
            ? q.correctOptionId
            : q.correctOptionIndex,
      }));

      await api.bulkAddQuestions(arr);
      setMessage(`Muvaffaqiyatli ${arr.length} ta savol qo'shildi!`);
      setJsonInput('');
      setJsonPanelOpen(false);
    } catch (error: any) {
      setMessage(`Xatolik: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        eyebrow="Admin"
        title="Savollar bazasi"
        description={`Yangi savol qo‘shing yoki mavjudlarini tahrirlang.`}
        actions={
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setJsonInput('');
                setJsonPanelOpen(true);
              }}
              className="flex items-center gap-2 rounded-xl border border-line bg-surface px-4 py-2.5 text-sm font-semibold text-ink transition-colors duration-150 hover:bg-elevated"
            >
              <UploadCloudIcon className="h-4 w-4" aria-hidden="true" />
              JSON yuklash
            </button>
            <button
              type="button"
              onClick={openNew}
              className="flex items-center gap-2 rounded-xl bg-neon px-4 py-2.5 text-sm font-semibold text-bg transition-colors duration-150 hover:bg-neon-hover"
            >
              <PlusIcon className="h-4 w-4" aria-hidden="true" />
              Yangi savol
            </button>
          </div>
        }
      />

      {message && (
        message.startsWith('Xatolik') ? (
          <div className="mb-4 max-w-sm mx-auto">
            <ErrorCard illustrationSrc="/illustrations/error-spilled-coffee.png" title="Xatolik" subtitle={message} onAction={() => setMessage('')} />
          </div>
        ) : (
          <div className="mb-4 p-4 rounded-xl border border-neon bg-neon/10 text-neon font-medium">
            {message}
          </div>
        )
      )}

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label className="relative flex min-w-[220px] flex-1 items-center">
          <SearchIcon
            className="pointer-events-none absolute left-3 h-4 w-4 text-ink-muted"
            aria-hidden="true"
          />
          <span className="sr-only">Savollar ichidan qidirish</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            type="search"
            placeholder="Savol matni bo‘yicha qidirish..."
            className="h-10 w-full rounded-xl border border-line bg-surface pl-9 pr-3 text-sm text-ink placeholder:text-ink-muted transition-colors duration-150 focus:border-neon focus:outline-none"
          />
        </label>

        <select
          value={techFilter}
          onChange={e => setTechFilter(e.target.value)}
          aria-label="Texnologiya bo‘yicha filtr"
          className="h-10 rounded-xl border border-line bg-surface px-3 text-sm text-ink transition-colors duration-150 focus:border-neon focus:outline-none"
        >
          <option value="all">Barcha texnologiyalar</option>
          {TECHS.map(t => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>

        <div className="inline-flex rounded-xl border border-line bg-elevated p-1">
          {DIFFICULTIES.map(d => (
            <button
              key={d.id}
              type="button"
              onClick={() => setDifficultyFilter(d.id)}
              aria-pressed={difficultyFilter === d.id}
              className={[
                'rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors duration-150',
                difficultyFilter === d.id
                  ? 'bg-surface text-ink'
                  : 'text-ink-dim hover:text-ink',
              ].join(' ')}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-surface">
        <div className="coda-scroll overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <caption className="sr-only">Savollar jadvali</caption>
            <thead>
              <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-muted">
                <th scope="col" className="px-5 py-3 font-medium">
                  Savol
                </th>
                <th scope="col" className="px-3 py-3 font-medium">
                  Texnologiya
                </th>
                <th scope="col" className="px-3 py-3 font-medium">
                  Qiyinlik
                </th>
                <th scope="col" className="px-3 py-3 font-medium">
                  Statistika
                </th>
                <th scope="col" className="px-5 py-3 text-right font-medium">
                  Amallar
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.map((q: any) => {
                const tech = TECH_MAP[q.topic.toLowerCase() as TechId] || {
                  color: '#6E7681',
                  label: q.topic,
                };
                const stat = statsMap[q._id];
                const needsReview =
                  stat && stat.accuracy < 40 && stat.totalViews > 5;

                return (
                  <tr
                    key={q._id}
                    className={`transition-colors duration-150 hover:bg-elevated/50 ${needsReview ? 'bg-danger/5' : ''}`}
                  >
                    <td className="max-w-md px-5 py-3.5">
                      <div className="flex items-start gap-2">
                        {needsReview && (
                          <span
                            className="mt-0.5 text-danger"
                            title="Ko'p xato qilinayotgan savol"
                          >
                            ⚠️
                          </span>
                        )}
                        <div>
                          <p className="truncate font-medium">{q.question}</p>
                          <p className="mt-0.5 truncate text-xs text-ink-muted">
                            {q._id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3.5">
                      <span
                        className="inline-flex items-center gap-2 rounded-lg px-2.5 py-1 text-xs font-medium"
                        style={{
                          backgroundColor: `${tech.color}1A`,
                          color: tech.color,
                        }}
                      >
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: tech.color }}
                        />
                        {tech.label}
                      </span>
                    </td>
                    <td className="px-3 py-3.5">
                      <span
                        className="text-xs font-medium"
                        style={{
                          color: DIFFICULTY_COLOR[q.difficulty] || '#F0F6FC',
                        }}
                      >
                        {q.difficulty}
                      </span>
                    </td>
                    <td className="px-3 py-3.5">
                      {stat ? (
                        <div className="text-xs">
                          <p
                            className="font-semibold"
                            style={{
                              color:
                                stat.accuracy >= 70
                                  ? '#10B981'
                                  : stat.accuracy >= 40
                                    ? '#FBBF24'
                                    : '#F87171',
                            }}
                          >
                            {stat.accuracy}% to'g'ri
                          </p>
                          <p className="text-ink-muted">
                            {stat.totalViews} marta yechilgan
                          </p>
                        </div>
                      ) : (
                        <span className="text-xs text-ink-muted">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(q)}
                          aria-label={`${q.question} savolini tahrirlash`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-elevated text-ink-dim transition-colors duration-150 hover:border-neon/60 hover:text-neon"
                        >
                          <PencilIcon className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {questions.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-14 text-center text-sm text-ink-dim"
                  >
                    Bu yerda hozircha savollar ro'yxatini ko'rish API si
                    ulanmagan. Yangi savollar qo'shishingiz mumkin.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {/* MANUAL ADD PANEL */}
        {panelOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
              onClick={() => setPanelOpen(false)}
              className="fixed inset-0 z-40 bg-black/60"
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
              role="dialog"
              className="coda-scroll fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-line bg-surface"
            >
              <div className="flex items-center justify-between border-b border-line px-6 py-4">
                <h2 className="text-base font-semibold">
                  {editingId ? 'Savolni tahrirlash' : 'Yangi savol qo‘shish'}
                </h2>
                <button
                  type="button"
                  onClick={() => setPanelOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-elevated text-ink-dim transition-colors duration-150 hover:text-ink"
                >
                  <XIcon className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              <form onSubmit={save} className="flex flex-1 flex-col gap-5 p-6">
                <div className="flex gap-4">
                  <label className="block flex-1">
                    <span className="mb-2 block text-sm font-medium">
                      Texnologiya (Topic)
                    </span>
                    <input
                      value={draft.topic}
                      onChange={e =>
                        setDraft({ ...draft, topic: e.target.value })
                      }
                      required
                      className="h-11 w-full rounded-xl border border-line bg-elevated px-3 text-sm text-ink transition-colors duration-150 focus:border-neon focus:outline-none"
                    />
                  </label>

                  <label className="block flex-1">
                    <span className="mb-2 block text-sm font-medium">Submavzu (Ixtiyoriy)</span>
                    <input
                      value={draft.subtopic || ''}
                      onChange={e => setDraft({ ...draft, subtopic: e.target.value })}
                      placeholder="Masalan: Closures"
                      className="h-11 w-full rounded-xl border border-line bg-elevated px-3 text-sm text-ink transition-colors duration-150 focus:border-neon focus:outline-none"
                    />
                  </label>
                </div>

                <div>
                  <span className="mb-2 block text-sm font-medium">
                    Qiyinlik
                  </span>
                  <div className="inline-flex w-full rounded-xl border border-line bg-elevated p-1">
                    {['easy', 'medium', 'hard'].map(d => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDraft({ ...draft, difficulty: d })}
                        className={[
                          'flex-1 rounded-lg py-2 text-sm font-medium transition-colors duration-150 capitalize',
                          draft.difficulty === d
                            ? 'bg-surface text-ink'
                            : 'text-ink-dim hover:text-ink',
                        ].join(' ')}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4">
                  <label className="block flex-1">
                    <span className="mb-2 block text-sm font-medium">
                      Savol turi
                    </span>
                    <select
                      value={draft.type}
                      onChange={e =>
                        setDraft({
                          ...draft,
                          type: e.target.value as 'multiple_choice' | 'code',
                        })
                      }
                      className="h-11 w-full rounded-xl border border-line bg-elevated px-3 text-sm text-ink transition-colors duration-150 focus:border-neon focus:outline-none"
                    >
                      <option value="multiple_choice">
                        Test (Multiple Choice)
                      </option>
                      <option value="code">Kod yozish (Code)</option>
                    </select>
                  </label>

                  {draft.type === 'code' && (
                    <label className="block flex-1">
                      <span className="mb-2 block text-sm font-medium">
                        Dasturlash tili
                      </span>
                      <select
                        value={draft.language}
                        onChange={e =>
                          setDraft({ ...draft, language: e.target.value })
                        }
                        className="h-11 w-full rounded-xl border border-line bg-elevated px-3 text-sm text-ink transition-colors duration-150 focus:border-neon focus:outline-none"
                      >
                        <option value="javascript">JavaScript</option>
                        <option value="typescript">TypeScript</option>
                        <option value="html">HTML</option>
                        <option value="css">CSS</option>
                      </select>
                    </label>
                  )}
                </div>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium">
                    Savol matni
                  </span>
                  <textarea
                    value={draft.question}
                    onChange={e =>
                      setDraft({ ...draft, question: e.target.value })
                    }
                    rows={3}
                    required
                    className="w-full rounded-xl border border-line bg-elevated p-3 text-sm text-ink placeholder:text-ink-muted transition-colors duration-150 focus:border-neon focus:outline-none"
                  />
                </label>

                {draft.type === 'multiple_choice' ? (
                  <>
                    <label className="block">
                      <span className="mb-2 block text-sm font-medium">
                        Code Snippet (Ixtiyoriy)
                      </span>
                      <textarea
                        value={draft.code}
                        onChange={e =>
                          setDraft({ ...draft, code: e.target.value })
                        }
                        rows={3}
                        className="w-full rounded-xl border border-line bg-elevated p-3 text-sm font-mono text-ink placeholder:text-ink-muted transition-colors duration-150 focus:border-neon focus:outline-none"
                      />
                    </label>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="block text-sm font-medium">
                          Javob variantlari
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setDraft({
                              ...draft,
                              options: [...draft.options, ''],
                            })
                          }
                          className="text-xs font-semibold text-neon hover:underline"
                        >
                          + Variant qo'shish
                        </button>
                      </div>
                      {draft.options.map((opt, i) => (
                        <div key={i} className="flex gap-3 items-center">
                          <input
                            type="radio"
                            name="correctOption"
                            checked={draft.correctOptionId === i}
                            onChange={() =>
                              setDraft({ ...draft, correctOptionId: i })
                            }
                            className="h-4 w-4 accent-neon"
                          />
                          <input
                            value={opt}
                            onChange={e => {
                              const newOpts = [...draft.options];
                              newOpts[i] = e.target.value;
                              setDraft({ ...draft, options: newOpts });
                            }}
                            className="h-10 w-full rounded-xl border border-line bg-elevated px-3 text-sm text-ink transition-colors duration-150 focus:border-neon focus:outline-none"
                            placeholder={`Variant ${i + 1}`}
                          />
                          {draft.options.length > 2 && (
                            <button
                              type="button"
                              onClick={() => {
                                const newOpts = draft.options.filter(
                                  (_, idx) => idx !== i
                                );
                                let newCorrect = draft.correctOptionId;
                                if (draft.correctOptionId === i) newCorrect = 0;
                                else if (draft.correctOptionId > i)
                                  newCorrect -= 1;
                                setDraft({
                                  ...draft,
                                  options: newOpts,
                                  correctOptionId: newCorrect,
                                });
                              }}
                              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-line text-ink-muted hover:text-danger hover:border-danger transition-colors"
                              aria-label="Variantni o'chirish"
                            >
                              <Trash2Icon className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <label className="block">
                      <span className="mb-2 block text-sm font-medium">
                        Starter Code (Boshlang'ich kod)
                      </span>
                      <textarea
                        value={draft.starterCode}
                        onChange={e =>
                          setDraft({ ...draft, starterCode: e.target.value })
                        }
                        rows={4}
                        className="w-full rounded-xl border border-line bg-elevated p-3 text-sm font-mono text-ink placeholder:text-ink-muted transition-colors duration-150 focus:border-neon focus:outline-none"
                      />
                    </label>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="block text-sm font-medium">
                          Test Case'lar
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setDraft({
                              ...draft,
                              testCases: [
                                ...draft.testCases,
                                {
                                  input: '',
                                  expectedOutput: '',
                                  isHidden: false,
                                },
                              ],
                            })
                          }
                          className="text-xs font-semibold text-neon hover:underline"
                        >
                          + Test qo'shish
                        </button>
                      </div>
                      {draft.testCases.map((tc, i) => (
                        <div
                          key={i}
                          className="flex flex-col gap-2 p-3 rounded-xl border border-line bg-elevated"
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-semibold text-ink-muted">
                              Test {i + 1}
                            </span>
                            <div className="flex items-center gap-3">
                              <label className="flex items-center gap-1.5 text-xs">
                                <input
                                  type="checkbox"
                                  checked={tc.isHidden}
                                  onChange={e => {
                                    const newTcs = [...draft.testCases];
                                    newTcs[i].isHidden = e.target.checked;
                                    setDraft({ ...draft, testCases: newTcs });
                                  }}
                                  className="accent-neon"
                                />
                                Yashirin
                              </label>
                              <button
                                type="button"
                                onClick={() => {
                                  const newTcs = draft.testCases.filter(
                                    (_, idx) => idx !== i
                                  );
                                  setDraft({ ...draft, testCases: newTcs });
                                }}
                                className="text-danger hover:underline text-xs"
                              >
                                O'chirish
                              </button>
                            </div>
                          </div>
                          <input
                            value={tc.input}
                            onChange={e => {
                              const newTcs = [...draft.testCases];
                              newTcs[i].input = e.target.value;
                              setDraft({ ...draft, testCases: newTcs });
                            }}
                            className="h-9 w-full rounded-lg border border-line bg-surface px-3 text-xs font-mono transition-colors focus:border-neon outline-none"
                            placeholder="Input (masalan: sum(2, 3))"
                          />
                          <input
                            value={tc.expectedOutput}
                            onChange={e => {
                              const newTcs = [...draft.testCases];
                              newTcs[i].expectedOutput = e.target.value;
                              setDraft({ ...draft, testCases: newTcs });
                            }}
                            className="h-9 w-full rounded-lg border border-line bg-surface px-3 text-xs font-mono transition-colors focus:border-neon outline-none"
                            placeholder="Kutilgan natija (masalan: 5)"
                          />
                        </div>
                      ))}
                    </div>
                  </>
                )}

                <label className="block">
                  <span className="mb-2 block text-sm font-medium">
                    Tushuntirish (Ixtiyoriy)
                  </span>
                  <textarea
                    value={draft.explanation}
                    onChange={e =>
                      setDraft({ ...draft, explanation: e.target.value })
                    }
                    rows={3}
                    className="w-full rounded-xl border border-line bg-elevated p-3 text-sm text-ink placeholder:text-ink-muted transition-colors duration-150 focus:border-neon focus:outline-none"
                  />
                </label>

                <div className="mt-auto flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setPanelOpen(false)}
                    className="flex-1 rounded-xl border border-line bg-elevated px-4 py-2.5 text-sm font-medium text-ink transition-colors duration-150 hover:border-ink-muted"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 rounded-xl bg-neon px-4 py-2.5 text-sm font-semibold text-bg transition-colors duration-150 hover:bg-neon-hover disabled:opacity-50"
                  >
                    {isLoading ? 'Saqlanmoqda...' : 'Saqlash'}
                  </button>
                </div>
              </form>
            </motion.aside>
          </>
        )}

        {/* JSON UPLOAD PANEL */}
        {jsonPanelOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
              onClick={() => setJsonPanelOpen(false)}
              className="fixed inset-0 z-40 bg-black/60"
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
              role="dialog"
              className="coda-scroll fixed right-0 top-0 z-50 flex h-full w-full max-w-lg flex-col overflow-y-auto border-l border-line bg-surface"
            >
              <div className="flex items-center justify-between border-b border-line px-6 py-4">
                <h2 className="text-base font-semibold">
                  JSON orqali ko'p savol qo'shish
                </h2>
                <button
                  type="button"
                  onClick={() => setJsonPanelOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-elevated text-ink-dim transition-colors duration-150 hover:text-ink"
                >
                  <XIcon className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              <div className="flex flex-1 flex-col gap-5 p-6">
                <p className="text-sm text-ink-dim">
                  Quyidagi maydonga savollar ro'yxatini JSON (array) shaklida
                  kiriting.
                </p>
                <textarea
                  value={jsonInput}
                  onChange={e => setJsonInput(e.target.value)}
                  className="h-96 w-full rounded-xl border border-line bg-elevated p-4 font-mono text-xs text-ink transition-colors duration-150 focus:border-neon focus:outline-none"
                  placeholder={`[
  {
    "topic": "JavaScript",
    "subtopic": "Closures",
    "difficulty": "easy",
    "question": "Savol matni",
    "options": ["A", "B", "C", "D"],
    "correctOptionId": 0
  }
]`}
                />

                <div className="mt-auto flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setJsonPanelOpen(false)}
                    className="flex-1 rounded-xl border border-line bg-elevated px-4 py-2.5 text-sm font-medium text-ink transition-colors duration-150 hover:border-ink-muted"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="button"
                    onClick={handleJsonSubmit}
                    disabled={isLoading}
                    className="flex-1 rounded-xl bg-neon px-4 py-2.5 text-sm font-semibold text-bg transition-colors duration-150 hover:bg-neon-hover disabled:opacity-50"
                  >
                    {isLoading ? 'Yuklanmoqda...' : 'Yuklash'}
                  </button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
