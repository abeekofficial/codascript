'use client';

import React, { createContext, useContext, useMemo, useState } from 'react';
import { QuizConfig, QuizResult } from '../types/quiz';

interface QuizContextValue {
  config: QuizConfig;
  setConfig: (config: QuizConfig) => void;
  result: QuizResult | null;
  setResult: (result: QuizResult) => void;
}

const defaultConfig: QuizConfig = {
  tech: 'js',
  subtopic: 'Barchasi',
  difficulty: 'all',
  count: 10,
};

const QuizContext = createContext<QuizContextValue | null>(null);

export function QuizProvider({ children }: {children: React.ReactNode;}) {
  const [config, setConfig] = useState<QuizConfig>(defaultConfig);
  const [result, setResult] = useState<QuizResult | null>(null);

  const value = useMemo(() => ({ config, setConfig, result, setResult }), [config, result]);

  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
}

export function useQuiz(): QuizContextValue {
  const ctx = useContext(QuizContext);
  if (!ctx) throw new Error('useQuiz QuizProvider ichida ishlatilishi kerak');
  return ctx;
}
