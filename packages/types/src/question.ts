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
  type?: 'multiple_choice' | 'code';
  language?: string;
  starterCode?: string;
  testCases?: { input: string; expectedOutput: string; isHidden?: boolean }[];
  tags?: string[];
  isActive: boolean;
  genericId?: string;
  author?: string;
  status?: 'pending' | 'approved' | 'rejected';
  upvotes?: string[];
  downvotes?: string[];
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface ClientQuestion extends Omit<Question, 'correctOptionId'> {
  // correctOptionId omitted for the frontend
}
