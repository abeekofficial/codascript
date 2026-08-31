'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/services/api';
import { BellIcon, CheckIcon, CheckCircleIcon } from 'lucide-react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await api.getNotifications(1);
      setNotifications(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.markAllNotificationsAsRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await api.markNotificationAsRead(id);
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neon/15 text-neon">
            <BellIcon className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-ink">Bildirishnomalar</h1>
            <p className="text-sm text-ink-dim">Sizning hisobingizdagi so'nggi yangiliklar.</p>
          </div>
        </div>

        {notifications.some(n => !n.isRead) && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-2 rounded-xl border border-line bg-surface px-4 py-2 text-sm font-medium hover:border-neon hover:text-neon transition-colors"
          >
            <CheckCircleIcon className="h-4 w-4" />
            Barchasini o'qilgan deb belgilash
          </button>
        )}
      </div>

      <div className="rounded-2xl border border-line bg-surface overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-ink-dim">Yuklanmoqda...</div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center text-ink-dim">
            <BellIcon className="h-10 w-10 mx-auto mb-3 opacity-50" />
            Hech qanday bildirishnoma yo'q
          </div>
        ) : (
          <ul className="divide-y divide-line/60">
            {notifications.map(n => (
              <li
                key={n._id}
                className={`p-4 sm:p-5 flex gap-4 transition-colors ${!n.isRead ? 'bg-neon/5' : 'hover:bg-elevated'}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className={`text-base ${!n.isRead ? 'font-semibold text-ink' : 'font-medium text-ink-dim'}`}>
                      {n.title}
                    </h3>
                    <span className="text-xs text-ink-muted whitespace-nowrap">
                      {new Date(n.createdAt).toLocaleDateString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className={`text-sm ${!n.isRead ? 'text-ink-dim' : 'text-ink-muted'}`}>
                    {n.message}
                  </p>

                  {/* If it has a related item, maybe link to it */}
                  {n.relatedItemType && n.relatedItemId && (
                    <div className="mt-3">
                      <Link
                        href={n.relatedItemType === 'problem' ? `/problems/${n.relatedItemId}` : '/quizzes'}
                        className="text-xs font-medium text-neon hover:underline"
                        onClick={() => !n.isRead && markAsRead(n._id)}
                      >
                        O'tish &rarr;
                      </Link>
                    </div>
                  )}
                </div>

                {!n.isRead && (
                  <button
                    onClick={() => markAsRead(n._id)}
                    className="shrink-0 p-2 text-ink-muted hover:text-neon hover:bg-neon/10 rounded-lg self-start transition-colors"
                    title="O'qilgan deb belgilash"
                  >
                    <CheckIcon className="h-4 w-4" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
