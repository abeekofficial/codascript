export type ProblemDifficulty = 'easy' | 'medium' | 'hard';

export interface ProblemExample {
  input: string;
  output: string;
  explanation?: string;
}

export interface ProblemTestCase {
  input: string;
  expectedOutput: string;
  isHidden: boolean;
}

export interface ClientProblemTestCase {
  input: string;
  expectedOutput?: string;
  isHidden: boolean;
}

export interface Problem {
  id: string;
  slug: string;
  title: string;
  difficulty: ProblemDifficulty;
  topic: string;
  description: string;
  constraints?: string[];
  examples: ProblemExample[];
  starterCode: Record<string, string>;
  testCases: ProblemTestCase[];
  tags?: string[];
  isActive: boolean;
  genericId?: string;
  author?: string;
  status?: 'pending' | 'approved' | 'rejected';
  upvotes?: string[];
  downvotes?: string[];
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface ClientProblem extends Omit<Problem, 'testCases'> {
  testCases: ClientProblemTestCase[];
}

export interface ProblemAttempt {
  id?: string;
  userId: string;
  problemId: string;
  code: string;
  language: string;
  status: 'accepted' | 'wrong_answer' | 'runtime_error' | 'time_limit_exceeded';
  score: number;
  executionTimeMs?: number;
  createdAt?: string | Date;
}

export interface TestCaseResult {
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
  executionTimeMs: number;
}

export interface RunResult {
  success: boolean;
  data: {
    problemId: string;
    status:
      | 'accepted'
      | 'wrong_answer'
      | 'runtime_error'
      | 'time_limit_exceeded'
      | 'no_test_cases';
    passedTests: number;
    totalTests: number;
    results: TestCaseResult[];
    score: number;
  };
}
