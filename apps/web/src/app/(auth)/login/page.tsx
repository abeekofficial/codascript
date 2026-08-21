'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((state) => state.login);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let tokens;
      if (isLogin) {
        tokens = await api.login(email, password);
      } else {
        tokens = await api.register(name, email, password);
      }

      // Store the token first so getProfile can use it
      localStorage.setItem('token', tokens.accessToken);

      // Fetch real user profile from the server
      try {
        const profile = await api.getProfile();
        login({
          id: (profile as any)._id?.toString() || '',
          name: profile.name,
          username: (profile as any).username,
          email: profile.email,
          avatar: (profile as any).avatar,
          role: (profile as any).role,
        }, tokens.accessToken);
      } catch {
        // If profile fetch fails, use the data we have
        login({
          id: '',
          name: isLogin ? email.split('@')[0] : name,
          email,
        }, tokens.accessToken);
      }

      router.push('/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Authentication failed';
      setError(message);
    } finally {
      setLoading(false);
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
              {isLogin ? 'Xush kelibsiz!' : 'Ro\'yxatdan o\'tish'}
            </CardTitle>
            <CardDescription className="text-center">
              {isLogin ? 'Hisobingizga kiring' : 'Yangi hisob yarating'}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/50 text-red-500 text-sm font-mono rounded">
                  {error}
                </div>
              )}
              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div
                    key="name-field"
                    initial={{ opacity: 0, height: 0, y: -10 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-2 overflow-hidden"
                  >
                    <label className="text-sm font-medium">Ism</label>
                    <Input 
                      placeholder="Ismingiz" 
                      required 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input 
                  type="email" 
                  placeholder="name@example.com" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Parol</label>
                <Input 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Yuklanmoqda...' : isLogin ? 'Kirish' : 'Ro\'yxatdan o\'tish'}
                </Button>
              </motion.div>
              <Button 
                type="button" 
                variant="link" 
                className="w-full"
                onClick={() => { setIsLogin(!isLogin); setError(''); }}
              >
                {isLogin ? 'Hisobingiz yo\'qmi? Ro\'yxatdan o\'ting' : 'Hisobingiz bormi? Kiring'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
