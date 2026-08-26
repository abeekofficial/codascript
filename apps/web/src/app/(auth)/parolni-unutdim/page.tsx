'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      await api.forgotPassword(email);
      setStatus('success');
      setMessage('Elektron pochta manzilingizga parolni tiklash havolasi yuborildi. Iltimos, pochtangizni tekshiring.');
    } catch (err: unknown) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'Xatolik yuz berdi');
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <Card className="w-full max-w-md glass-card">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Parolni tiklash
            </CardTitle>
            <CardDescription className="text-center">
              Elektron pochta manzilingizni kiriting
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <AnimatePresence mode="wait">
                {status === 'success' ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-3 bg-green-500/10 border border-green-500/50 text-green-500 text-sm font-medium rounded text-center"
                  >
                    {message}
                  </motion.div>
                ) : (
                  <motion.div key="form" className="space-y-4">
                    {status === 'error' && (
                      <div className="p-3 bg-red-500/10 border border-red-500/50 text-red-500 text-sm font-mono rounded">
                        {message}
                      </div>
                    )}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email</label>
                      <Input 
                        type="email" 
                        placeholder="name@example.com" 
                        required 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={status === 'loading'}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              {status !== 'success' && (
                <Button 
                  type="submit" 
                  className="w-full bg-neon text-[#0B0F14] hover:bg-neon-hover font-bold h-11" 
                  disabled={status === 'loading' || !email}
                >
                  {status === 'loading' ? 'Yuborilmoqda...' : 'Havola yuborish'}
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
      </motion.div>
    </div>
  );
}
