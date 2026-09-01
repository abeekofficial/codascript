'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { ErrorCard, LoaderCard } from '@/components/status/statusCard';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { motion } from 'framer-motion';

function ResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setStatus('error');
      setMessage('Yaroqsiz havola: Token topilmadi.');
      return;
    }
    if (password !== confirmPassword) {
      setStatus('error');
      setMessage('Parollar mos tushmadi.');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      await api.resetPassword(token, password);
      setStatus('success');
      setMessage('Parolingiz muvaffaqiyatli o\'zgartirildi.');
      setTimeout(() => router.push('/login'), 3000);
    } catch (err: unknown) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'Xatolik yuz berdi');
    }
  };

  return (
    <Card className="w-full max-w-md glass-card">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          Yangi parol o'rnatish
        </CardTitle>
        <CardDescription className="text-center">
          Iltimos, yangi parolingizni kiriting
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        {status === 'error' ? (
          <CardContent className="pt-6">
            <div className="mx-auto w-full max-w-sm">
              <ErrorCard
                illustrationSrc="/illustrations/error-spilled-coffee.png"
                title="Xatolik"
                subtitle={message}
                actionLabel="Qayta urinish"
                actionIcon="retry"
                onAction={() => setStatus('idle')}
              />
            </div>
          </CardContent>
        ) : (
          <>
            <CardContent className="space-y-4">
              {status === 'success' ? (
                <div className="p-3 bg-green-500/10 border border-green-500/50 text-green-500 text-sm font-medium rounded text-center">
                  {message} <br/> 3 soniyadan so'ng login sahifasiga yo'naltirilasiz...
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Yangi parol</label>
                    <Input 
                      type="password" 
                      required 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={status === 'loading'}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Parolni tasdiqlash</label>
                    <Input 
                      type="password" 
                      required 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={status === 'loading'}
                    />
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter>
              {status !== 'success' && (
                <Button 
                  type="submit" 
                  className="w-full bg-neon text-[#0B0F14] hover:bg-neon-hover font-bold h-11" 
                  disabled={status === 'loading' || !password || !confirmPassword}
                >
                  {status === 'loading' ? 'Saqlanmoqda...' : 'Saqlash'}
                </Button>
              )}
            </CardFooter>
          </>
        )}
      </form>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <Suspense fallback={
          <div className="flex h-full min-h-[50vh] items-center justify-center">
            <LoaderCard illustrationSrc="/illustrations/loader-coding-boy.png" title="Yuklanmoqda..." />
          </div>
        }>
          <ResetPasswordForm />
        </Suspense>
      </motion.div>
    </div>
  );
}
