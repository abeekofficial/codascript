'use client';
import { PageHeader } from '@/components/ui/PageHeader';
import { HelpCircleIcon, ShieldIcon, TerminalIcon } from 'lucide-react';

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Yordam va Qoidalar"
        description="Saytdan qanday foydalanish va asosiy qoidalar."
      />
      <div className="space-y-6">
        <section className="rounded-2xl border border-line bg-surface p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-neon/15 text-neon">
              <TerminalIcon className="h-5 w-5" />
            </span>
            <h2 className="text-xl font-bold">Saytdan qanday foydalanish mumkin?</h2>
          </div>
          <div className="space-y-4 text-ink-dim leading-relaxed text-sm">
            <p>
              <strong className="text-ink">1. Testlar:</strong> Turli texnologiyalar bo'yicha bilimlaringizni sinab ko'ring. Mavzularni (masalan: HTML, CSS) va ularning submavzularini tanlab test ishlashingiz mumkin.
            </p>
            <p>
              <strong className="text-ink">2. Amaliy masalalar:</strong> Dasturlash tillari bo'yicha masalalarni yeching. Kodingiz serverda xavfsiz muhitda tekshiriladi.
            </p>
            <p>
              <strong className="text-ink">3. Reyting (Leaderboard):</strong> Boshqa foydalanuvchilar bilan bellashing. XP laringiz reytingdagi o'rningizni belgilaydi.
            </p>
            <p>
              <strong className="text-ink">4. Saqlanganlar:</strong> Qiziqarli va qiyin tuyulgan test yoki masalalarni keyinchalik qayta ishlash uchun saqlab qo'yishingiz mumkin.
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-line bg-surface p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/15 text-warning">
              <ShieldIcon className="h-5 w-5" />
            </span>
            <h2 className="text-xl font-bold">Foydalanish shartlari va qoidalari</h2>
          </div>
          <div className="space-y-4 text-ink-dim leading-relaxed text-sm">
            <p>
              - Platformada masalalarni yechishda chetdan tayyor kodlarni ko'chirib o'tish (plagiat) tavsiya etilmaydi.
            </p>
            <p>
              - Jamiyat bo'limida va izohlarda boshqa foydalanuvchilarga nisbatan hurmat bilan munosabatda bo'ling.
            </p>
            <p>
              - XP (Experience Points) tizimi faqatgina shaxsiy bilimlarni oshirishni rag'batlantirish uchun xizmat qiladi, uni sun'iy ravishda oshirishga urinish taqiqlanadi.
            </p>
            <p>
              - Sayt qoidalarini jiddiy ravishda buzgan foydalanuvchilar akkauntlari bloklanishi mumkin.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
