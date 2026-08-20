import { QuestionDifficulty } from './question';

export type QuizSessionStatus = 'started' | 'completed' | 'abandoned';

export interface QuizAnswer {
  questionId: string;
  selectedOptionId: number;
  isCorrect: boolean;
  answeredAt: Date | string;
}

export interface QuizAttempt {
  _id: string;
  userId: string;
  quizId: string;
  topic: string;
  subtopic?: string;
  difficulty: QuestionDifficulty | 'mixed';
  totalQuestions: number;
  answeredQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  score: number;
  status: QuizSessionStatus;
  answers: QuizAnswer[];
  startedAt: Date | string;
  completedAt?: Date | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}
