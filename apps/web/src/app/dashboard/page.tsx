'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Flame, PlayCircle } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function DashboardPage() {
  const { user, isAuthenticated, isHydrated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isHydrated, router]);

  const { data: profile, isLoading, isError } = useQuery({
    queryKey: ['profile'],
    queryFn: api.getProfile,
    enabled: isHydrated && isAuthenticated,
  });

  if (!isHydrated || (!isAuthenticated && !isLoading)) return null;

  if (isLoading) {
    return <div className="p-8 text-center">Yuklanmoqda...</div>;
  }

  return (
    <motion.div 
      className="container py-8 px-4 max-w-5xl mx-auto space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Salom, {user?.name || profile?.name}!</h1>
          <p className="text-muted-foreground">O&apos;rganishni davom ettiramizmi?</p>
        </div>
        <div className="flex gap-4">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4 flex items-center gap-3">
                <Trophy className="text-primary w-8 h-8" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Reyting</p>
                  <p className="text-2xl font-bold">{profile?.totalXP ?? 0} XP</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Card className="bg-orange-500/5 border-orange-500/20">
              <CardContent className="p-4 flex items-center gap-3">
                <Flame className="text-orange-500 w-8 h-8" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Streak</p>
                  <p className="text-2xl font-bold">{profile?.currentStreak ?? 0} kun</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <motion.div whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
          <Card>
            <CardHeader>
              <CardTitle>Frontend Asoslari</CardTitle>
              <CardDescription>HTML, CSS va JavaScript asoslari</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full bg-muted rounded-full h-2 mb-4">
                <div className="bg-primary h-2 rounded-full" style={{ width: '80%' }}></div>
              </div>
              <Link href="/quiz/frontend-basics">
                <Button className="w-full gap-2">
                  <PlayCircle className="w-4 h-4" />
                  Davom ettirish
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
          <Card>
            <CardHeader>
              <CardTitle>React va Next.js</CardTitle>
              <CardDescription>Zamonaviy web dasturlash</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full bg-muted rounded-full h-2 mb-4">
                <div className="bg-primary h-2 rounded-full" style={{ width: '10%' }}></div>
              </div>
              <Link href="/quiz/react-next">
                <Button className="w-full gap-2">
                  <PlayCircle className="w-4 h-4" />
                  Boshlash
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
