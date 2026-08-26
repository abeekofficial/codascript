import { z } from 'zod';

export const startQuizSchema = z.object({
  body: z.object({
    topic: z.string(),
    difficulty: z.enum(['mixed', 'beginner', 'intermediate', 'advanced']).optional().default('mixed'),
    mode: z.enum(['topic', 'mixed']).optional().default('topic'),
    count: z.number().int().min(1).max(50).optional().default(10),
    subtopic: z.string().optional()
  })
});

export const submitAnswerSchema = z.object({
  body: z.object({
    quizId: z.string(),
    questionId: z.string(),
    selectedOptionIndex: z.number().int(),
    selectedOptionText: z.string().optional()
  })
});

export const completeQuizSchema = z.object({
  body: z.object({
    quizId: z.string()
  })
});
