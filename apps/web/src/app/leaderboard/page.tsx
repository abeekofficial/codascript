'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Medal } from 'lucide-react';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0 }
};

export default function LeaderboardPage() {
  const { data: leaderboard, isLoading, isError } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: api.getLeaderboard,
  });

  if (isLoading) {
    return <div className="p-8 text-center font-mono">Yuklanmoqda...</div>;
  }

  if (isError) {
    return <div className="p-8 text-center font-mono text-red-500">Reytingni yuklashda xatolik yuz berdi.</div>;
  }

  return (
    <motion.div 
      className="container py-8 px-4 max-w-3xl mx-auto space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={itemVariants} className="flex items-center gap-4 mb-8">
        <Trophy className="w-10 h-10 text-yellow-500" />
        <h1 className="text-3xl font-bold tracking-tight">Global Reyting</h1>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle>Eng faol o&apos;quvchilar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {leaderboard?.map((user, index) => (
                <motion.div 
                  key={user._id} 
                  whileHover={{ scale: 1.02, x: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    index === 0 ? 'bg-yellow-500/10 border-yellow-500/50' :
                    index === 1 ? 'bg-gray-300/10 border-gray-300/50' :
                    index === 2 ? 'bg-amber-700/10 border-amber-700/50' :
                    'bg-card'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="font-bold text-xl w-8 text-center">
                      {index + 1}
                    </div>
                    {index < 3 && (
                      <Medal className={`w-6 h-6 ${
                        index === 0 ? 'text-yellow-500' :
                        index === 1 ? 'text-gray-400' :
                        'text-amber-700'
                      }`} />
                    )}
                    <div className="font-medium text-lg">{user.name}</div>
                  </div>
                  <div className="font-bold text-primary">
                    {user.totalXP} XP
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
