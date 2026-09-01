'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/ui/PageHeader';
import { api } from '@/services/api';
import { LoaderCard } from '@/components/status/statusCard';
import { BookmarkIcon, XIcon, TerminalIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SavedPage() {
  const [activeTab, setActiveTab] = useState<'question' | 'problem'>('question');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems(activeTab);
  }, [activeTab]);

  const fetchItems = async (type: 'question' | 'problem') => {
    setLoading(true);
    try {
      const data = await api.getSavedItems(type);
      setItems(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async (itemType: string, itemId: string) => {
    try {
      await api.unsaveItem(itemType, itemId);
      setItems(items.filter((item) => (item.itemId._id || item.itemId.id) !== itemId));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neon/15 text-neon">
          <BookmarkIcon className="h-6 w-6" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Saqlanganlar</h1>
          <p className="text-sm text-ink-dim">Siz saqlab qo'ygan savol va masalalar to'plami.</p>
        </div>
      </div>

      <div className="flex border-b border-line mb-4">
        <button
          className={`pb-3 px-4 text-sm font-semibold transition-colors ${activeTab === 'question' ? 'text-neon border-b-2 border-neon' : 'text-ink-dim hover:text-ink'}`}
          onClick={() => setActiveTab('question')}
        >
          Testlar
        </button>
        <button
          className={`pb-3 px-4 text-sm font-semibold transition-colors ${activeTab === 'problem' ? 'text-neon border-b-2 border-neon' : 'text-ink-dim hover:text-ink'}`}
          onClick={() => setActiveTab('problem')}
        >
          Masalalar
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <LoaderCard illustrationSrc="/illustrations/loader-coding-boy.png" title="Saqlangan masalalar yuklanmoqda..." />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {items.map((item) => {
              const obj = item.itemId;
              if (!obj) return null; // Defensive
              const linkUrl = activeTab === 'problem' 
                ? `/problems/${obj.slug || obj._id}` 
                : `/quizzes`; // Since individual questions are inside quizzes, maybe just go to quizzes

              return (
                <motion.div
                  key={item._id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex flex-col justify-between rounded-2xl border border-line bg-surface p-5 transition-shadow hover:shadow-lg"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h2 className="font-semibold leading-tight line-clamp-2">
                        {obj.title || obj.question}
                      </h2>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleUnsave(item.itemType, obj._id || obj.id);
                        }}
                        className="p-1.5 text-ink-dim hover:text-danger hover:bg-elevated rounded-lg transition-colors shrink-0"
                        title="Olib tashlash"
                      >
                        <XIcon className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-3">
                      {obj.difficulty && (
                        <span className={"rounded-full px-2 py-0.5 text-[10px] sm:text-xs font-medium whitespace-nowrap " + (
                          obj.difficulty === 'easy' ? 'bg-green-500/10 text-green-500' :
                          obj.difficulty === 'medium' ? 'bg-yellow-500/10 text-yellow-500' :
                          'bg-red-500/10 text-red-500'
                        )}>
                          {obj.difficulty}
                        </span>
                      )}
                      <span className="text-xs text-ink-dim font-mono">{obj.topic}</span>
                    </div>
                  </div>

                  <Link
                    href={linkUrl}
                    className="mt-5 w-full flex items-center justify-center gap-2 rounded-xl bg-elevated py-2.5 text-sm font-medium text-ink transition-colors hover:text-neon hover:border-neon"
                  >
                    O'tish
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {items.length === 0 && (
            <div className="col-span-full py-12 text-center border border-dashed border-line rounded-2xl">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-elevated mb-3">
                <BookmarkIcon className="h-6 w-6 text-ink-dim" />
              </div>
              <p className="text-ink-dim">Hali hech narsa saqlanmagan.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
