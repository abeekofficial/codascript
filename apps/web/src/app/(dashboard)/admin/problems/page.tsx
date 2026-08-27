'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusIcon, SearchIcon, XIcon, UploadCloudIcon } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { api } from '@/services/api';
import { ClientProblem } from '@codascript/types';

interface DraftProblem {
  title: string;
  slug: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
  description: string;
  examples: { input: string; output: string }[];
  starterCode: string;
  testCases: { input: string; expectedOutput: string; isHidden: boolean }[];
}

const emptyDraft: DraftProblem = { 
  title: '',
  slug: '',
  difficulty: 'easy', 
  topic: 'javascript',
  description: '',
  examples: [{ input: '', output: '' }],
  starterCode: '',
  testCases: []
};

export default function AdminProblemsPage() {
  const [problems, setProblems] = useState<ClientProblem[]>([]);
  const [search, setSearch] = useState('');
  
  const [panelOpen, setPanelOpen] = useState<boolean>(false);
  const [jsonPanelOpen, setJsonPanelOpen] = useState<boolean>(false);
  const [draft, setDraft] = useState<DraftProblem>(emptyDraft);

  const [jsonInput, setJsonInput] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const ps = await api.getProblemsAdmin();
      setProblems(ps);
    } catch (err) {
      console.error('Failed to load problems data:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = useMemo(() => 
    problems.filter(
      (p) => p.title.toLowerCase().includes(search.trim().toLowerCase())
    ),
    [problems, search]
  );

  function openNew() {
    setEditingId(null);
    setDraft(emptyDraft);
    setPanelOpen(true);
  }

  function openEdit(p: ClientProblem) {
    setEditingId(p.id);
    setDraft({
      title: p.title,
      slug: p.slug,
      difficulty: p.difficulty as 'easy' | 'medium' | 'hard',
      topic: p.topic,
      description: p.description,
      examples: p.examples || [{ input: '', output: '' }],
      starterCode: p.starterCode?.javascript || '',
      testCases: (p.testCases || []).map(tc => ({
        input: tc.input,
        expectedOutput: tc.expectedOutput ?? '',
        isHidden: tc.isHidden
      }))
    });
    setPanelOpen(true);
  }

  async function handleDelete(id: string) {
    if (!confirm("Rostdan ham bu masalani o'chirmoqchimisiz?")) return;
    try {
      await api.deleteProblem(id);
      loadData();
    } catch (err: any) {
      alert(`Xatolik: ${err.message}`);
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.title.trim()) return;
    setIsLoading(true);
    try {
      const payload = {
        ...draft,
        starterCode: { javascript: draft.starterCode }
      };
      
      if (editingId) {
        await api.updateProblem(editingId, payload);
        setMessage('Masala muvaffaqiyatli yangilandi!');
      } else {
        await api.addProblem(payload);
        setMessage('Masala muvaffaqiyatli qo\'shildi!');
      }
      setPanelOpen(false);
      loadData();
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
      
      const payload = arr.map((p: any) => ({
        ...p,
        starterCode: p.starterCode?.javascript ? p.starterCode : { javascript: p.starterCode }
      }));
      
      await api.addProblemsBulk(payload);
      
      setMessage(`Muvaffaqiyatli ${arr.length} ta masala qo'shildi!`);
      setJsonInput('');
      setJsonPanelOpen(false);
      loadData();
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
        title="Amaliy masalalar bazasi"
        description={`Yangi masala qo‘shing yoki ro'yxatni ko'ring.`}
        actions={
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setJsonInput(''); setJsonPanelOpen(true); }}
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
              Yangi masala
            </button>
          </div>
        }
      />
      
      {message && (
        <div className="mb-4 p-4 rounded-xl border border-neon bg-neon/10 text-neon font-medium">
          {message}
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label className="relative flex min-w-[220px] flex-1 items-center">
          <SearchIcon className="pointer-events-none absolute left-3 h-4 w-4 text-ink-muted" aria-hidden="true" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type="search"
            placeholder="Sarlavha bo‘yicha qidirish..."
            className="h-10 w-full rounded-xl border border-line bg-surface pl-9 pr-3 text-sm text-ink placeholder:text-ink-muted focus:border-neon focus:outline-none"
          />
        </label>
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-surface">
        <div className="coda-scroll overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <caption className="sr-only">Masalalar jadvali</caption>
            <thead>
              <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-muted">
                <th scope="col" className="px-5 py-3 font-medium">Sarlavha</th>
                <th scope="col" className="px-3 py-3 font-medium">Topic</th>
                <th scope="col" className="px-3 py-3 font-medium">Qiyinlik</th>
                <th scope="col" className="px-3 py-3 font-medium text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.map((q: any) => (
                <tr key={q.id} className="transition-colors duration-150 hover:bg-elevated/50">
                  <td className="max-w-md px-5 py-3.5">
                    <p className="truncate font-medium">{q.title}</p>
                    <p className="mt-0.5 truncate text-xs text-ink-muted">{q.slug}</p>
                  </td>
                  <td className="px-3 py-3.5"><span className="text-xs font-medium">{q.topic}</span></td>
                  <td className="px-3 py-3.5">
                    <span className="text-xs font-medium uppercase">{q.difficulty}</span>
                  </td>
                  <td className="px-3 py-3.5 text-right">
                    <button
                      onClick={() => openEdit(q)}
                      className="mr-3 text-neon hover:underline text-sm font-medium"
                    >
                      Tahrirlash
                    </button>
                    <button
                      onClick={() => handleDelete(q.id)}
                      className="text-danger hover:underline text-sm font-medium"
                    >
                      O'chirish
                    </button>
                  </td>
                </tr>
              ))}
              {problems.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-5 py-14 text-center text-sm text-ink-dim">
                    Masalalar topilmadi. Yangi masala qo'shishingiz mumkin.
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
              onClick={() => setPanelOpen(false)}
              className="fixed inset-0 z-40 bg-black/60"
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="coda-scroll fixed right-0 top-0 z-50 flex h-full w-full max-w-lg flex-col overflow-y-auto border-l border-line bg-surface"
            >
              <div className="flex items-center justify-between border-b border-line px-6 py-4">
                <h2 className="text-base font-semibold">{editingId ? "Masalani tahrirlash" : "Yangi masala qo‘shish"}</h2>
                <button
                  type="button"
                  onClick={() => setPanelOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-elevated text-ink-dim hover:text-ink"
                >
                  <XIcon className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={save} className="flex flex-1 flex-col gap-5 p-6">
                
                <label className="block">
                  <span className="mb-2 block text-sm font-medium">Sarlavha</span>
                  <input
                    value={draft.title}
                    onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                    required
                    className="h-11 w-full rounded-xl border border-line bg-elevated px-3 text-sm text-ink focus:border-neon focus:outline-none"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium">Slug (URL uchun)</span>
                  <input
                    value={draft.slug}
                    onChange={(e) => setDraft({ ...draft, slug: e.target.value })}
                    required
                    placeholder="masalan: ikki-son-yigindisi"
                    className="h-11 w-full rounded-xl border border-line bg-elevated px-3 text-sm text-ink focus:border-neon focus:outline-none"
                  />
                </label>

                <div className="flex gap-4">
                  <label className="block flex-1">
                    <span className="mb-2 block text-sm font-medium">Texnologiya (Topic)</span>
                    <input
                      value={draft.topic}
                      onChange={(e) => setDraft({ ...draft, topic: e.target.value })}
                      required
                      className="h-11 w-full rounded-xl border border-line bg-elevated px-3 text-sm text-ink focus:border-neon focus:outline-none"
                    />
                  </label>

                  <label className="block flex-1">
                    <span className="mb-2 block text-sm font-medium">Qiyinlik</span>
                    <select
                      value={draft.difficulty}
                      onChange={(e) => setDraft({ ...draft, difficulty: e.target.value as any })}
                      className="h-11 w-full rounded-xl border border-line bg-elevated px-3 text-sm text-ink focus:border-neon focus:outline-none"
                    >
                      <option value="easy">Oson</option>
                      <option value="medium">O'rtacha</option>
                      <option value="hard">Qiyin</option>
                    </select>
                  </label>
                </div>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium">Matn (Description)</span>
                  <textarea
                    value={draft.description}
                    onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                    rows={4}
                    required
                    className="w-full rounded-xl border border-line bg-elevated p-3 text-sm text-ink focus:border-neon focus:outline-none"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium">Starter Code (JavaScript)</span>
                  <textarea
                    value={draft.starterCode}
                    onChange={(e) => setDraft({ ...draft, starterCode: e.target.value })}
                    rows={4}
                    className="w-full rounded-xl border border-line bg-elevated p-3 text-sm font-mono text-ink focus:border-neon focus:outline-none"
                  />
                </label>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="block text-sm font-medium">Misollar (Examples)</span>
                    <button
                      type="button"
                      onClick={() => setDraft({ ...draft, examples: [...draft.examples, { input: '', output: '' }] })}
                      className="text-xs font-semibold text-neon hover:underline"
                    >
                      + Misol qo&apos;shish
                    </button>
                  </div>
                  {draft.examples.map((ex, i) => (
                    <div key={i} className="flex flex-col gap-2 p-3 rounded-xl border border-line bg-elevated">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold text-ink-muted">Misol {i + 1}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const newExs = draft.examples.filter((_, idx) => idx !== i);
                            setDraft({ ...draft, examples: newExs });
                          }}
                          className="text-danger hover:underline text-xs"
                        >
                          O&apos;chirish
                        </button>
                      </div>
                      <input 
                        value={ex.input}
                        onChange={e => {
                          const newExs = [...draft.examples];
                          newExs[i].input = e.target.value;
                          setDraft({ ...draft, examples: newExs });
                        }}
                        required
                        className="h-9 w-full rounded-lg border border-line bg-surface px-3 text-xs font-mono focus:border-neon outline-none"
                        placeholder="Input"
                      />
                      <input 
                        value={ex.output}
                        onChange={e => {
                          const newExs = [...draft.examples];
                          newExs[i].output = e.target.value;
                          setDraft({ ...draft, examples: newExs });
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
                    <span className="block text-sm font-medium">Test Case'lar</span>
                    <button
                      type="button"
                      onClick={() => setDraft({ ...draft, testCases: [...draft.testCases, { input: '', expectedOutput: '', isHidden: false }] })}
                      className="text-xs font-semibold text-neon hover:underline"
                    >
                      + Test qo'shish
                    </button>
                  </div>
                  {draft.testCases.map((tc, i) => (
                    <div key={i} className="flex flex-col gap-2 p-3 rounded-xl border border-line bg-elevated">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold text-ink-muted">Test {i + 1}</span>
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
                              const newTcs = draft.testCases.filter((_, idx) => idx !== i);
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
                        required
                        className="h-9 w-full rounded-lg border border-line bg-surface px-3 text-xs font-mono focus:border-neon outline-none"
                        placeholder="Input"
                      />
                      <input 
                        value={tc.expectedOutput}
                        onChange={e => {
                          const newTcs = [...draft.testCases];
                          newTcs[i].expectedOutput = e.target.value;
                          setDraft({ ...draft, testCases: newTcs });
                        }}
                        required
                        className="h-9 w-full rounded-lg border border-line bg-surface px-3 text-xs font-mono focus:border-neon outline-none"
                        placeholder="Expected Output"
                      />
                    </div>
                  ))}
                </div>

                <div className="mt-auto flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setPanelOpen(false)}
                    className="flex-1 rounded-xl border border-line bg-elevated px-4 py-2.5 text-sm font-medium text-ink"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 rounded-xl bg-neon px-4 py-2.5 text-sm font-semibold text-bg disabled:opacity-50"
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
              onClick={() => setJsonPanelOpen(false)}
              className="fixed inset-0 z-40 bg-black/60"
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="coda-scroll fixed right-0 top-0 z-50 flex h-full w-full max-w-lg flex-col overflow-y-auto border-l border-line bg-surface"
            >
              <div className="flex items-center justify-between border-b border-line px-6 py-4">
                <h2 className="text-base font-semibold">JSON orqali ko'p masala qo'shish</h2>
                <button
                  type="button"
                  onClick={() => setJsonPanelOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-elevated text-ink-dim hover:text-ink"
                >
                  <XIcon className="h-4 w-4" />
                </button>
              </div>

              <div className="flex flex-1 flex-col gap-5 p-6">
                <p className="text-sm text-ink-dim">
                  Masalalar ro'yxatini JSON (array) shaklida kiriting.
                </p>
                <textarea
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  className="h-96 w-full rounded-xl border border-line bg-elevated p-4 font-mono text-xs text-ink focus:border-neon focus:outline-none"
                />

                <div className="mt-auto flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setJsonPanelOpen(false)}
                    className="flex-1 rounded-xl border border-line bg-elevated px-4 py-2.5 text-sm font-medium text-ink"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="button"
                    onClick={handleJsonSubmit}
                    disabled={isLoading}
                    className="flex-1 rounded-xl bg-neon px-4 py-2.5 text-sm font-semibold text-bg disabled:opacity-50"
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
