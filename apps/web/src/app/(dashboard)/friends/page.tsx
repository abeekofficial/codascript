'use client';
import { PageHeader } from '@/components/ui/PageHeader';

export default function FriendsPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Do'stlar"
        description="Do'stlaringiz bilan kuch sinashing va ularning yutuqlarini kuzatib boring."
      />
      <div className="rounded-2xl border border-line bg-surface p-6 text-center text-ink-muted">
        Tez kunda...
      </div>
    </div>
  );
}
