import { create } from "zustand";

export interface ClientQuestion {
  id: string;
  topic: string;
  subtopic?: string;
  difficulty: "easy" | "medium" | "hard" | "mixed";
  question: string;
  options: string[];
  type?: 'multiple_choice' | 'code';
  language?: string;
  starterCode?: string;
  testCases?: { input: string; expectedOutput: string; isHidden?: boolean }[];
}

export interface AnswerResult {
  isCorrect: boolean;
  explanation?: string;
  selectedOptionIndex: number;
  correctAnswerText?: string;
}

interface QuizState {
  quizId: string | null;
  questions: ClientQuestion[];
  currentQuestionIndex: number;
  answers: Record<string, AnswerResult>;
  timeRemaining: number;
  isStarted: boolean;
  isFinished: boolean;
  topic: string;
  subtopic?: string;
  difficulty: "easy" | "medium" | "hard" | "mixed";
  mode: "topic" | "mixed";
  questionCount: number | "all";
  setQuizConfig: (config: {
    topic?: string;
    subtopic?: string;
    difficulty?: "easy" | "medium" | "hard" | "mixed";
    mode?: "topic" | "mixed";
    questionCount?: number | "all";
  }) => void;
  startQuiz: (quizId: string, questions: ClientQuestion[], initialTime: number) => void;
  answerQuestion: (questionId: string, result: AnswerResult) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  finishQuiz: () => void;
  decrementTime: () => void;
  resetQuiz: () => void;
}

export const useQuizStore = create<QuizState>((set) => ({
  quizId: null,
  questions: [],
  currentQuestionIndex: 0,
  answers: {},
  timeRemaining: 0,
  isStarted: false,
  isFinished: false,
  topic: "",
  difficulty: "mixed",
  mode: "topic",
  questionCount: 10,
  setQuizConfig: (config) => set((state) => ({ ...state, ...config })),
  startQuiz: (quizId, questions, initialTime) =>
    set({
      quizId,
      questions,
      isStarted: true,
      timeRemaining: initialTime,
      currentQuestionIndex: 0,
      answers: {},
      isFinished: false,
    }),
  answerQuestion: (questionId, result) =>
    set((state) => ({
      answers: { ...state.answers, [questionId]: result },
    })),
  nextQuestion: () =>
    set((state) => ({
      currentQuestionIndex: Math.min(
        state.currentQuestionIndex + 1,
        state.questions.length - 1,
      ),
    })),
  prevQuestion: () =>
    set((state) => ({
      currentQuestionIndex: Math.max(state.currentQuestionIndex - 1, 0),
    })),
  finishQuiz: () => set({ isFinished: true, isStarted: false }),
  decrementTime: () =>
    set((state) => {
      if (state.timeRemaining <= 1) {
        return { timeRemaining: 0, isFinished: true, isStarted: false };
      }
      return { timeRemaining: state.timeRemaining - 1 };
    }),
  resetQuiz: () =>
    set({
      quizId: null,
      questions: [],
      currentQuestionIndex: 0,
      answers: {},
      timeRemaining: 0,
      isStarted: false,
      isFinished: false,
    }),
}));
