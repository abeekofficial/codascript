'use client';
import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { api } from '@/services/api';
import { ThumbsUpIcon, ThumbsDownIcon, PlusIcon, XIcon } from 'lucide-react';
import Link from 'next/link';
import { TECHS, DIFFICULTIES } from '@/data/tech';

export default function JamiyatPage() {
  const [problems, setProblems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [topic, setTopic] = useState('javascript');
  const [difficulty, setDifficulty] = useState('easy');
  const [starterCode, setStarterCode] = useState('');
  const [examples, setExamples] = useState<{ input: string; output: string }[]>([{ input: '', output: '' }]);
  const [testCases, setTestCases] = useState<{ input: string; expectedOutput: string; isHidden: boolean }[]>([]);

  useEffect(() => {
    fetchPendingProblems();
  }, []);

  const fetchPendingProblems = () => {
    setLoading(true);
    api.getPendingProblems()
      .then(data => setProblems(data))
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  };

  const handleVote = async (id: string, voteType: 'up' | 'down') => {
    try {
      const res = await api.voteProblem(id, voteType);
      setProblems(problems.map(p => 
        p._id === id || p.id === id ? {
          ...p,
          upvotes: res.upvotes,
          downvotes: res.downvotes
        } : p
      ));
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmitProblem = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const newProblem = await api.submitCommunityProblem({
        title,
        slug,
        description,
        topic,
        difficulty,
        examples,
        testCases,
        starterCode: { javascript: starterCode }
      });
      setProblems([newProblem, ...problems]);
      setIsFormOpen(false);
      setTitle('');
      setSlug('');
      setDescription('');
      setStarterCode('');
      setExamples([{ input: '', output: '' }]);
      setTestCases([]);
    } catch (e) {
      console.error(e);
      alert('Xatolik yuz berdi');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex items-start justify-between">
        <PageHeader
          eyebrow="Jamiyat"
          title="Foydalanuvchilar masalalari"
          description="Boshqalar tomonidan taklif etilgan masalalarga ovoz bering yoki o'zingiznikini qo'shing."
        />
        {!isFormOpen && (
          <button 
            onClick={() => setIsFormOpen(true)}
            className="mt-6 flex items-center gap-2 rounded-xl bg-neon px-4 py-2.5 text-sm font-medium text-bg hover:bg-neon-hover transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            Yangi masala
          </button>
        )}
      </div>

      {isFormOpen && (
        <div className="mb-8 rounded-2xl border border-line bg-surface p-6 relative">
          <button 
            onClick={() => setIsFormOpen(false)}
            className="absolute right-4 top-4 text-ink-dim hover:text-ink"
          >
            <XIcon className="h-5 w-5" />
          </button>
          <h2 className="mb-6 text-lg font-semibold">Yangi masala taklif qilish</h2>
          <form onSubmit={handleSubmitProblem} className="space-y-4 max-w-2xl">
            <div>
              <label className="mb-1 block text-sm font-medium text-ink-dim">Sarlavha</label>
              <input
                required
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full rounded-xl border border-line bg-bg px-4 py-2.5 text-sm text-ink outline-none focus:border-neon"
                placeholder="Masala sarlavhasi"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-ink-dim">Slug (URL uchun)</label>
              <input
                required
                type="text"
                value={slug}
                onChange={e => setSlug(e.target.value)}
                className="w-full rounded-xl border border-line bg-bg px-4 py-2.5 text-sm text-ink outline-none focus:border-neon"
                placeholder="masalan: ikki-son-yigindisi"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-ink-dim">Texnologiya</label>
                <select
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  className="w-full rounded-xl border border-line bg-bg px-4 py-2.5 text-sm text-ink outline-none focus:border-neon"
                >
                  {TECHS.map(t => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-ink-dim">Qiyinlik darajasi</label>
                <select
                  value={difficulty}
                  onChange={e => setDifficulty(e.target.value)}
                  className="w-full rounded-xl border border-line bg-bg px-4 py-2.5 text-sm text-ink outline-none focus:border-neon"
                >
                  {DIFFICULTIES.slice(1).map(d => (
                    <option key={d.id} value={d.id}>{d.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-ink-dim">Tavsif</label>
              <textarea
                required
                rows={5}
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full rounded-xl border border-line bg-bg px-4 py-2.5 text-sm text-ink outline-none focus:border-neon"
                placeholder="Masala sharti va misollar..."
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-ink-dim">Starter Code (JavaScript)</label>
              <textarea
                value={starterCode}
                onChange={e => setStarterCode(e.target.value)}
                rows={4}
                className="w-full rounded-xl border border-line bg-bg p-3 text-sm font-mono text-ink outline-none focus:border-neon"
                placeholder="function solve() { ... }"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="block text-sm font-medium text-ink-dim">Misollar (Examples)</span>
                <button
                  type="button"
                  onClick={() => setExamples([...examples, { input: '', output: '' }])}
                  className="text-xs font-semibold text-neon hover:underline"
                >
                  + Misol qo'shish
                </button>
              </div>
              {examples.map((ex, i) => (
                <div key={i} className="flex flex-col gap-2 p-3 rounded-xl border border-line bg-bg">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-ink-muted">Misol {i + 1}</span>
                    <button
                      type="button"
                      onClick={() => setExamples(examples.filter((_, idx) => idx !== i))}
                      className="text-danger hover:underline text-xs"
                    >
                      O'chirish
                    </button>
                  </div>
                  <input 
                    value={ex.input}
                    onChange={e => {
                      const newExs = [...examples];
                      newExs[i].input = e.target.value;
                      setExamples(newExs);
                    }}
                    required
                    className="h-9 w-full rounded-lg border border-line bg-surface px-3 text-xs font-mono focus:border-neon outline-none"
                    placeholder="Input"
                  />
                  <input 
                    value={ex.output}
                    onChange={e => {
                      const newExs = [...examples];
                      newExs[i].output = e.target.value;
                      setExamples(newExs);
                    }}
                    required
                    className="h-9 w-full rounded-lg border border-line bg-surface px-3 text-xs font-mono focus:border-neon outline-none"
                    placeholder="Output"
                  />
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="block text-sm font-medium text-ink-dim">Test Case'lar</span>
                <button
                  type="button"
                  onClick={() => setTestCases([...testCases, { input: '', expectedOutput: '', isHidden: false }])}
                  className="text-xs font-semibold text-neon hover:underline"
                >
                  + Test qo'shish
                </button>
              </div>
              {testCases.map((tc, i) => (
                <div key={i} className="flex flex-col gap-2 p-3 rounded-xl border border-line bg-bg">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-ink-muted">Test {i + 1}</span>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 text-xs text-ink-dim">
                        <input 
                          type="checkbox" 
                          checked={tc.isHidden}
                          onChange={e => {
                            const newTcs = [...testCases];
                            newTcs[i].isHidden = e.target.checked;
                            setTestCases(newTcs);
                          }}
                          className="accent-neon"
                        />
                        Yashirin
                      </label>
                      <button
                        type="button"
                        onClick={() => setTestCases(testCases.filter((_, idx) => idx !== i))}
                        className="text-danger hover:underline text-xs"
                      >
                        O'chirish
                      </button>
                    </div>
                  </div>
                  <input 
                    value={tc.input}
                    onChange={e => {
                      const newTcs = [...testCases];
                      newTcs[i].input = e.target.value;
                      setTestCases(newTcs);
                    }}
                    required
                    className="h-9 w-full rounded-lg border border-line bg-surface px-3 text-xs font-mono focus:border-neon outline-none"
                    placeholder="Input"
                  />
                  <input 
                    value={tc.expectedOutput}
                    onChange={e => {
                      const newTcs = [...testCases];
                      newTcs[i].expectedOutput = e.target.value;
                      setTestCases(newTcs);
                    }}
                    required
                    className="h-9 w-full rounded-lg border border-line bg-surface px-3 text-xs font-mono focus:border-neon outline-none"
                    placeholder="Expected Output"
                  />
                </div>
              ))}
            </div>
            
            <div className="pt-2">
              <button 
                type="submit" 
                disabled={submitting}
                className="rounded-xl bg-neon px-6 py-2.5 text-sm font-medium text-bg hover:bg-neon-hover transition-colors disabled:opacity-50"
              >
                {submitting ? 'Yuborilmoqda...' : 'Yuborish'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-4">
        {loading ? (
          <div className="rounded-2xl border border-line bg-surface p-8 text-center text-ink-dim">
            Yuklanmoqda...
          </div>
        ) : problems.length === 0 ? (
          <div className="rounded-2xl border border-line bg-surface p-8 text-center text-ink-dim">
            Hozircha jamiyat masalalari yo'q. Birinchi bo'lib taklif eting!
          </div>
        ) : (
          problems.map(p => {
            const diffColor = p.difficulty === 'easy' ? 'text-green-500' : p.difficulty === 'medium' ? 'text-yellow-500' : 'text-red-500';
            const tech = TECHS.find(t => t.id === p.topic)?.label || p.topic;

            return (
              <div key={p._id || p.id} className="flex gap-4 rounded-2xl border border-line bg-surface p-5">
                <div className="flex flex-col items-center gap-2 border-r border-line pr-4">
                  <button 
                    onClick={() => handleVote(p._id || p.id, 'up')}
                    className="p-1.5 text-ink-dim hover:text-green-500 hover:bg-elevated rounded-lg transition-colors"
                  >
                    <ThumbsUpIcon className="h-5 w-5" />
                  </button>
                  <span className="font-semibold text-sm">{(p.upvotes?.length || 0) - (p.downvotes?.length || 0)}</span>
                  <button 
                    onClick={() => handleVote(p._id || p.id, 'down')}
                    className="p-1.5 text-ink-dim hover:text-red-500 hover:bg-elevated rounded-lg transition-colors"
                  >
                    <ThumbsDownIcon className="h-5 w-5" />
                  </button>
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-ink">{p.title}</h3>
                      <div className="mt-1 flex items-center gap-3 text-xs text-ink-dim">
                        {p.author && (
                          <span className="font-medium">
                            @{typeof p.author === 'object' ? (p.author.username || p.author.name || 'User') : p.author}
                          </span>
                        )}
                        {p.genericId && (
                          <span className="font-mono bg-elevated px-1.5 rounded">{p.genericId}</span>
                        )}
                        <span className={`font-medium ${diffColor}`}>{p.difficulty}</span>
                        <span className="h-1 w-1 rounded-full bg-line" />
                        <span>{tech}</span>
                        {p.status === 'pending' && (
                          <span className="rounded bg-yellow-500/10 px-1.5 py-0.5 text-yellow-500">Kutilmoqda</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-ink-muted line-clamp-2">
                    {p.description}
                  </p>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  );
}
