'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CrownIcon, MedalIcon, TrendingUpIcon } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { api } from '@/services/api';
import { LeaderboardUser } from '@/types/quiz';

const MEDALS: Record<number, { color: string; label: string }> = {
  0: { color: '#FBBF24', label: '1-o‘rin' },
  1: { color: '#8B949E', label: '2-o‘rin' },
  2: { color: '#E44D26', label: '3-o‘rin' }
};

function Podium({ rows }: { rows: LeaderboardUser[] }) {
  const order = [1, 0, 2];
  const heights = ['h-24', 'h-32', 'h-20'];
  return (
    <div className="grid grid-cols-3 items-end gap-3">
      {order.map((rank, i) => {
        const row = rows[rank];
        if (!row) return null;
        const medal = MEDALS[rank];
        const initials = row.name ? row.name.charAt(0).toUpperCase() : 'U';
        return (
          <div key={row._id} className="flex flex-col items-center">
            <span
              className="flex h-14 w-14 items-center justify-center rounded-2xl text-base font-bold"
              style={{ backgroundColor: `${medal.color}22`, color: medal.color }}
            >
              {initials}
            </span>
            <p className="mt-2 max-w-full truncate text-sm font-semibold">{row.name}</p>
            <p className="text-xs text-ink-dim">{row.totalXP?.toLocaleString('ru-RU')} XP</p>
            <div
              className={`mt-3 flex ${heights[i]} w-full items-start justify-center rounded-t-xl border-x border-t pt-3`}
              style={{ borderColor: `${medal.color}55`, backgroundColor: `${medal.color}12` }}
            >
              <span className="text-lg font-extrabold" style={{ color: medal.color }}>
                {rank + 1}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function RecommendedUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getRecommendedUsers()
      .then(data => setUsers(data))
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const handleFollow = async (id: string, isFollowing: boolean) => {
    try {
      if (isFollowing) {
        await api.unfollowUser(id);
      } else {
        await api.followUser(id);
      }
      // Optimistic update
      setUsers(users.map(u => 
        u._id === id ? { ...u, isFollowing: !isFollowing } : u
      ));
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="text-sm text-ink-dim">Yuklanmoqda...</div>;
  if (!users.length) return <div className="text-sm text-ink-dim">Foydalanuvchilar topilmadi</div>;

  return (
    <div className="space-y-4">
      {users.map(user => (
        <div key={user._id} className="flex items-center justify-between gap-3">
          <Link href={`/users/${user.username || user._id}`} className="flex items-center gap-3 min-w-0 flex-1 hover:opacity-80 transition-opacity">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-elevated text-xs font-bold text-ink-dim">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{user.name}</p>
              <p className="truncate text-xs text-ink-dim">{(user.totalXP || 0).toLocaleString('ru-RU')} XP</p>
            </div>
          </Link>
          <button
            onClick={() => handleFollow(user._id, user.isFollowing)}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              user.isFollowing 
                ? 'bg-elevated text-ink hover:bg-line' 
                : 'bg-neon/10 text-neon hover:bg-neon/20'
            }`}
          >
            {user.isFollowing ? 'Unfollow' : 'Follow'}
          </button>
        </div>
      ))}
    </div>
  );
}

export default function Leaderboard() {
  const [rows, setRows] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getLeaderboard().then(data => {
      setRows(data);
      setLoading(false);
    }).catch(e => {
      console.error(e);
      setLoading(false);
    });
  }, []);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        eyebrow="Reyting"
        title="Leaderboard"
        description="Eng ko‘p XP to‘plagan foydalanuvchilar. Sizning o‘rningiz jadvalda ajratib ko‘rsatilgan."
      />

      {loading ? (
        <div className="py-8 text-center text-ink-muted">Yuklanmoqda...</div>
      ) : (
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="overflow-hidden rounded-2xl border border-line bg-surface">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Foydalanuvchilar reytingi</caption>
            <thead>
              <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-muted">
                <th scope="col" className="px-5 py-3 font-medium">#</th>
                <th scope="col" className="px-2 py-3 font-medium">Foydalanuvchi</th>
                <th scope="col" className="px-3 py-3 text-right font-medium">Level</th>
                <th scope="col" className="hidden px-3 py-3 text-right font-medium sm:table-cell">Testlar</th>
                <th scope="col" className="px-5 py-3 text-right font-medium">XP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((row, i) => {
                const medal = MEDALS[i];
                const isMe = false; // We can implement checking if row._id === myId if we want
                const initials = row.name ? row.name.charAt(0).toUpperCase() : 'U';
                return (
                  <tr
                    key={row._id}
                    className={[
                      'transition-colors duration-150 hover:bg-elevated/60',
                      isMe ? 'bg-neon/5' : ''
                    ].join(' ')}
                  >
                    <td className="px-5 py-3.5">
                      {medal ? (
                        <span className="flex items-center gap-1.5 font-bold" style={{ color: medal.color }}>
                          {i === 0 ? (
                            <CrownIcon className="h-4 w-4" aria-hidden="true" />
                          ) : (
                            <MedalIcon className="h-4 w-4" aria-hidden="true" />
                          )}
                          {i + 1}
                        </span>
                      ) : (
                        <span className="text-ink-muted">{i + 1}</span>
                      )}
                    </td>
                    <td className="px-2 py-3.5">
                      <Link href={`/users/${(row as any).username || row._id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                        <span
                          className={[
                            'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold',
                            isMe ? 'bg-neon text-bg' : 'bg-elevated text-ink-dim'
                          ].join(' ')}
                        >
                          {initials}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate font-medium">
                            {row.name}
                            {isMe && <span className="ml-2 text-xs font-semibold text-neon">Siz</span>}
                          </span>
                          <span className="block text-xs text-ink-muted sm:hidden">{row.completedQuizzes} test</span>
                        </span>
                      </Link>
                    </td>
                    <td className="px-3 py-3.5 text-right">
                      <span className="rounded-lg bg-elevated px-2 py-1 text-xs font-semibold text-ink-dim">
                        {Math.floor((row.totalXP || 0) / 1000) + 1}
                      </span>
                    </td>
                    <td className="hidden px-3 py-3.5 text-right tabular-nums text-ink-dim sm:table-cell">
                      {row.completedQuizzes}
                    </td>
                    <td className="px-5 py-3.5 text-right font-semibold tabular-nums">
                      {row.totalXP?.toLocaleString('ru-RU')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-line bg-surface p-5">
            <h2 className="mb-5 text-sm font-semibold">Top 3</h2>
            <Podium rows={rows} />
          </div>

          <div className="rounded-2xl border border-line bg-surface p-5">
            <h2 className="mb-5 text-sm font-semibold">Tavsiya etilganlar</h2>
            <RecommendedUsers />
          </div>

          <div className="rounded-2xl border border-line bg-surface p-5">
            <h2 className="text-sm font-semibold">Sizning o‘rningiz</h2>
            <p className="mt-3 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-neon">
                #
              </span>
            </p>
            <p className="mt-3 flex items-center gap-2 text-xs text-ink-dim">
              Davom eting va ko'proq XP to'plang!
            </p>
          </div>
        </aside>
      </div>
      )}
    </div>
  );
}
