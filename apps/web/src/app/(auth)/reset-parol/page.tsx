'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
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
        <CardContent className="space-y-4">
          {status === 'success' ? (
            <div className="p-3 bg-green-500/10 border border-green-500/50 text-green-500 text-sm font-medium rounded text-center">
              {message} <br/> 3 soniyadan so'ng login sahifasiga yo'naltirilasiz...
            </div>
          ) : (
            <>
              {status === 'error' && (
                <div className="p-3 bg-red-500/10 border border-red-500/50 text-red-500 text-sm font-mono rounded">
                  {message}
                </div>
              )}
              {!token && status !== 'error' && (
                <div className="p-3 bg-yellow-500/10 border border-yellow-500/50 text-yellow-500 text-sm font-mono rounded">
                  Ogohlantirish: URL manzilida token mavjud emas. Havola noto'g'ri bo'lishi mumkin.
                </div>
              )}
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
                <label className="text-sm font-medium">Parolni tasdiqlang</label>
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
        <CardFooter className="flex flex-col gap-4">
          {status !== 'success' && (
            <Button 
              type="submit" 
              className="w-full bg-neon text-[#0B0F14] hover:bg-neon-hover font-bold h-11" 
              disabled={status === 'loading' || !password}
            >
              {status === 'loading' ? 'Saqlanmoqda...' : 'Saqlash'}
            </Button>
          )}
          
          <Button 
            type="button" 
            variant="link" 
            className="w-full text-gray-400 hover:text-white"
            onClick={() => router.push('/login')}
          >
            Tizimga kirish sahifasiga qaytish
          </Button>
        </CardFooter>
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
        <Suspense fallback={<div className="text-center p-8">Yuklanmoqda...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </motion.div>
    </div>
  );
}
