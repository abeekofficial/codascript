'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { LoaderCard } from '@/components/status/statusCard';
import { CheckIcon, XIcon, MessageSquareIcon, CodeIcon } from 'lucide-react';

export default function AdminModerationPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectReason, setRejectReason] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    setLoading(true);
    try {
      // Assuming api.getPendingCommunity is added to api.ts
      const { data } = await api.getPendingCommunity();
      setItems(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string, type: string) => {
    if (!confirm('Tasdiqlaysizmi?')) return;
    try {
      await api.forceApproveCommunity(type, id);
      setItems(items.filter(i => (i._id || i.id) !== id));
    } catch (e: any) {
      alert(e.response?.data?.message || e.message || 'Xato');
    }
  };

  const handleReject = async (id: string, type: string) => {
    const reason = rejectReason[id] || '';
    if (!reason.trim()) {
      alert('Iltimos, rad etish sababini kiriting.');
      return;
    }
    if (!confirm('Rad etasizmi?')) return;
    try {
      await api.forceRejectCommunity(type, id, reason);
      setItems(items.filter(i => (i._id || i.id) !== id));
    } catch (e: any) {
      alert(e.response?.data?.message || e.message || 'Xato');
    }
  };

  if (loading) {
    return <div className="p-12 flex justify-center"><LoaderCard illustrationSrc="/illustrations/loader-astronaut.png" title="Yuklanmoqda..." /></div>;
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Moderatsiya kutayotganlar</h2>
      {items.length === 0 ? (
        <div className="p-12 text-center text-ink-dim rounded-2xl border border-line bg-surface">Kutilayotgan takliflar yo'q</div>
      ) : (
        <div className="space-y-6">
          {items.map(item => {
            const id = item._id || item.id;
            return (
              <div key={id} className="rounded-2xl border border-line bg-surface p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold">{item.title || item.question}</h3>
                    <div className="flex gap-2 text-sm text-ink-dim mt-2">
                      <span className="bg-line px-2 py-1 rounded text-ink">{item.itemType === 'problem' ? 'Masala' : 'Savol'}</span>
                      <span className="px-2 py-1">Muallif: @{item.author?.username || 'user'}</span>
                      <span className="px-2 py-1">Qiyinlik: {item.difficulty}</span>
                      <span className="px-2 py-1">Mavzu: {item.topic}</span>
                    </div>
                  </div>
                </div>

                <div className="mb-4 text-sm text-ink-muted bg-elevated p-4 rounded-xl border border-line whitespace-pre-wrap">
                  {item.description || item.explanation || (item.options ? 'Variantlar:\n' + item.options.join('\n') : '')}
                </div>
                
                {(item.starterCode || item.testCases) && (
                  <div className="mb-4 p-4 rounded-xl border border-line bg-elevated text-xs font-mono">
                    <p className="font-bold mb-2">Boshlang'ich kod:</p>
                    <pre className="mb-4">{typeof item.starterCode === 'object' ? item.starterCode.javascript : item.starterCode}</pre>
                    <p className="font-bold mb-2">Test Caselar:</p>
                    {item.testCases?.map((tc: any, idx: number) => (
                      <div key={idx} className="mb-2 pl-2 border-l-2 border-neon">
                        In: {tc.input}<br/>Out: {tc.expectedOutput}
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-4 mt-6 border-t border-line pt-4">
                  <button 
                    onClick={() => handleApprove(id, item.itemType)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-500 hover:bg-green-500/20 rounded-xl font-medium transition-colors"
                  >
                    <CheckIcon className="w-5 h-5" /> Tasdiqlash
                  </button>
                  <div className="flex flex-1 gap-2">
                    <input 
                      type="text" 
                      placeholder="Rad etish sababi..." 
                      value={rejectReason[id] || ''}
                      onChange={e => setRejectReason({ ...rejectReason, [id]: e.target.value })}
                      className="flex-1 px-4 py-2 rounded-xl border border-line bg-bg focus:border-red-500 outline-none text-sm"
                    />
                    <button 
                      onClick={() => handleReject(id, item.itemType)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-xl font-medium transition-colors"
                    >
                      <XIcon className="w-5 h-5" /> Rad etish
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
