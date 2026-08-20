export type QuestionDifficulty = 'easy' | 'medium' | 'hard' | 'mixed';

export interface Question {
  _id: string;
  topic: string;
  subtopic?: string;
  difficulty: QuestionDifficulty;
  question: string;
  options: string[];
  correctOptionId: number;
  explanation?: string;
  code?: string;
  tags?: string[];
  isActive: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface ClientQuestion extends Omit<Question, 'correctOptionId'> {
  // correctOptionId omitted for the frontend
}
