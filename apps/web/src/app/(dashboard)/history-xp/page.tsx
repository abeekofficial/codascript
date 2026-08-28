'use client';
import { PageHeader } from '@/components/ui/PageHeader';

export default function XPHistoryPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="XP Tarixi"
        description="Barcha yig'ilgan va sarflangan XP laringiz tarixi."
      />
      <div className="rounded-2xl border border-line bg-surface p-6 text-center text-ink-muted">
        Tez kunda...
      </div>
    </div>
  );
}
