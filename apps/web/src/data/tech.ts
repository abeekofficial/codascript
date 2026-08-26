import { Difficulty, DifficultyFilter, Tech, TechId } from '../types/quiz';

export const TECHS: Tech[] = [
{ id: 'html', label: 'HTML', color: '#E44D26', questionCount: 324 },
{ id: 'css', label: 'CSS', color: '#2965F1', questionCount: 396 },
{ id: 'js', label: 'JavaScript', color: '#F0DB4F', questionCount: 842 },
{ id: 'ts', label: 'TypeScript', color: '#3178C6', questionCount: 423 },
{ id: 'react', label: 'React', color: '#61DAFB', questionCount: 514 }];


/** Har bir texnologiya va qiyinlik bo‘yicha mavjud savollar soni. */
export const AVAILABLE: Record<TechId, Record<DifficultyFilter, number>> = {
  html: { easy: 142, medium: 118, hard: 64, all: 324 },
  css: { easy: 158, medium: 146, hard: 92, all: 396 },
  js: { easy: 286, medium: 342, hard: 214, all: 842 },
  ts: { easy: 124, medium: 168, hard: 131, all: 423 },
  react: { easy: 162, medium: 204, hard: 148, all: 514 }
};

export const TECH_MAP: Record<TechId, Tech> = TECHS.reduce(
  (acc, t) => ({ ...acc, [t.id]: t }),
  {} as Record<TechId, Tech>
);

export const DIFFICULTIES: {id: DifficultyFilter;label: string;color: string;}[] = [
{ id: 'easy', label: 'Easy', color: '#10B981' },
{ id: 'medium', label: 'Medium', color: '#FBBF24' },
{ id: 'hard', label: 'Hard', color: '#F87171' },
{ id: 'all', label: 'Barchasi', color: '#60A5FA' }];


export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard'
};

export const QUESTION_COUNTS = [10, 20, 30, 50, 100];