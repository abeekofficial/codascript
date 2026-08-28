'use client';
import { PageHeader } from '@/components/ui/PageHeader';

export default function SavedPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Saqlanganlar"
        description="O'zingiz uchun saqlab qo'ygan testlar va amaliy masalalar ro'yxati."
      />
      <div className="rounded-2xl border border-line bg-surface p-6 text-center text-ink-muted">
        Tez kunda...
      </div>
    </div>
  );
}
