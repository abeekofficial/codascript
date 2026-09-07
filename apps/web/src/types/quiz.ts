export type TechId = 'html' | 'css' | 'js' | 'ts' | 'react';

export type Difficulty = 'easy' | 'medium' | 'hard';

export type DifficultyFilter = Difficulty | 'all';

export interface Tech {
  id: TechId;
  label: string;
  color: string;
  questionCount: number;
}

export interface Question {
  id: string;
  tech: TechId;
  difficulty: Difficulty;
  prompt: string;
  code?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  status: 'active' | 'draft';
  createdAt: string;
}

export interface QuizConfig {
  tech: TechId;
  subtopic?: string;
  difficulty: DifficultyFilter;
  count: number | 'all';
}

export interface QuizResult {
  correct: number;
  wrong: number;
  skipped: number;
  xp: number;
  total: number;
  durationSec: number;
}
export interface LeaderboardUser {
  _id: string;
  name: string;
  totalXP: number;
  completedQuizzes: number;
}
