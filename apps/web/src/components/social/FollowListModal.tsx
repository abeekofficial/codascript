'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { XIcon } from 'lucide-react';

interface FollowUser {
  _id: string;
  name: string;
  username: string;
  avatar?: string;
  level: number;
}

interface FollowListModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  users: FollowUser[];
  loading: boolean;
}

export function FollowListModal({ isOpen, onClose, title, users, loading }: FollowListModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-bg/80 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-sm rounded-2xl border border-line bg-surface shadow-2xl flex flex-col max-h-[80vh]"
        >
          <div className="flex items-center justify-between border-b border-line p-4">
            <h2 className="text-lg font-bold">{title}</h2>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-ink-dim hover:bg-elevated hover:text-ink transition-colors"
            >
              <XIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="overflow-y-auto p-2 coda-scroll flex-1">
            {loading ? (
              <div className="p-8 text-center text-ink-dim">Yuklanmoqda...</div>
            ) : users.length === 0 ? (
              <div className="p-8 text-center text-ink-dim">Hech kim topilmadi</div>
            ) : (
              <ul className="flex flex-col gap-1">
                {users.map((u) => (
                  <li key={u._id}>
                    <Link
                      href={`/users/${u.username}`}
                      onClick={onClose}
                      className="flex items-center gap-3 rounded-xl p-3 hover:bg-elevated transition-colors"
                    >
                      {u.avatar ? (
                        <img src={u.avatar} alt={u.name} className="h-10 w-10 rounded-full object-cover" />
                      ) : (
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neon/15 text-neon font-bold">
                          {u.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                      <div>
                        <p className="font-semibold text-sm leading-tight text-ink">{u.name}</p>
                        <p className="text-xs text-ink-dim mt-0.5">@{u.username} • Level {u.level}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
