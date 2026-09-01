'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useQuizStore, AnswerResult } from '@/store/quizStore';
import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ErrorCard, LoaderCard } from '@/components/status/statusCard';
import { useParams, useRouter } from 'next/navigation';
import { Clock, ArrowLeft, ArrowRight, CheckCircle2, Terminal, XCircle, RotateCcw, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const trackId = params.track as string;
  const { isAuthenticated, isHydrated } = useAuthStore();

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isHydrated, router]);
  
  const { 
    quizId, questions, currentQuestionIndex, answers, timeRemaining, 
    isStarted, isFinished, startQuiz, 
    answerQuestion, nextQuestion, prevQuestion, finishQuiz, 
    decrementTime, resetQuiz,
    topic, difficulty, mode, questionCount, setQuizConfig
  } = useQuizStore();

  const [showExplanation, setShowExplanation] = useState(false);
  const [scoreData, setScoreData] = useState<{ score: number, correctAnswers: number, wrongAnswers: number, totalQuestions: number } | null>(null);

  // Return early if not authenticated
  if (!isHydrated || !isAuthenticated) return null;

  // Fetch available topics
  const { data: availableTopics = [], isLoading: topicsLoading, isError: topicsError } = useQuery({
    queryKey: ['topics'],
    queryFn: () => api.getTopics(),
  });

  // Init topic from URL if available in topics
  useEffect(() => {
    if (trackId && availableTopics.length > 0 && !topic) {
      const matchedTopic = availableTopics.find(t => t.toLowerCase() === trackId.toLowerCase());
      if (matchedTopic) {
        setQuizConfig({ topic: matchedTopic });
      } else {
        setQuizConfig({ topic: availableTopics[0] });
      }
    }
  }, [trackId, availableTopics, topic, setQuizConfig]);

  // Fetch count based on config
  const { data: availableCount = 0, isError: countError } = useQuery({
    queryKey: ['questionCount', topic, difficulty, mode],
    queryFn: () => api.getQuestionCount(topic, difficulty, mode),
    enabled: !!topic,
  });

  // Adjust question count if it exceeds available
  useEffect(() => {
    if (questionCount !== 'all' && questionCount > availableCount && availableCount > 0) {
      setQuizConfig({ questionCount: availableCount });
    }
  }, [availableCount, questionCount, setQuizConfig]);

  const completeMutation = useMutation({
    mutationFn: () => api.completeQuiz(quizId!),
    onSuccess: (data) => {
      setScoreData(data);
      finishQuiz();
    }
  });

  const handleCompleteQuiz = useCallback(() => {
    if (quizId) {
      completeMutation.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizId]);

  // Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isStarted && !isFinished && timeRemaining > 0) {
      timer = setInterval(() => {
        decrementTime();
      }, 1000);
    } else if (timeRemaining === 0 && isStarted && !isFinished) {
      handleCompleteQuiz();
    }
    return () => clearInterval(timer);
  }, [isStarted, isFinished, timeRemaining, decrementTime, handleCompleteQuiz]);

  const startMutation = useMutation({
    mutationFn: () => api.startQuiz(topic, difficulty, mode, questionCount),
    onSuccess: (data) => {
      startQuiz(data.quizId, data.questions, data.questions.length * 60);
      setShowExplanation(false);
    }
  });

  const submitMutation = useMutation({
    mutationFn: ({ questionId, idx, optionText }: { questionId: string, idx: number, optionText: string }) => 
      api.submitAnswer(quizId!, questionId, idx, optionText),
    onSuccess: (result: AnswerResult, variables) => {
      answerQuestion(variables.questionId, {
        isCorrect: result.isCorrect,
        explanation: result.explanation,
        selectedOptionIndex: variables.idx
      });
      setShowExplanation(true);
    }
  });

  const handleStart = () => {
    startMutation.mutate();
  };

  const handleAnswer = (questionId: string, idx: number, optionText: string) => {
    if (answers[questionId] !== undefined) return;
    submitMutation.mutate({ questionId, idx, optionText });
  };

  const handleNext = () => {
    setShowExplanation(false);
    nextQuestion();
  };

  if (topicsLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 min-h-screen">
        <LoaderCard illustrationSrc="/illustrations/loader-dino.png" title="Modullar yuklanmoqda..." />
      </div>
    );
  }

  if (topicsError) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 min-h-screen">
        <ErrorCard
          illustrationSrc="/illustrations/error-confused-boy.png"
          title="Tizim xatosi"
          subtitle="Ma'lumotlar bazasiga ulanib bo'lmadi. Iltimos, aloqani tekshiring va qaytadan urinib ko'ring."
          onAction={() => window.location.reload()}
          actionLabel="Qayta urinish"
        />
      </div>
    );
  }

  // --- RESULT SCREEN ---
  if (isFinished && scoreData) {
    const { score, correctAnswers, wrongAnswers, totalQuestions } = scoreData;
    let performance = "";
    if (score >= 90) performance = "Excellent";
    else if (score >= 75) performance = "Great";
    else if (score >= 50) performance = "Keep practicing";
    else performance = "Needs improvement";

    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 flex items-center justify-center p-4 min-h-screen pt-20"
      >
        <div className="glass-card w-full max-w-2xl text-center p-8 md:p-12 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
          
          <div className="mb-6 flex justify-center relative">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5 }}>
              <CheckCircle2 className="w-24 h-24 text-primary mx-auto mb-4 drop-shadow-[0_0_15px_rgba(59,129,50,0.5)]" />
            </motion.div>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-mono font-bold uppercase mb-2 text-white">Execution Complete</h2>
          <p className="text-primary font-mono text-xl tracking-widest uppercase mb-8">{performance}</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 text-left">
            <div className="bg-background/50 p-4 border border-primary/20">
              <p className="text-xs text-muted-foreground font-mono uppercase mb-1">Score</p>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-3xl font-mono font-bold text-white">
                {Math.round(score)}%
              </motion.p>
            </div>
            <div className="bg-background/50 p-4 border border-primary/20">
              <p className="text-xs text-muted-foreground font-mono uppercase mb-1">Correct</p>
              <p className="text-3xl font-mono font-bold text-green-500">{correctAnswers}</p>
            </div>
            <div className="bg-background/50 p-4 border border-primary/20">
              <p className="text-xs text-muted-foreground font-mono uppercase mb-1">Wrong</p>
              <p className="text-3xl font-mono font-bold text-red-500">{wrongAnswers}</p>
            </div>
            <div className="bg-background/50 p-4 border border-primary/20">
              <p className="text-xs text-muted-foreground font-mono uppercase mb-1">Total</p>
              <p className="text-3xl font-mono font-bold text-white">{totalQuestions}</p>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 justify-center mt-8">
            <Button onClick={() => { resetQuiz(); handleStart(); }} className="flex-1 rounded-none bg-primary text-primary-foreground hover:bg-primary/90 font-mono uppercase tracking-wider h-12 gap-2">
              <RotateCcw size={18} /> Retry Quiz
            </Button>
            <Button onClick={resetQuiz} variant="outline" className="flex-1 rounded-none border-primary/50 text-primary hover:bg-primary/10 font-mono uppercase tracking-wider h-12 gap-2">
              <Terminal size={18} /> New Quiz
            </Button>
            <Button onClick={() => router.push('/dashboard')} variant="outline" className="flex-1 rounded-none border-muted-foreground/30 text-muted-foreground hover:text-white font-mono uppercase tracking-wider h-12 gap-2">
              <Home size={18} /> Dashboard
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  // --- CONFIGURATION SCREEN ---
  if (!isStarted) {
    const counts = [10, 20, 30, 50, 100];
    const diffs = ['easy', 'medium', 'hard', 'mixed'] as const;

    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 flex items-center justify-center p-4 min-h-screen pt-20"
      >
        <div className="glass-card w-full max-w-2xl p-6 md:p-10 relative">
          <div className="absolute top-0 left-0 bg-primary/20 text-primary px-3 py-1 font-mono text-xs flex items-center gap-2">
            <Terminal size={14} /> config.exe
          </div>
          
          <div className="text-center mb-10 mt-4">
            <h1 className="text-3xl md:text-4xl font-mono font-bold uppercase text-white tracking-wider mb-2">CodaScript Quiz</h1>
            <p className="text-muted-foreground font-mono">&gt; Configure your test environment</p>
          </div>

          <div className="space-y-8 mb-10">
            {/* Mode Selection */}
            <div>
              <p className="text-primary font-mono text-sm mb-3 uppercase tracking-widest border-b border-primary/20 pb-2">Select Mode</p>
              <div className="grid grid-cols-2 gap-3">
                <Button variant={mode === 'topic' ? 'default' : 'outline'} onClick={() => setQuizConfig({ mode: 'topic' })} className={`rounded-none font-mono h-12 ${mode === 'topic' ? 'bg-primary text-primary-foreground' : 'border-primary/30 text-muted-foreground hover:border-primary/80 hover:text-primary'}`}>
                  Topic Mode
                </Button>
                <Button variant={mode === 'mixed' ? 'default' : 'outline'} onClick={() => setQuizConfig({ mode: 'mixed' })} className={`rounded-none font-mono h-12 ${mode === 'mixed' ? 'bg-primary text-primary-foreground' : 'border-primary/30 text-muted-foreground hover:border-primary/80 hover:text-primary'}`}>
                  Mixed Mode
                </Button>
              </div>
            </div>

            {/* Topic Selection */}
            <AnimatePresence>
              {mode === 'topic' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                  <p className="text-primary font-mono text-sm mb-3 uppercase tracking-widest border-b border-primary/20 pb-2">Select Topic</p>
                  <div className="flex flex-wrap gap-3">
                    {availableTopics.map(t => (
                      <Button key={t} variant={topic === t ? 'default' : 'outline'} onClick={() => setQuizConfig({ topic: t })} className={`rounded-none font-mono uppercase ${topic === t ? 'bg-primary text-primary-foreground shadow-[0_0_10px_rgba(59,129,50,0.4)]' : 'border-primary/30 text-muted-foreground hover:border-primary/80 hover:text-primary'}`}>
                        {t}
                      </Button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Difficulty */}
            <div>
              <p className="text-primary font-mono text-sm mb-3 uppercase tracking-widest border-b border-primary/20 pb-2">Difficulty</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {diffs.map(d => (
                  <Button key={d} variant={difficulty === d ? 'default' : 'outline'} onClick={() => setQuizConfig({ difficulty: d })} className={`rounded-none font-mono uppercase ${difficulty === d ? 'bg-primary text-primary-foreground' : 'border-primary/30 text-muted-foreground hover:border-primary/80 hover:text-primary'}`}>
                    {d}
                  </Button>
                ))}
              </div>
            </div>

            {/* Question Count */}
            <div>
              <p className="text-primary font-mono text-sm mb-3 uppercase tracking-widest border-b border-primary/20 pb-2">Questions Count</p>
              <div className="flex flex-wrap gap-3">
                {counts.map(c => {
                  const isDisabled = c > availableCount;
                  return (
                    <Button key={c} variant={questionCount === c ? 'default' : 'outline'} onClick={() => setQuizConfig({ questionCount: c })} disabled={isDisabled} className={`rounded-none font-mono w-16 ${questionCount === c ? 'bg-primary text-primary-foreground' : 'border-primary/30 text-muted-foreground hover:border-primary/80 hover:text-primary'} ${isDisabled ? 'opacity-30 cursor-not-allowed' : ''}`}>
                      {c}
                    </Button>
                  );
                })}
                <Button variant={questionCount === 'all' ? 'default' : 'outline'} onClick={() => setQuizConfig({ questionCount: 'all' })} disabled={availableCount === 0} className={`rounded-none font-mono uppercase ${questionCount === 'all' ? 'bg-primary text-primary-foreground' : 'border-primary/30 text-muted-foreground hover:border-primary/80 hover:text-primary'} ${availableCount === 0 ? 'opacity-30' : ''}`}>
                  All ({availableCount})
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-background/50 border border-primary/20 p-4 mb-8 flex justify-between items-center">
            <span className="font-mono text-sm text-muted-foreground uppercase">Available Questions:</span>
            <span className="font-mono text-xl text-primary font-bold">{availableCount}</span>
          </div>

          {startMutation.isError && (
            <div className="mb-4">
              <ErrorCard
                illustrationSrc="/illustrations/error-spilled-coffee.png"
                title="Xatolik"
                subtitle="Testni boshlab bo'lmadi. Iltimos, aloqa yoki ma'lumotlar bazasini tekshiring."
              />
            </div>
          )}

          <Button size="lg" disabled={availableCount === 0 || startMutation.isPending} className="w-full rounded-none bg-primary text-primary-foreground hover:bg-primary/90 font-mono uppercase tracking-widest h-14 text-lg shadow-[0_0_15px_rgba(59,129,50,0.3)] transition-all hover:shadow-[0_0_25px_rgba(59,129,50,0.5)] disabled:opacity-50 disabled:shadow-none" onClick={handleStart}>
            {startMutation.isPending ? 'Connecting...' : availableCount > 0 ? 'Start Quiz →' : 'No questions available'}
          </Button>
        </div>
      </motion.div>
    );
  }

  // --- ACTIVE QUIZ SCREEN ---
  const currentQuestion = questions[currentQuestionIndex];
  const answeredResult = answers[currentQuestion.id];
  const isAnswered = answeredResult !== undefined;
  
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercentage = ((currentQuestionIndex) / questions.length) * 100;

  return (
    <div className="container py-10 px-4 max-w-3xl mx-auto space-y-4 min-h-screen">
      <div className="flex justify-between items-end mb-2">
        <div className="font-mono text-sm">
          <p className="text-muted-foreground uppercase text-xs mb-1">
            {currentQuestion.topic} <span className="text-primary/50 mx-2">|</span> {currentQuestion.difficulty}
          </p>
          <p className="text-white">
            <span className="text-primary">Question</span> {currentQuestionIndex + 1} / {questions.length}
          </p>
        </div>
        <div className="flex items-center gap-2 text-primary font-bold font-mono bg-primary/10 px-3 py-1 border border-primary/30">
          <Clock className="w-4 h-4" />
          {formatTime(timeRemaining)}
        </div>
      </div>

      <div className="w-full h-1 bg-background/50 border border-primary/20 relative">
        <motion.div className="absolute top-0 left-0 h-full bg-primary" initial={{ width: 0 }} animate={{ width: `${progressPercentage}%` }} transition={{ duration: 0.3 }} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={currentQuestion.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="glass-card">
          <div className="p-4 md:p-6 border-b border-primary/20 min-h-[80px] flex items-center">
            <h2 className="text-lg md:text-xl font-mono leading-relaxed text-white">
              <span className="text-primary mr-3 text-xl font-bold">&gt;</span>
              {currentQuestion.question}
            </h2>
          </div>
          
          <div className="p-4 md:p-6 space-y-2.5 bg-background/30">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = answeredResult?.selectedOptionIndex === idx;
              
              let buttonClass = "bg-background border-primary/30 text-muted-foreground hover:border-primary/80 hover:text-white";
              
              if (isAnswered) {
                if (isSelected && answeredResult.isCorrect) {
                  buttonClass = "bg-green-500/20 border-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.2)]";
                } else if (isSelected && !answeredResult.isCorrect) {
                  buttonClass = "bg-red-500/20 border-red-500 text-white";
                } else {
                  buttonClass = "bg-background/50 border-white/5 text-muted-foreground opacity-50";
                }
              }

              return (
                <motion.div whileHover={!isAnswered && !submitMutation.isPending ? { scale: 1.01 } : {}} whileTap={!isAnswered && !submitMutation.isPending ? { scale: 0.99 } : {}} key={idx}>
                  <Button
                    variant="outline"
                    disabled={isAnswered || submitMutation.isPending}
                    className={`w-full justify-start text-left h-auto p-3 md:p-4 whitespace-normal rounded-none font-mono text-sm md:text-base transition-all ${buttonClass}`}
                    onClick={() => handleAnswer(currentQuestion.id, idx, option)}
                  >
                    <div className="flex items-center w-full">
                      <span className="w-8 shrink-0 text-primary opacity-60 font-bold">
                        {String.fromCharCode(65 + idx)}.
                      </span>
                      <span className="flex-1">{option}</span>
                      {isAnswered && isSelected && answeredResult.isCorrect && (
                        <CheckCircle2 className="w-5 h-5 text-green-500 ml-3 shrink-0" />
                      )}
                      {isAnswered && isSelected && !answeredResult.isCorrect && (
                        <XCircle className="w-5 h-5 text-red-500 ml-3 shrink-0" />
                      )}
                    </div>
                  </Button>
                </motion.div>
              );
            })}
          </div>

          <AnimatePresence>
            {showExplanation && answeredResult?.explanation && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="overflow-hidden">
                <div className="p-4 md:p-5 bg-primary/5 border-t border-primary/20 text-sm font-mono text-muted-foreground">
                  <span className="text-primary font-bold uppercase block mb-2">Explanation:</span>
                  {answeredResult.explanation}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-between items-center border-t border-primary/20 p-4 md:p-5 bg-background/50">
            <Button variant="outline" onClick={prevQuestion} disabled={currentQuestionIndex === 0} className="gap-2 rounded-none border-primary/30 text-muted-foreground hover:text-primary hover:bg-primary/10 font-mono uppercase tracking-wider h-10 px-4 md:px-6">
              <ArrowLeft className="w-4 h-4" /> Prev
            </Button>

            {currentQuestionIndex === questions.length - 1 ? (
              <Button onClick={handleCompleteQuiz} disabled={!isAnswered || completeMutation.isPending} className="gap-2 rounded-none bg-primary text-primary-foreground hover:bg-primary/90 font-mono uppercase tracking-wider h-10 px-6 md:px-8 disabled:opacity-50">
                {completeMutation.isPending ? 'Processing...' : 'Finish'} <CheckCircle2 className="w-4 h-4" />
              </Button>
            ) : (
              <Button onClick={handleNext} disabled={!isAnswered} className="gap-2 rounded-none bg-primary text-primary-foreground hover:bg-primary/90 font-mono uppercase tracking-wider h-10 px-6 md:px-8 disabled:opacity-50">
                Next <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
