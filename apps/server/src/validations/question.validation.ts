import { z } from 'zod';

const testCaseSchema = z.object({
  input: z.string(),
  expectedOutput: z.string(),
  isHidden: z.boolean().optional(),
});

const baseQuestionFields = {
  topic: z.string(),
  subtopic: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  question: z.string().min(1, 'Savol matni kerak'),
  type: z.enum(['multiple_choice', 'code']).default('multiple_choice'),
  code: z.string().optional(),
  tags: z.array(z.string()).optional(),

  // Multiple-choice uchun — faqat shu tur bo'lsa majburiy
  options: z.array(z.string()).optional(),
  correctOptionId: z.number().int().min(0).optional(),
  explanation: z.string().optional(),

  // Code turi uchun — faqat shu tur bo'lsa majburiy
  language: z.string().optional(),
  starterCode: z.string().optional(),
  testCases: z.array(testCaseSchema).optional(),
};

// Tur bo'yicha shartli tekshiruv: multiple_choice bo'lsa options/correctOptionId
// majburiy, code bo'lsa starterCode/testCases majburiy.
const refineByType = (data: any, ctx: z.RefinementCtx) => {
  if (data.type === 'multiple_choice' || !data.type) {
    if (!data.options || data.options.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Kamida 2 ta variant kerak',
        path: ['options'],
      });
    }
    if (data.correctOptionId === undefined || data.correctOptionId === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "To'g'ri javob tanlanishi shart",
        path: ['correctOptionId'],
      });
    }
  }
  if (data.type === 'code') {
    if (!data.starterCode) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Starter code kerak',
        path: ['starterCode'],
      });
    }
    if (!data.testCases || data.testCases.length < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Kamida 1 ta test case kerak',
        path: ['testCases'],
      });
    }
  }
};

export const createQuestionSchema = z.object({
  body: z.object(baseQuestionFields).superRefine(refineByType),
});

export const updateQuestionSchema = z.object({
  body: z.object(
    Object.fromEntries(
      Object.entries(baseQuestionFields).map(([k, v]) => [
        k,
        (v as any).optional(),
      ])
    )
  ),
});

export const createBulkQuestionSchema = z.object({
  body: z.array(z.object(baseQuestionFields).superRefine(refineByType)),
});
