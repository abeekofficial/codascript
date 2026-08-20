'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/services/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { User, Lock, Camera, Save, LogOut, CheckCircle2, Shield } from 'lucide-react';

export default function ProfilePage() {
  const { isAuthenticated, isHydrated, logout, user: authUser, setUser } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'general' | 'security'>('general');

  // Form states
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState('');
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Initial fetch and redirect protection
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: api.getProfile,
    enabled: isHydrated && isAuthenticated,
  });

  // Hydrate local state when profile is fetched
  if (profile && !name && !username && !avatar && name !== profile.name) {
    setName(profile.name || '');
    setUsername(profile.username || '');
    setAvatar(profile.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.email}`);
  }

  // Mutations
  const updateProfileMutation = useMutation({
    mutationFn: api.updateProfile,
    onSuccess: (data) => {
      setSuccessMessage('Profil muvaffaqiyatli yangilandi!');
      setErrorMessage('');
      queryClient.setQueryData(['profile'], data);
      setUser({ ...authUser!, name: data.name, username: data.username, avatar: data.avatar });
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: (error: Error) => {
      setErrorMessage(error.message);
      setSuccessMessage('');
    }
  });

  const changePasswordMutation = useMutation({
    mutationFn: api.changePassword,
    onSuccess: () => {
      setSuccessMessage('Parol muvaffaqiyatli o\'zgartirildi!');
      setErrorMessage('');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: (error: Error) => {
      setErrorMessage(error.message);
      setSuccessMessage('');
    }
  });

  if (!isHydrated || !isAuthenticated) {
    if (isHydrated && !isAuthenticated) router.push('/login');
    return null;
  }

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate({ name, username, avatar });
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setErrorMessage('Yangi parollar mos kelmadi');
      return;
    }
    changePasswordMutation.mutate({ currentPassword, newPassword });
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const generateRandomAvatar = () => {
    const randomSeed = Math.random().toString(36).substring(7);
    setAvatar(`https://api.dicebear.com/7.x/avataaars/svg?seed=${randomSeed}`);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-pulse text-primary font-medium">Yuklanmoqda...</div>
      </div>
    );
  }

  return (
    <div className="container py-10 px-4 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 space-y-2">
          <h2 className="text-2xl font-bold tracking-tight mb-6">Sozlamalar</h2>
          
          <button
            onClick={() => { setActiveTab('general'); setErrorMessage(''); setSuccessMessage(''); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'general' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'
            }`}
          >
            <User size={18} /> Umumiy profil
          </button>
          
          <button
            onClick={() => { setActiveTab('security'); setErrorMessage(''); setSuccessMessage(''); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'security' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'
            }`}
          >
            <Shield size={18} /> Xavfsizlik
          </button>
          
          <div className="pt-6 border-t mt-6">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors"
            >
              <LogOut size={18} /> Hisobdan chiqish
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 bg-green-500/10 border border-green-500/30 text-green-600 dark:text-green-400 rounded-lg flex items-center gap-2 text-sm font-medium"
              >
                <CheckCircle2 size={18} /> {successMessage}
              </motion.div>
            )}

            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium"
              >
                {errorMessage}
              </motion.div>
            )}
          </AnimatePresence>

          {activeTab === 'general' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="glass-card border-border/50">
                <CardHeader>
                  <CardTitle>Umumiy ma&apos;lumotlar</CardTitle>
                  <CardDescription>O&apos;zingiz haqingizdagi ma&apos;lumotlarni shu yerdan tahrirlang.</CardDescription>
                </CardHeader>
                <form onSubmit={handleUpdateProfile}>
                  <CardContent className="space-y-6">
                    {/* Avatar Section */}
                    <div className="flex items-center gap-6 pb-4 border-b">
                      <div className="relative group">
                        <img 
                          src={avatar} 
                          alt="Avatar" 
                          className="w-24 h-24 rounded-full border-4 border-background bg-muted object-cover shadow-sm"
                        />
                        <button
                          type="button"
                          onClick={generateRandomAvatar}
                          className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full shadow-md hover:scale-110 transition-transform"
                          title="Yangi avatar yaratish"
                        >
                          <Camera size={14} />
                        </button>
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-medium text-sm">Profil rasmi</h3>
                        <p className="text-xs text-muted-foreground">Rasm ustidagi tugmani bosib, tasodifiy avatarlarni tanlashingiz mumkin.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">To&apos;liq ismingiz</label>
                        <Input 
                          value={name} 
                          onChange={(e) => setName(e.target.value)} 
                          placeholder="Masalan: Ali Valiyev" 
                          required 
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Username</label>
                        <Input 
                          value={username} 
                          onChange={(e) => setUsername(e.target.value)} 
                          placeholder="@username" 
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Elektron pochta (o&apos;zgartirib bo&apos;lmaydi)</label>
                      <Input value={profile?.email} disabled className="bg-muted/50 text-muted-foreground" />
                    </div>
                  </CardContent>
                  <CardFooter className="bg-muted/30 pt-6">
                    <Button type="submit" disabled={updateProfileMutation.isPending}>
                      {updateProfileMutation.isPending ? 'Saqlanmoqda...' : (
                        <><Save size={16} className="mr-2" /> O&apos;zgarishlarni saqlash</>
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </motion.div>
          )}

          {activeTab === 'security' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="glass-card border-border/50">
                <CardHeader>
                  <CardTitle>Xavfsizlik</CardTitle>
                  <CardDescription>Hisobingiz parolini almashtiring.</CardDescription>
                </CardHeader>
                <form onSubmit={handleChangePassword}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Joriy parol</label>
                      <Input 
                        type="password" 
                        value={currentPassword} 
                        onChange={(e) => setCurrentPassword(e.target.value)} 
                        required 
                      />
                    </div>
                    
                    <div className="pt-2 border-t space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Yangi parol</label>
                        <Input 
                          type="password" 
                          value={newPassword} 
                          onChange={(e) => setNewPassword(e.target.value)} 
                          required 
                          minLength={6}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Yangi parolni tasdiqlang</label>
                        <Input 
                          type="password" 
                          value={confirmPassword} 
                          onChange={(e) => setConfirmPassword(e.target.value)} 
                          required 
                          minLength={6}
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-muted/30 pt-6">
                    <Button type="submit" variant="default" disabled={changePasswordMutation.isPending}>
                      {changePasswordMutation.isPending ? 'Yangilanmoqda...' : (
                        <><Lock size={16} className="mr-2" /> Parolni yangilash</>
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
