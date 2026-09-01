'use client';
import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { api } from '@/services/api';
import { LoaderCard } from '@/components/status/statusCard';
import { ThumbsUpIcon, ThumbsDownIcon, PlusIcon, XIcon, MessageSquareIcon, CodeIcon } from 'lucide-react';
import Link from 'next/link';
import { TECHS, DIFFICULTIES } from '@/data/tech';
import { useAuthStore } from '@/store/authStore';

export default function JamiyatPage() {
  const { user } = useAuthStore();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Forms states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'problem' | 'question'>('problem');
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Shared form state
  const [topic, setTopic] = useState('javascript');
  const [difficulty, setDifficulty] = useState('easy');

  // Problem specific
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [problemExamples, setProblemExamples] = useState<{ input: string; output: string }[]>([{ input: '', output: '' }]);
  const [problemStarterCode, setProblemStarterCode] = useState('');
  const [problemTestCases, setProblemTestCases] = useState<{ input: string; expectedOutput: string; isHidden: boolean }[]>([]);

  // Question specific
  const [questionType, setQuestionType] = useState<'multiple_choice' | 'code'>('multiple_choice');
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState<string[]>(['', '', '', '']);
  const [correctOptionId, setCorrectOptionId] = useState<number>(0);
  const [explanation, setExplanation] = useState('');
  const [questionStarterCode, setQuestionStarterCode] = useState('');
  const [questionTestCases, setQuestionTestCases] = useState<{ input: string; expectedOutput: string; isHidden: boolean }[]>([]);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const [problemsRes, questionsRes] = await Promise.all([
        api.getPendingProblems(),
        api.getPendingQuestions()
      ]);
      
      const combined = [
        ...problemsRes.map((p: any) => ({ ...p, itemType: 'problem' })),
        ...questionsRes.map((q: any) => ({ ...q, itemType: 'question' }))
      ];
      
      // Sort by newest
      combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setItems(combined);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (id: string, itemType: 'problem' | 'question', voteType: 'up' | 'down') => {
    try {
      const res = itemType === 'problem' 
        ? await api.voteProblem(id, voteType)
        : await api.voteQuestion(id, voteType);
        
      setItems(items.map(item => 
        (item._id === id || item.id === id) ? {
          ...item,
          upvotes: res.upvotes,
          downvotes: res.downvotes
        } : item
      ));
    } catch (e) {
      console.error(e);
    }
  };

  const resetForm = () => {
    setSuccessMessage("Taklifingiz muvaffaqiyatli yuborildi! Jamiyat tomonidan ko'rib chiqilgach tasdiqlanadi.");
    setTimeout(() => {
      setIsFormOpen(false);
      setSuccessMessage('');
    }, 4000);
    
    setTitle('');
    setDescription('');
    setProblemStarterCode('');
    setProblemExamples([{ input: '', output: '' }]);
    setProblemTestCases([]);
    
    setQuestionText('');
    setExplanation('');
    setOptions(['', '', '', '']);
    setCorrectOptionId(0);
    setQuestionStarterCode('');
    setQuestionTestCases([]);
  };

  const handleSubmitProblem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title.length < 10) return alert('Masala sarlavhasi kamida 10 ta belgidan iborat bo\'lishi kerak');
    if (description.length < 10) return alert('Masala tavsifi kamida 10 ta belgidan iborat bo\'lishi kerak');
    if (!problemStarterCode.trim()) return alert('Boshlang\'ich kod bo\'sh bo\'lishi mumkin emas');
    if (problemTestCases.length === 0) return alert('Kamida 1 ta test case kiritilishi kerak');
    
    setSubmitting(true);
    try {
      const newProblem = await api.submitCommunityProblem({
        title,
        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description,
        topic,
        difficulty,
        examples: problemExamples,
        testCases: problemTestCases,
        starterCode: { javascript: problemStarterCode }
      });
      setItems([{ ...newProblem, itemType: 'problem' }, ...items]);
      resetForm();
    } catch (e: any) {
      console.error(e);
      alert(e.response?.data?.message || e.message || 'Xatolik yuz berdi');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (questionText.length < 10) return alert('Savol matni kamida 10 ta belgidan iborat bo\'lishi kerak');
    
    if (questionType === 'multiple_choice') {
      const trimmedOptions = options.map(o => o.trim()).filter(Boolean);
      if (trimmedOptions.length !== options.length) return alert('Variantlar bo\'sh bo\'lishi mumkin emas');
      if (new Set(trimmedOptions).size !== options.length) return alert('Variantlar bir-biridan farq qilishi kerak (duplikat mumkin emas)');
    } else {
      if (!questionStarterCode.trim()) return alert('Boshlang\'ich kod bo\'sh bo\'lishi mumkin emas');
      if (questionTestCases.length === 0) return alert('Kamida 1 ta test case kiritilishi kerak');
    }

    setSubmitting(true);
    try {
      const payload = {
        topic,
        difficulty,
        type: questionType,
        question: questionText,
        explanation,
        ...(questionType === 'multiple_choice' ? {
          options: options.filter(o => o.trim()),
          correctOptionId
        } : {
          language: 'javascript',
          starterCode: questionStarterCode,
          testCases: questionTestCases
        })
      };
      
      const newQuestion = await api.submitCommunityQuestion(payload);
      setItems([{ ...newQuestion, itemType: 'question' }, ...items]);
      resetForm();
    } catch (e: any) {
      console.error(e);
      alert(e.response?.data?.message || e.message || 'Xatolik yuz berdi');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex items-start justify-between">
        <PageHeader
          eyebrow="Jamiyat"
          title="Foydalanuvchilar takliflari"
          description="Boshqalar tomonidan taklif etilgan masala va testlarga ovoz bering yoki o'zingiznikini qo'shing."
        />
        {!isFormOpen && (
          <button 
            onClick={() => setIsFormOpen(true)}
            className="mt-6 flex items-center gap-2 rounded-xl bg-neon px-4 py-2.5 text-sm font-medium text-bg hover:bg-neon-hover transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            Yangi qo'shish
          </button>
        )}
      </div>

      {successMessage && (
        <div className="mb-6 p-4 rounded-xl border border-green-500/30 bg-green-500/10 text-green-500 font-medium">
          {successMessage}
        </div>
      )}

      {isFormOpen && (
        <div className="mb-8 rounded-2xl border border-line bg-surface p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-ink">Yangi kontent qo'shish</h2>
            <button 
              onClick={() => setIsFormOpen(false)}
              className="p-2 text-ink-dim hover:text-ink hover:bg-elevated rounded-xl transition-colors"
            >
              <XIcon className="h-5 w-5" />
            </button>
          </div>
          
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setActiveTab('problem')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'problem' ? 'bg-neon text-bg' : 'bg-elevated text-ink hover:bg-line'}`}
            >
              <CodeIcon className="h-4 w-4" /> Masala (LeetCode)
            </button>
            <button
              onClick={() => setActiveTab('question')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'question' ? 'bg-neon text-bg' : 'bg-elevated text-ink hover:bg-line'}`}
            >
              <MessageSquareIcon className="h-4 w-4" /> Savol (Test/Quiz)
            </button>
          </div>

          <form onSubmit={activeTab === 'problem' ? handleSubmitProblem : handleSubmitQuestion} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-ink-dim mb-1.5">Texnologiya</label>
                <select 
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  className="w-full rounded-xl border border-line bg-elevated px-4 py-2 text-sm text-ink focus:border-neon outline-none"
                >
                  {TECHS.map(t => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-dim mb-1.5">Qiyinlik</label>
                <select 
                  value={difficulty}
                  onChange={e => setDifficulty(e.target.value)}
                  className="w-full rounded-xl border border-line bg-elevated px-4 py-2 text-sm text-ink focus:border-neon outline-none"
                >
                  {DIFFICULTIES.map(d => (
                    <option key={d.id} value={d.id}>{d.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {activeTab === 'problem' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-ink-dim mb-1.5">Sarlavha (Title)</label>
                  <input 
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    required
                    className="w-full rounded-xl border border-line bg-elevated px-4 py-2 text-sm text-ink focus:border-neon outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-dim mb-1.5">Tavsif (Description)</label>
                  <textarea 
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    required
                    rows={4}
                    className="w-full rounded-xl border border-line bg-elevated px-4 py-2 text-sm text-ink focus:border-neon outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-dim mb-1.5">Boshlang'ich kod (JS)</label>
                  <textarea 
                    value={problemStarterCode}
                    onChange={e => setProblemStarterCode(e.target.value)}
                    rows={3}
                    className="w-full font-mono text-xs rounded-xl border border-line bg-elevated px-4 py-2 text-ink focus:border-neon outline-none"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="block text-sm font-medium text-ink-dim">Misollar (Examples)</span>
                    <button type="button" onClick={() => setProblemExamples([...problemExamples, { input: '', output: '' }])} className="text-xs font-semibold text-neon hover:underline">+ Misol</button>
                  </div>
                  {problemExamples.map((ex, i) => (
                    <div key={i} className="flex gap-2">
                      <input value={ex.input} onChange={e => { const n = [...problemExamples]; n[i].input = e.target.value; setProblemExamples(n); }} required className="flex-1 rounded-lg border border-line bg-bg px-3 text-xs font-mono focus:border-neon outline-none" placeholder="Input" />
                      <input value={ex.output} onChange={e => { const n = [...problemExamples]; n[i].output = e.target.value; setProblemExamples(n); }} required className="flex-1 rounded-lg border border-line bg-bg px-3 text-xs font-mono focus:border-neon outline-none" placeholder="Output" />
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="block text-sm font-medium text-ink-dim">Test Case'lar</span>
                    <button type="button" onClick={() => setProblemTestCases([...problemTestCases, { input: '', expectedOutput: '', isHidden: false }])} className="text-xs font-semibold text-neon hover:underline">+ Test</button>
                  </div>
                  {problemTestCases.map((tc, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input value={tc.input} onChange={e => { const n = [...problemTestCases]; n[i].input = e.target.value; setProblemTestCases(n); }} required className="flex-1 rounded-lg border border-line bg-bg px-3 text-xs font-mono focus:border-neon outline-none" placeholder="Input" />
                      <input value={tc.expectedOutput} onChange={e => { const n = [...problemTestCases]; n[i].expectedOutput = e.target.value; setProblemTestCases(n); }} required className="flex-1 rounded-lg border border-line bg-bg px-3 text-xs font-mono focus:border-neon outline-none" placeholder="Expected Output" />
                    </div>
                  ))}
                </div>
              </>
            )}

            {activeTab === 'question' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-ink-dim mb-1.5">Savol turi</label>
                  <select 
                    value={questionType}
                    onChange={e => setQuestionType(e.target.value as any)}
                    className="w-full rounded-xl border border-line bg-elevated px-4 py-2 text-sm text-ink focus:border-neon outline-none"
                  >
                    <option value="multiple_choice">Test (Variantli)</option>
                    <option value="code">Kod yozish</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-ink-dim mb-1.5">Savol matni</label>
                  <textarea 
                    value={questionText}
                    onChange={e => setQuestionText(e.target.value)}
                    required
                    rows={3}
                    className="w-full rounded-xl border border-line bg-elevated px-4 py-2 text-sm text-ink focus:border-neon outline-none"
                  />
                </div>

                {questionType === 'multiple_choice' ? (
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-ink-dim">Javob variantlari</label>
                    {options.map((opt, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <input 
                          type="radio" 
                          name="correctOption"
                          checked={correctOptionId === i}
                          onChange={() => setCorrectOptionId(i)}
                          className="w-4 h-4 accent-neon"
                        />
                        <input 
                          value={opt}
                          onChange={e => { const n = [...options]; n[i] = e.target.value; setOptions(n); }}
                          required
                          className={`flex-1 rounded-lg border ${correctOptionId === i ? 'border-neon' : 'border-line'} bg-bg px-3 py-2 text-sm focus:border-neon outline-none`}
                          placeholder={`Variant ${i + 1}`}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-ink-dim mb-1.5">Boshlang'ich kod (JS)</label>
                      <textarea 
                        value={questionStarterCode}
                        onChange={e => setQuestionStarterCode(e.target.value)}
                        rows={3}
                        className="w-full font-mono text-xs rounded-xl border border-line bg-elevated px-4 py-2 text-ink focus:border-neon outline-none"
                      />
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="block text-sm font-medium text-ink-dim">Test Case'lar</span>
                        <button type="button" onClick={() => setQuestionTestCases([...questionTestCases, { input: '', expectedOutput: '', isHidden: false }])} className="text-xs font-semibold text-neon hover:underline">+ Test</button>
                      </div>
                      {questionTestCases.map((tc, i) => (
                        <div key={i} className="flex gap-2 items-center">
                          <input value={tc.input} onChange={e => { const n = [...questionTestCases]; n[i].input = e.target.value; setQuestionTestCases(n); }} required className="flex-1 rounded-lg border border-line bg-bg px-3 text-xs font-mono focus:border-neon outline-none" placeholder="Input" />
                          <input value={tc.expectedOutput} onChange={e => { const n = [...questionTestCases]; n[i].expectedOutput = e.target.value; setQuestionTestCases(n); }} required className="flex-1 rounded-lg border border-line bg-bg px-3 text-xs font-mono focus:border-neon outline-none" placeholder="Expected Output" />
                        </div>
                      ))}
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-ink-dim mb-1.5">Tushuntirish (To'g'ri javob uchun)</label>
                  <textarea 
                    value={explanation}
                    onChange={e => setExplanation(e.target.value)}
                    rows={2}
                    className="w-full rounded-xl border border-line bg-elevated px-4 py-2 text-sm text-ink focus:border-neon outline-none"
                    placeholder="Qisqacha tushuntirish..."
                  />
                </div>
              </>
            )}
            
            <div className="pt-2">
              <button 
                type="submit" 
                disabled={submitting}
                className="rounded-xl bg-neon px-6 py-2.5 text-sm font-medium text-bg hover:bg-neon-hover transition-colors disabled:opacity-50"
              >
                {submitting ? 'Yuborilmoqda...' : 'Yuborish'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-4">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <LoaderCard illustrationSrc="/illustrations/loader-astronaut.png" title="Yuklanmoqda..." />
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-line bg-surface p-8 text-center text-ink-dim">
            Hozircha jamiyat takliflari yo'q. Birinchi bo'lib taklif eting!
          </div>
        ) : (
          items.map(item => {
            const diffColor = item.difficulty === 'easy' ? 'text-green-500' : item.difficulty === 'medium' ? 'text-yellow-500' : 'text-red-500';
            const tech = TECHS.find(t => t.id === item.topic)?.label || item.topic;
            const titleText = item.itemType === 'problem' ? item.title : item.question;

            return (
              <div key={item._id || item.id} className="flex gap-4 rounded-2xl border border-line bg-surface p-5">
                <div className="flex flex-col items-center gap-2 border-r border-line pr-4">
                  <button 
                    onClick={() => handleVote(item._id || item.id, item.itemType, 'up')}
                    className={`p-1.5 rounded-lg transition-colors ${item.upvotes?.includes(user?._id || user?.id) ? 'text-green-500 bg-green-500/10' : 'text-ink-dim hover:text-green-500 hover:bg-elevated'}`}
                  >
                    <ThumbsUpIcon className={`h-5 w-5 ${item.upvotes?.includes(user?._id || user?.id) ? 'fill-current' : ''}`} />
                  </button>
                  <span className="font-semibold text-sm text-green-500">{item.upvotes?.length || 0}</span>
                  <button 
                    onClick={() => handleVote(item._id || item.id, item.itemType, 'down')}
                    className={`p-1.5 rounded-lg transition-colors ${item.downvotes?.includes(user?._id || user?.id) ? 'text-red-500 bg-red-500/10' : 'text-ink-dim hover:text-red-500 hover:bg-elevated'}`}
                  >
                    <ThumbsDownIcon className={`h-5 w-5 ${item.downvotes?.includes(user?._id || user?.id) ? 'fill-current' : ''}`} />
                  </button>
                  <span className="font-semibold text-sm text-red-500">{item.downvotes?.length || 0}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-ink">{titleText}</h3>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-ink-dim">
                        <span className="font-medium bg-line px-1.5 py-0.5 rounded text-ink">
                          {item.itemType === 'problem' ? 'Masala' : 'Savol (Test)'}
                        </span>
                        {item.author && (
                          <Link
                            href={`/users/${typeof item.author === 'object' ? item.author.username : item.author}`}
                            className="font-medium hover:text-green-500 hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            @{typeof item.author === 'object' ? (item.author.username || item.author.name || 'User') : item.author}
                          </Link>
                        )}
                        <span className={`font-medium ${diffColor}`}>{item.difficulty}</span>
                        <span className="h-1 w-1 rounded-full bg-line" />
                        <span>{tech}</span>
                        {item.status === 'pending' && (
                          <span className="rounded bg-yellow-500/10 px-1.5 py-0.5 text-yellow-500">Kutilmoqda</span>
                        )}
                      </div>
                    </div>
                  </div>
                  {item.itemType === 'problem' && (
                    <p className="mt-3 text-sm text-ink-muted line-clamp-2">
                      {item.description}
                    </p>
                  )}
                  {item.itemType === 'question' && item.type === 'multiple_choice' && (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {item.options?.map((opt: string, idx: number) => (
                        <div key={idx} className={`text-xs p-2 rounded border ${item.correctOptionId === idx ? 'border-green-500 text-green-500 bg-green-500/10' : 'border-line text-ink-dim'}`}>
                          {opt}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  );
}
