'use client';

import React from 'react';
import Link from 'next/link';
import { TerminalIcon, CheckCircle2Icon, BarChart3Icon, TrophyIcon, ShieldIcon, MoonIcon, PlayIcon, ZapIcon, LockIcon } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const { isAuthenticated, isHydrated } = useAuthStore();
  const router = useRouter();

  // If user is logged in, redirect them to dashboard
  React.useEffect(() => {
    if (isHydrated && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isHydrated, isAuthenticated, router]);

  if (!isHydrated) return null; // wait for hydration

  return (
    <div className="min-h-screen bg-[#0B0F14] text-white flex flex-col font-sans">
      {/* Navbar */}
      <header className="flex items-center justify-between px-6 py-4 md:px-12 border-b border-[#1F2937]/50 sticky top-0 bg-[#0B0F14]/90 backdrop-blur z-50">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-neon/15 text-neon">
            <TerminalIcon className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="text-[17px] font-bold tracking-tight text-white">
            Coda<span className="text-neon">Script</span>
          </span>
        </div>
        <nav className="hidden md:flex gap-6 text-sm font-medium text-gray-400">
          <Link href="/" className="text-white">Bosh sahifa</Link>
          <Link href="/quizzes" className="hover:text-white transition">Testlar</Link>
          <Link href="/leaderboard" className="hover:text-white transition">Leaderboard</Link>
          <Link href="#" className="hover:text-white transition">Blog</Link>
          <Link href="#" className="hover:text-white transition">Yordam</Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-semibold text-gray-300 hover:text-white transition">
            Kirish
          </Link>
          <Link href="/login?tab=register" className="text-sm font-semibold bg-neon text-[#0B0F14] px-4 py-2 rounded-xl hover:bg-neon-hover transition">
            Ro'yxatdan o'tish
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center max-w-7xl mx-auto w-full px-6 md:px-12 pt-20 pb-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="max-w-xl">
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1] text-white mb-6">
              Dasturlashni o'rganing.<br />
              <span className="text-neon">Test qiling. Rivojlaning.</span>
            </h1>
            <p className="text-gray-400 text-lg mb-8 leading-relaxed">
              Interaktiv testlar, real vaqtda reytinglar va amaliy qiyinchiliklar bilan dasturlash ko'nikmalaringizni mustahkamlang.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/login?tab=register" className="flex items-center justify-center gap-2 text-sm font-bold bg-neon text-[#0B0F14] px-6 py-3.5 rounded-xl hover:bg-neon-hover transition shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                Boshlash
              </Link>
              <Link href="#features" className="flex items-center justify-center gap-2 text-sm font-bold bg-[#1F2937] text-white px-6 py-3.5 rounded-xl hover:bg-[#374151] transition">
                Ko'proq ma'lumot
              </Link>
            </div>

            <div className="mt-12">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">Barcha asosiy texnologiyalar</p>
              <div className="flex flex-wrap gap-3">
                {[
                  { name: 'HTML', color: '#E44D26' },
                  { name: 'CSS', color: '#2965F1' },
                  { name: 'JavaScript', color: '#F0DB4F' },
                  { name: 'TypeScript', color: '#3178C6' },
                  { name: 'React', color: '#61DAFB' }
                ].map(tech => (
                  <span key={tech.name} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#161B22] border border-[#30363D] text-xs font-medium text-gray-300">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tech.color }} />
                    {tech.name}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-10 flex gap-6 border-t border-[#1F2937] pt-8">
              <div>
                <p className="text-2xl font-extrabold text-neon">5000+</p>
                <p className="text-xs text-gray-500 font-medium">Savollar</p>
              </div>
              <div className="w-px bg-[#1F2937]" />
              <div>
                <p className="text-2xl font-extrabold text-blue-400">5+</p>
                <p className="text-xs text-gray-500 font-medium">Texnologiyalar</p>
              </div>
              <div className="w-px bg-[#1F2937]" />
              <div>
                <p className="text-2xl font-extrabold text-yellow-400">Real vaqtda</p>
                <p className="text-xs text-gray-500 font-medium">Testlar</p>
              </div>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-lg lg:ml-auto">
            {/* Mock Editor UI */}
            <div className="rounded-2xl border border-[#30363D] bg-[#161B22] shadow-2xl shadow-black/50 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[#30363D] bg-[#0B0F14]">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="ml-4 text-xs font-mono text-gray-500 flex-1 text-center pr-10">React Component</div>
              </div>
              <div className="p-5 font-mono text-sm leading-relaxed text-gray-300">
                <p><span className="text-purple-400">function</span> <span className="text-blue-400">LevelUpMessage</span>() {'{'}</p>
                <p className="pl-4"><span className="text-purple-400">return</span> (</p>
                <p className="pl-8 text-green-400">&lt;div className="coda-script"&gt;</p>
                <p className="pl-12 text-yellow-300">&lt;h1&gt;Sizning navbatdagi darajangiz!&lt;/h1&gt;</p>
                <p className="pl-8 text-green-400">&lt;/div&gt;</p>
                <p className="pl-4">)</p>
                <p>{'}'}</p>
                <br />
                <p><span className="text-purple-400">console</span>.<span className="text-blue-400">log</span>(<span className="text-yellow-300">"Kodingizni tekshiring..."</span>);</p>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div id="features" className="w-full mt-32">
          <h2 className="text-3xl font-extrabold tracking-tight mb-10">Asosiy funksiyalar</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-[#161B22] border border-[#30363D] p-6 rounded-2xl hover:border-gray-500 transition">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 text-green-500 flex items-center justify-center mb-4">
                <CheckCircle2Icon className="w-5 h-5" />
              </div>
              <h3 className="font-bold mb-2">Maxsus interfaol formatlar</h3>
              <p className="text-sm text-gray-400 leading-relaxed">HTML, CSS, JavaScript, TypeScript, React va boshqa texnologiyalar bo'yicha testlar.</p>
            </div>
            <div className="bg-[#161B22] border border-[#30363D] p-6 rounded-2xl hover:border-gray-500 transition">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-4">
                <ZapIcon className="w-5 h-5" />
              </div>
              <h3 className="font-bold mb-2">Amaliy sinovlar</h3>
              <p className="text-sm text-gray-400 leading-relaxed">Qiyin, o'rtacha, oson darajadagi testlarni tanlang va o'zingizni sinab ko'ring.</p>
            </div>
            <div className="bg-[#161B22] border border-[#30363D] p-6 rounded-2xl hover:border-gray-500 transition">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/10 text-yellow-500 flex items-center justify-center mb-4">
                <PlayIcon className="w-5 h-5" />
              </div>
              <h3 className="font-bold mb-2">Real vaqtda reytinglar</h3>
              <p className="text-sm text-gray-400 leading-relaxed">Test tayyorlash, ishlash va ballar olishda ajoyib imkoniyat.</p>
            </div>
            <div className="bg-[#161B22] border border-[#30363D] p-6 rounded-2xl hover:border-gray-500 transition">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-4">
                <BarChart3Icon className="w-5 h-5" />
              </div>
              <h3 className="font-bold mb-2">Shaxsiy statistika</h3>
              <p className="text-sm text-gray-400 leading-relaxed">O'zlashtirgan bilimlaringizni kuzatib, natijalaringizga qarab o'sish.</p>
            </div>
            <div className="bg-[#161B22] border border-[#30363D] p-6 rounded-2xl hover:border-gray-500 transition">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center mb-4">
                <TrophyIcon className="w-5 h-5" />
              </div>
              <h3 className="font-bold mb-2">Leaderboard</h3>
              <p className="text-sm text-gray-400 leading-relaxed">Boshqa foydalanuvchilar bilan bellashing va eng yuqori o'rinni egallang.</p>
            </div>
            <div className="bg-[#161B22] border border-[#30363D] p-6 rounded-2xl hover:border-gray-500 transition">
              <div className="w-10 h-10 rounded-xl bg-gray-400/10 text-gray-400 flex items-center justify-center mb-4">
                <MoonIcon className="w-5 h-5" />
              </div>
              <h3 className="font-bold mb-2">Dark Mode dizayn</h3>
              <p className="text-sm text-gray-400 leading-relaxed">Ko'zni toliqtirmaydigan, zamonaviy va chiroyli interfeys.</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-32 mb-10 w-full max-w-3xl mx-auto bg-[#161B22] border border-[#30363D] rounded-3xl p-10 text-center flex flex-col items-center">
          <h2 className="text-2xl font-bold mb-3">Boshlashga tayyormisiz?</h2>
          <p className="text-gray-400 text-sm mb-8">Testni o'ting va dasturlash ko'nikmalaringizni sinab ko'ring.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/login?tab=register" className="flex items-center justify-center gap-2 text-sm font-bold bg-neon text-[#0B0F14] px-6 py-3 rounded-xl hover:bg-neon-hover transition">
              Boshlash
            </Link>
            <Link href="#features" className="flex items-center justify-center gap-2 text-sm font-bold bg-[#1F2937] text-white px-6 py-3 rounded-xl hover:bg-[#374151] transition">
              Batafsil tanishish
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
