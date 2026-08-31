'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { ChevronDownIcon, ChevronUpIcon, HelpCircleIcon } from 'lucide-react';

const FAQ = [
  {
    q: "Platformadan qanday foydalanaman?",
    a: "CodaScript platformasida siz 'Testlar' (ko'p tanlovli savollar) va 'Masalalar' (kod yozib yechiladigan algoritmlar) bo'limlari orqali bilimingizni sinab ko'rishingiz mumkin. Har bir to'g'ri javob uchun XP (tajriba ballari) olasiz va bu sizning reytingingizni oshiradi."
  },
  {
    q: "Jamiyat qanday ishlaydi?",
    a: "'Jamiyat' bo'limi orqali siz o'zingizning test yoki masalangizni qo'shishingiz mumkin. Boshqa foydalanuvchilar uni ko'rib, ovoz berishadi. Agar taklifingiz yetarli ovoz to'plasa, u rasmiy ro'yxatga qo'shiladi va hammaga ochiq bo'ladi."
  },
  {
    q: "XP va Darajalar nima?",
    a: "XP - Experience Points (Tajriba Ballari). Siz muvaffaqiyatli topshiriqlar uchun XP olasiz. Ma'lum bir XP chegarasidan o'tganingizda, darajangiz (Level) oshadi. Bu profil sahifangizda ko'rinadi va Leaderboard (Reyting) da o'rningizni belgilaydi."
  },
  {
    q: "Saqlanganlar bo'limi nima uchun kerak?",
    a: "O'zingizga yoqqan yoki keyinchalik qayta ishlamoqchi bo'lgan test yoki masalalarni 'bookmark' (xatcho'p) iconiga bosish orqali saqlab qo'yishingiz mumkin. Ular 'Saqlanganlar' bo'limida to'planadi."
  }
];

export default function HelpPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="mx-auto w-full max-w-4xl flex flex-col gap-8">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neon/15 text-neon">
          <HelpCircleIcon className="h-6 w-6" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Yordam</h1>
          <p className="text-sm text-ink-dim">Foydalanish yo'riqnomasi va Qoidalar</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 space-y-6">
          <section className="rounded-2xl border border-line bg-surface p-6">
            <h2 className="text-xl font-bold mb-4">Foydalanish yo'riqnomasi</h2>
            <div className="space-y-4 text-ink-dim text-sm leading-relaxed">
              <p>
                <strong>1. Testlar (Quiz):</strong> Turli mavzularda 4 ta variantli testlar. To'g'ri javob berish orqali tezkor XP ishlash imkonini beradi. Har bir testda sizga aniq vaqt beriladi.
              </p>
              <p>
                <strong>2. Masalalar (Problems):</strong> Haqiqiy dasturlash masalalari. Sizga JavaScript tilida kod yozish interfeysi (Editor) beriladi. Yozgan kodingiz turli xil 'Test Case'lar orqali avtomatik tekshiriladi.
              </p>
              <p>
                <strong>3. Kunlik seriya (Streak):</strong> Har kuni platformaga kirib bitta test yoki masala yechsangiz, kuningiz hisobga olinadi. Olov belgisi sizning 'Streak'ingizni ko'rsatadi.
              </p>
              <p>
                <strong>4. Bildirishnomalar:</strong> Platformadagi yangiliklar, takliflaringiz holati (tasdiqlangani yoki rad etilgani) haqida sizga xabarlar keladi. Ularni qo'ng'iroqcha tugmasi orqali ko'rishingiz mumkin.
              </p>
            </div>
          </section>

          <section className="rounded-2xl border border-line bg-surface p-6">
            <h2 className="text-xl font-bold mb-4">Shartlar va qoidalar</h2>
            <ul className="list-disc list-inside space-y-2 text-ink-dim text-sm leading-relaxed">
              <li>Boshqalarni haqorat qilish yoki nojo'ya so'zlar ishlatish qat'iyan man etiladi.</li>
              <li>Jamiyat bo'limiga faqat dasturlashga oid, ma'noli savol va masalalar kiritilishi kerak.</li>
              <li>Avtomatik botlardan foydalanish reytingni sun'iy ko'tarish hisoblanadi va akkaunt bloklanishiga olib kelishi mumkin.</li>
              <li>Platforma ma'murlari (Adminlar) istalgan qoidabuzar foydalanuvchini ogohlantirishsiz o'chirish huquqiga ega.</li>
            </ul>
          </section>
        </div>

        <div className="w-full md:w-[350px]">
          <section className="rounded-2xl border border-line bg-surface p-6 h-full">
            <h2 className="text-lg font-bold mb-4">Ko'p beriladigan savollar</h2>
            <div className="space-y-3">
              {FAQ.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div key={idx} className="border border-line rounded-xl overflow-hidden">
                    <button
                      className="w-full text-left px-4 py-3 bg-elevated hover:bg-line/50 transition-colors flex justify-between items-center"
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                    >
                      <span className="text-sm font-semibold pr-4">{faq.q}</span>
                      {isOpen ? <ChevronUpIcon className="h-4 w-4 shrink-0 text-neon" /> : <ChevronDownIcon className="h-4 w-4 shrink-0 text-ink-dim" />}
                    </button>
                    {isOpen && (
                      <div className="p-4 bg-surface text-sm text-ink-dim leading-relaxed border-t border-line">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
