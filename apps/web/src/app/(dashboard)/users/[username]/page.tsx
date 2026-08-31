'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/services/api';
import { User } from '@codascript/types';
import { PageHeader } from '@/components/ui/PageHeader';
import { TrophyIcon, FlameIcon, StarIcon, CheckCircleIcon, CalendarIcon } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

import { FollowListModal } from '@/components/social/FollowListModal';

export default function PublicProfilePage() {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<(User & { followersCount?: number, followingCount?: number, isFollowedByMe?: boolean }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'followers' | 'following'>('followers');
  const [modalUsers, setModalUsers] = useState<any[]>([]);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    if (username) {
      api.getPublicProfile(username)
        .then(setProfile)
        .catch(err => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [username]);

  const openModal = async (type: 'followers' | 'following') => {
    setModalType(type);
    setModalOpen(true);
    setModalLoading(true);
    try {
      const users = type === 'followers' ? await api.getFollowers(username as string) : await api.getFollowing(username as string);
      setModalUsers(users);
    } catch (e) {
      console.error(e);
    } finally {
      setModalLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center p-8">Yuklanmoqda...</div>;
  }

  if (error || !profile) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl font-bold text-danger mb-2">Xatolik</h2>
        <p className="text-ink-dim">{error || 'Foydalanuvchi topilmadi'}</p>
      </div>
    );
  }

  const joinDate = profile.createdAt 
    ? new Date(profile.createdAt).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Yaqinda';

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Profile Header */}
      <div className="rounded-2xl border border-line bg-surface p-8">
        <div className="flex flex-col items-center sm:flex-row gap-6">
          <div className="relative">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-elevated border-2 border-neon text-3xl font-bold text-neon overflow-hidden">
              {profile.avatar ? (
                <img src={profile.avatar} alt={profile.name} className="h-full w-full object-cover" />
              ) : (
                profile.name.charAt(0).toUpperCase()
              )}
            </div>
            {profile.role === 'admin' && (
              <span className="absolute -bottom-2 -right-2 rounded-lg bg-danger px-2 py-0.5 text-xs font-bold text-white">
                ADMIN
              </span>
            )}
          </div>
          <div className="flex-1 text-center sm:text-left flex flex-col justify-between">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold mb-1">{profile.name}</h1>
                  <p className="text-ink-dim font-mono mb-4">@{profile.username || username}</p>
                </div>
                {/* Follow Button */}
                {profile.isFollowedByMe !== undefined && useAuthStore.getState().user?._id !== profile._id && (
                  <button
                    onClick={async () => {
                      try {
                        if (profile.isFollowedByMe) {
                          await api.unfollowUser(profile._id);
                          setProfile({ ...profile, isFollowedByMe: false, followersCount: (profile.followersCount || 1) - 1 });
                        } else {
                          await api.followUser(profile._id);
                          setProfile({ ...profile, isFollowedByMe: true, followersCount: (profile.followersCount || 0) + 1 });
                        }
                      } catch (e) {
                        console.error(e);
                      }
                    }}
                    className={`px-6 py-2 rounded-xl text-sm font-semibold transition-colors ${
                      profile.isFollowedByMe
                        ? 'border border-line bg-elevated text-ink hover:border-danger hover:text-danger'
                        : 'bg-neon text-bg hover:bg-neon-hover'
                    }`}
                  >
                    {profile.isFollowedByMe ? 'Kuzatishni bekor qilish' : 'Kuzatish'}
                  </button>
                )}
              </div>

              {profile.bio && (
                <p className="text-ink text-sm max-w-lg mb-4">{profile.bio}</p>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-2">
              <button onClick={() => openModal('followers')} className="flex items-center gap-1.5 text-sm hover:opacity-80 transition-opacity">
                <span className="font-bold text-ink">{profile.followersCount || 0}</span>
                <span className="text-ink-dim">Kuzatuvchilar</span>
              </button>
              <button onClick={() => openModal('following')} className="flex items-center gap-1.5 text-sm hover:opacity-80 transition-opacity">
                <span className="font-bold text-ink">{profile.followingCount || 0}</span>
                <span className="text-ink-dim">Kuzatilayotganlar</span>
              </button>
              <div className="w-px h-4 bg-line mx-2 hidden sm:block" />
              <div className="flex items-center gap-2 text-xs text-ink-dim">
                <CalendarIcon className="h-4 w-4" />
                <span>Qo'shilgan sana: {joinDate}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-line bg-surface p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <TrophyIcon className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium text-ink-dim">Daraja</p>
          </div>
          <p className="text-2xl font-bold">{profile.level || 1}-daraja</p>
        </div>
        <div className="rounded-xl border border-line bg-surface p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neon/10 text-neon">
              <StarIcon className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium text-ink-dim">Umumiy XP</p>
          </div>
          <p className="text-2xl font-bold">{profile.totalXP || 0}</p>
        </div>
        <div className="rounded-xl border border-line bg-surface p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10 text-warning">
              <FlameIcon className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium text-ink-dim">Streak</p>
          </div>
          <p className="text-2xl font-bold">{profile.currentStreak || 0} kun</p>
        </div>
        <div className="rounded-xl border border-line bg-surface p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10 text-success">
              <CheckCircleIcon className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium text-ink-dim">Yakunlangan</p>
          </div>
          <p className="text-2xl font-bold">{profile.completedQuizzes || 0} ta test</p>
        </div>
      </div>
      
      <FollowListModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalType === 'followers' ? 'Kuzatuvchilar' : 'Kuzatilayotganlar'}
        users={modalUsers}
        loading={modalLoading}
      />
    </div>
  );
}
