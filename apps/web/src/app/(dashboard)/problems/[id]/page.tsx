'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeftIcon, PlayIcon, SendIcon, CheckCircleIcon, XCircleIcon, ThumbsUpIcon, ThumbsDownIcon, BookmarkIcon } from 'lucide-react';
import Link from 'next/link';
import { CodeEditor } from '@/components/ui/CodeEditor';
import { ClientProblem } from '@codascript/types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';

interface RunResult {
  status: 'success' | 'error' | 'failed';
  output?: string;
  error?: string;
  passedCount?: number;
  totalCount?: number;
  executionTimeMs?: number;
}

import { api } from '@/services/api';

export default function ProblemDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  
  const [problem, setProblem] = useState<any>(null); // Use any for additional fields
  const [code, setCode] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<RunResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (problem) {
      api.checkSaved('problem', problem.id || problem._id).then(setIsSaved).catch(console.error);
    }
  }, [problem]);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    
    api.getProblem(id)
      .then(data => {
        if (!cancelled && data) {
          setProblem(data);
          setCode(data.starterCode?.javascript || '');
        }
      })
      .catch(err => {
        if (!cancelled) console.error(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
      
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [id]);

  const handleRun = async () => {
    if (!problem) return;
    setIsRunning(true);
    setResult(null);
    
    try {
      const apiRes = await api.runProblem(problem.id, code, 'javascript');
      
      if (apiRes.success) {
        const { status, passedTests, totalTests, results } = apiRes.data;
        if (status === 'no_test_cases') {
          setResult({
            status: 'error',
            error: 'Masalada test holatlari mavjud emas. Admin tekshirishi kerak.'
          });
          return;
        }
        const isSuccess = status === 'accepted';
        setResult({
          status: isSuccess ? 'success' : 'error',
          output: isSuccess ? 'Barcha testlar muvaffaqiyatli o\'tdi!' : 'Xatolik yoki xato javob',
          error: isSuccess ? undefined : results?.[0]?.actualOutput || 'Xato javob qaytarildi',
          passedCount: passedTests,
          totalCount: totalTests,
          executionTimeMs: results?.[0]?.executionTimeMs || 0
        });
        return;
      }
      throw new Error(apiRes.message || 'API failed');
    } catch (e: any) {
      setResult({
        status: 'error',
        error: e instanceof Error ? e.message : (e?.message || String(e))
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!problem) return;
    setIsSubmitting(true);
    setResult(null);
    
    try {
      const apiRes = await api.submitProblem(problem.id, code, 'javascript');
      
      if (apiRes.success) {
        const { status, passedTests, totalTests, results } = apiRes.data;
        if (status === 'no_test_cases') {
          setResult({
            status: 'error',
            error: 'Masalada test holatlari mavjud emas. Admin tekshirishi kerak.'
          });
          return;
        }
        const isSuccess = status === 'accepted';
        setResult({
          status: isSuccess ? 'success' : 'error',
          output: isSuccess ? 'Tabriklaymiz! Yechim to\'g\'ri.' : 'Xatolik yoki xato javob',
          error: isSuccess ? undefined : results?.[0]?.actualOutput || 'Xato javob qaytarildi',
          passedCount: passedTests,
          totalCount: totalTests,
          executionTimeMs: results?.[0]?.executionTimeMs || 0
        });
        return;
      }
      throw new Error(apiRes.message || 'API failed');
    } catch (e: any) {
      setResult({
        status: 'error',
        error: e instanceof Error ? e.message : (e?.message || String(e))
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVote = async (voteType: 'up' | 'down') => {
    if (!problem) return;
    try {
      const res = await api.voteProblem(problem.id || problem._id, voteType);
      // Assuming API returns updated problem or we can update optimistically
      setProblem({
        ...problem,
        upvotes: res.upvotes ?? problem.upvotes + (voteType === 'up' ? 1 : 0),
        downvotes: res.downvotes ?? problem.downvotes + (voteType === 'down' ? 1 : 0)
      });
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="p-8 text-center text-ink-dim">Yuklanmoqda...</div>;
  if (!problem) return <div className="p-8 text-center text-red-500">Masala topilmadi!</div>;

  return (
    <div className="flex h-full min-h-[70vh] flex-col rounded-2xl border border-line bg-bg shadow-sm overflow-hidden">
      {/* Header */}
      <header className="flex shrink-0 flex-col gap-4 border-b border-line bg-surface p-4 sm:flex-row sm:items-center sm:justify-between lg:px-6">
        <div className="flex items-start sm:items-center gap-3 sm:gap-4">
          <Link href="/problems" className="mt-1 sm:mt-0 text-ink-dim hover:text-ink transition-colors">
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <div className="flex flex-col">
            <div className="flex flex-wrap items-center gap-2">
              {problem.genericId && (
                <span className="text-xs font-mono text-ink-muted">{problem.genericId}</span>
              )}
              <h1 className="text-base sm:text-lg font-semibold leading-tight">{problem.title}</h1>
              <span className={"rounded-full px-2 py-0.5 text-[10px] sm:text-xs font-medium whitespace-nowrap " + (
                problem.difficulty === 'easy' ? 'bg-green-500/10 text-green-500' :
                problem.difficulty === 'medium' ? 'bg-yellow-500/10 text-yellow-500' :
                'bg-red-500/10 text-red-500'
              )}>
                {problem.difficulty}
              </span>
            </div>
            {problem.author && (
              <span className="text-[11px] sm:text-xs text-ink-dim mt-1">
                Muallif: <Link href={`/users/${problem.author.username || problem.author}`} className="hover:text-neon transition-colors">@{problem.author.username || problem.author}</Link>
              </span>
            )}
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1 border-r border-line pr-2 sm:pr-3 mr-0 sm:mr-1">
            <button
              onClick={async () => {
                try {
                  const pId = problem.id || problem._id;
                  if (isSaved) {
                    await api.unsaveItem('problem', pId);
                    setIsSaved(false);
                  } else {
                    await api.saveItem('problem', pId);
                    setIsSaved(true);
                  }
                } catch (e) {
                  console.error(e);
                }
              }}
              className="p-1.5 text-ink-dim hover:text-neon hover:bg-elevated rounded-lg transition-colors flex items-center gap-1"
            >
              <BookmarkIcon className={`h-4 w-4 ${isSaved ? 'fill-neon text-neon' : ''}`} />
            </button>
            <button onClick={() => handleVote('up')} className="p-1.5 text-ink-dim hover:text-green-500 hover:bg-elevated rounded-lg transition-colors flex items-center gap-1">
              <ThumbsUpIcon className="h-4 w-4" />
              <span className="text-[11px] sm:text-xs font-medium">{problem.upvotes || 0}</span>
            </button>
            <button onClick={() => handleVote('down')} className="p-1.5 text-ink-dim hover:text-red-500 hover:bg-elevated rounded-lg transition-colors flex items-center gap-1">
              <ThumbsDownIcon className="h-4 w-4" />
              <span className="text-[11px] sm:text-xs font-medium">{problem.downvotes || 0}</span>
            </button>
          </div>
          <button
            onClick={handleRun}
            disabled={isRunning || isSubmitting}
            className="flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-lg bg-elevated px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-ink transition-colors hover:bg-line disabled:opacity-50"
          >
            <PlayIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            {isRunning ? '...' : 'Run'}
          </button>
          <button
            onClick={handleSubmit}
            disabled={isRunning || isSubmitting}
            className="flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-lg bg-neon px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-bg transition-colors hover:bg-neon-hover disabled:opacity-50"
          >
            <SendIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            {isSubmitting ? '...' : 'Submit'}
          </button>
        </div>
      </header>

      {/* Main Split Content */}
      <div className="flex flex-1 flex-col lg:flex-row overflow-hidden">
        {/* Left Pane - Description */}
        <div className="w-full lg:w-1/2 h-[50vh] lg:h-full overflow-y-auto border-b lg:border-b-0 lg:border-r border-line p-4 sm:p-6">
          <div className="markdown-content text-ink leading-relaxed space-y-4 text-sm sm:text-base">
            <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
              {problem.description}
            </ReactMarkdown>
          </div>
          
          {/* Result Area */}
          {result && (
            <div className="mt-8 rounded-xl border border-line bg-surface p-4 sm:p-5">
              <h3 className="mb-3 text-xs sm:text-sm font-semibold text-ink-dim">Natija</h3>
              
              {result.status === 'error' ? (
                <div className="flex items-start gap-3 text-red-500">
                  <XCircleIcon className="h-5 w-5 shrink-0" />
                  <div className="text-xs sm:text-sm font-medium">
                    {result.error}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-start gap-3 text-green-500">
                    <CheckCircleIcon className="h-5 w-5 shrink-0" />
                    <div className="text-xs sm:text-sm font-medium">
                      {result.output}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 sm:gap-6 text-xs sm:text-sm text-ink-dim">
                    <div>
                      <span className="font-semibold text-ink">Testlar:</span> {result.passedCount}/{result.totalCount}
                    </div>
                    <div>
                      <span className="font-semibold text-ink">Vaqt:</span> {result.executionTimeMs}ms
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Pane - Editor */}
        <div className="w-full lg:w-1/2 min-h-[50vh] lg:h-full p-0 sm:p-4 lg:p-6 lg:pl-3 flex flex-col relative z-0">
          <CodeEditor
            language={problem.topic === 'javascript' ? 'javascript' : problem.topic}
            value={code}
            onChange={(val) => setCode(val || '')}
          />
        </div>
      </div>
    </div>
  );
}
