'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { UserIcon, ShieldIcon, BellIcon, MonitorIcon, Trash2Icon } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/services/api';
import { useRouter } from 'next/navigation';
import { ErrorCard } from '@/components/status/statusCard';

export default function SozlamalarPage() {
  const { user, login, logout } = useAuthStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'appearance' | 'account'>('profile');

  const [name, setName] = useState(user?.name || '');
  const [username, setUsername] = useState(user?.username || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [bio, setBio] = useState(user?.bio || '');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Bildirishnomalar (hozircha faqat UI)
  const [dailyReminder, setDailyReminder] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(false);

  if (!user) return null;

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updated = await api.updateProfile({ name, username, avatar, bio });
      login(
        { ...user, name: updated.name, username: updated.username, avatar: updated.avatar, bio: updated.bio },
        localStorage.getItem('token') || '',
        localStorage.getItem('refreshToken') || undefined
      );
      showMessage('success', 'Profil muvaffaqiyatli yangilandi');
    } catch (err: any) {
      showMessage('error', err.message || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return showMessage('error', 'Yangi parollar mos tushmadi');
    }
    setLoading(true);
    try {
      await api.changePassword(currentPassword, newPassword);
      showMessage('success', 'Parol muvaffaqiyatli o\'zgartirildi');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      showMessage('error', err.message || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      await api.deleteAccount();
      logout();
      router.push('/login');
    } catch (err: any) {
      showMessage('error', err.message || 'Hisobni o\'chirishda xatolik');
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const TABS = [
    { id: 'profile', label: 'Profil', icon: UserIcon },
    { id: 'security', label: 'Xavfsizlik', icon: ShieldIcon },
    { id: 'notifications', label: 'Bildirishnomalar', icon: BellIcon },
    { id: 'appearance', label: 'Ko\'rinish', icon: MonitorIcon },
    { id: 'account', label: 'Hisobni boshqarish', icon: Trash2Icon },
  ] as const;

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        eyebrow="Sozlamalar"
        title="Hisob sozlamalari"
        description="Profil va tizim sozlamalarini boshqaring."
      />

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="w-full lg:w-64 shrink-0">
          <nav className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            {TABS.map((tab) => {
              const active = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                    active ? 'bg-elevated text-neon' : 'text-ink-dim hover:bg-elevated hover:text-ink'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 min-w-0">
          {message.text && (
            message.type === 'error' ? (
              <div className="mb-6 max-w-sm mx-auto">
                <ErrorCard
                  illustrationSrc="/illustrations/error-spilled-coffee.png"
                  title="Xatolik"
                  subtitle={message.text}
                  onAction={() => setMessage({ type: '', text: '' })}
                />
              </div>
            ) : (
              <div className="mb-6 rounded-xl p-4 text-sm font-medium border bg-neon/10 border-neon/50 text-neon">
                {message.text}
              </div>
            )
          )}

          {activeTab === 'profile' && (
            <section className="rounded-2xl border border-line bg-surface p-6">
              <h2 className="text-xl font-bold mb-6">Profil ma'lumotlari</h2>
              <form onSubmit={handleProfileSave} className="space-y-5 max-w-xl">
                <div className="space-y-2">
                  <label className="text-sm font-medium">To'liq ism</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-line bg-elevated px-4 py-2.5 text-sm transition-colors focus:border-neon focus:outline-none"
                    placeholder="Masalan: Alisher Navoiy"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Foydalanuvchi nomi (Username)</label>
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full rounded-xl border border-line bg-elevated px-4 py-2.5 text-sm transition-colors focus:border-neon focus:outline-none"
                    placeholder="Masalan: alisher"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Avatar URL</label>
                  <input
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    className="w-full rounded-xl border border-line bg-elevated px-4 py-2.5 text-sm transition-colors focus:border-neon focus:outline-none"
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Bio (O'zingiz haqingizda)</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    maxLength={200}
                    rows={3}
                    className="w-full rounded-xl border border-line bg-elevated px-4 py-2.5 text-sm transition-colors focus:border-neon focus:outline-none resize-none"
                    placeholder="O'zingiz haqingizda qisqacha ma'lumot (max 200 belgi)"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-neon px-6 py-2.5 text-sm font-semibold text-bg transition-colors hover:bg-neon-hover disabled:opacity-50"
                >
                  {loading ? 'Saqlanmoqda...' : 'Saqlash'}
                </button>
              </form>
            </section>
          )}

          {activeTab === 'security' && (
            <section className="rounded-2xl border border-line bg-surface p-6">
              <h2 className="text-xl font-bold mb-6">Xavfsizlik</h2>
              
              <div className="mb-8 border-b border-line pb-8">
                <h3 className="text-base font-semibold mb-4">Parolni o'zgartirish</h3>
                <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Joriy parol</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      className="w-full rounded-xl border border-line bg-elevated px-4 py-2.5 text-sm transition-colors focus:border-neon focus:outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Yangi parol</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="w-full rounded-xl border border-line bg-elevated px-4 py-2.5 text-sm transition-colors focus:border-neon focus:outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Yangi parolni tasdiqlang</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="w-full rounded-xl border border-line bg-elevated px-4 py-2.5 text-sm transition-colors focus:border-neon focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="rounded-xl border border-line bg-elevated px-6 py-2.5 text-sm font-medium text-ink transition-colors hover:border-ink-muted disabled:opacity-50"
                  >
                    {loading ? 'O\'zgartirilmoqda...' : 'Parolni yangilash'}
                  </button>
                </form>
              </div>

              <div>
                <h3 className="text-base font-semibold mb-4">Ulangan hisoblar</h3>
                <div className="flex items-center justify-between rounded-xl border border-line bg-elevated p-4 max-w-md">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface">
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium">Google</p>
                      <p className="text-xs text-ink-dim">
                        {(user as any).oauthProvider === 'google' ? 'Ulangan' : 'Ulanmagan'}
                      </p>
                    </div>
                  </div>
                  {(user as any).oauthProvider === 'google' && (
                    <span className="text-xs font-semibold text-neon">Faol</span>
                  )}
                </div>
              </div>
            </section>
          )}

          {activeTab === 'notifications' && (
            <section className="rounded-2xl border border-line bg-surface p-6">
              <h2 className="text-xl font-bold mb-6">Bildirishnomalar</h2>
              <div className="space-y-4 max-w-md">
                <label className="flex items-center justify-between cursor-pointer rounded-xl border border-line bg-elevated p-4 transition-colors hover:border-ink-muted">
                  <div>
                    <p className="font-medium">Kunlik eslatma</p>
                    <p className="text-xs text-ink-dim mt-0.5">Har kuni test yechish haqida eslatma</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={dailyReminder}
                    onChange={(e) => setDailyReminder(e.target.checked)}
                    className="h-5 w-5 accent-neon"
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer rounded-xl border border-line bg-elevated p-4 transition-colors hover:border-ink-muted">
                  <div>
                    <p className="font-medium">Haftalik hisobot</p>
                    <p className="text-xs text-ink-dim mt-0.5">Haftalik o'zlashtirish va reyting</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={weeklyReport}
                    onChange={(e) => setWeeklyReport(e.target.checked)}
                    className="h-5 w-5 accent-neon"
                  />
                </label>
              </div>
            </section>
          )}

          {activeTab === 'appearance' && (
            <section className="rounded-2xl border border-line bg-surface p-6 text-center py-20">
              <MonitorIcon className="mx-auto h-12 w-12 text-ink-dim mb-4" />
              <h2 className="text-xl font-bold mb-2">Tez orada!</h2>
              <p className="text-ink-dim max-w-sm mx-auto">
                Light rejim va boshqa dizayn sozlamalari keyingi yangilanishlarda qo'shiladi. Hozircha tungi rejimdan rohatlaning!
              </p>
            </section>
          )}

          {activeTab === 'account' && (
            <section className="rounded-2xl border border-danger/30 bg-surface p-6">
              <h2 className="text-xl font-bold text-danger mb-4">Xavfli hudud</h2>
              <p className="text-sm text-ink-dim mb-6 max-w-xl">
                Hisobingizni o'chirish barcha ma'lumotlaringizni, jumladan test natijalari, reyting va to'plangan XP larni butunlay o'chirib yuboradi. Bu amalni ortga qaytarib bo'lmaydi.
              </p>
              
              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="rounded-xl bg-danger/10 px-6 py-2.5 text-sm font-semibold text-danger transition-colors hover:bg-danger/20"
                >
                  Hisobni o'chirish
                </button>
              ) : (
                <div className="rounded-xl border border-danger/30 bg-danger/5 p-5 max-w-md">
                  <p className="font-medium text-danger mb-4">Rostdan ham hisobingizni butunlay o'chirmoqchimisiz?</p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 rounded-xl border border-line bg-elevated px-4 py-2 text-sm font-medium transition-colors hover:bg-surface"
                    >
                      Bekor qilish
                    </button>
                    <button
                      onClick={handleDeleteAccount}
                      disabled={loading}
                      className="flex-1 rounded-xl bg-danger px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-600 disabled:opacity-50"
                    >
                      {loading ? 'O\'chirilmoqda...' : 'Ha, o\'chirilsin'}
                    </button>
                  </div>
                </div>
              )}
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
