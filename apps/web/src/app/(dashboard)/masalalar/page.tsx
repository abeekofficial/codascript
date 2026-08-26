'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/ui/PageHeader';
import { DIFFICULTIES, TECHS } from '@/data/tech';
import { ClientProblem } from '@codascript/types';
import { api } from '@/services/api';

export default function ProblemsPage() {
  const [topic, setTopic] = useState('all');
  const [difficulty, setDifficulty] = useState('all');
  const [problems, setProblems] = useState<ClientProblem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getProblemsAdmin()
      .then(data => {
        if (data) {
          setProblems(data);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = problems.filter(p => 
    (topic === 'all' || p.topic === topic) && 
    (difficulty === 'all' || p.difficulty === difficulty)
  );

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        eyebrow="Amaliyot"
        title="Amaliy masalalar"
        description="Kod yozish ko'nikmalaringizni masalalar yechish orqali oshiring."
      />

      <div className="mb-6 flex flex-wrap gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-ink-dim">Texnologiya</label>
          <select 
            value={topic}
            onChange={e => setTopic(e.target.value)}
            className="rounded-xl border border-line bg-surface px-4 py-2 text-sm text-ink outline-none focus:border-neon"
          >
            <option value="all">Barchasi</option>
            {TECHS.map(t => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-ink-dim">Qiyinlik darajasi</label>
          <select 
            value={difficulty}
            onChange={e => setDifficulty(e.target.value)}
            className="rounded-xl border border-line bg-surface px-4 py-2 text-sm text-ink outline-none focus:border-neon"
          >
            {DIFFICULTIES.map(d => (
              <option key={d.id} value={d.id}>{d.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4">
        {loading ? (
           <div className="rounded-2xl border border-line bg-surface p-8 text-center text-ink-dim">
             Yuklanmoqda...
           </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-line bg-surface p-8 text-center text-ink-dim">
            Masalalar topilmadi. Boshqa filtrlarni sinab ko'ring.
          </div>
        ) : (
          filtered.map(p => {
            const diffColor = p.difficulty === 'easy' ? 'text-green-500' : p.difficulty === 'medium' ? 'text-yellow-500' : 'text-red-500';
            const diffLabel = p.difficulty === 'easy' ? 'Oson' : p.difficulty === 'medium' ? 'O\'rtacha' : 'Qiyin';
            const tech = TECHS.find(t => t.id === p.topic)?.label || p.topic;

            return (
              <Link 
                key={p.id} 
                href={`/masalalar/${p.slug}`}
                className="group flex items-center justify-between rounded-2xl border border-line bg-surface p-5 transition-colors hover:border-neon hover:bg-elevated"
              >
                <div>
                  <h3 className="text-lg font-semibold text-ink group-hover:text-neon">{p.title}</h3>
                  <div className="mt-2 flex items-center gap-4 text-sm text-ink-dim">
                    <span className={`font-medium ${diffColor}`}>{diffLabel}</span>
                    <span className="h-1 w-1 rounded-full bg-line" />
                    <span>{tech}</span>
                  </div>
                </div>
                <div className="hidden sm:block">
                  <span className="rounded-lg bg-neon/10 px-4 py-2 text-sm font-medium text-neon">
                    Yechish
                  </span>
                </div>
              </Link>
            )
          })
        )}
      </div>
    </div>
  );
}
