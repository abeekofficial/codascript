import mongoose, { Schema } from 'mongoose';
import { QuizAttempt } from '@codascript/types';

const quizAttemptSchema = new Schema<QuizAttempt>({
  userId: { type: String, required: true },
  quizId: { type: String, required: true, unique: true },
  topic: { type: String, required: true },
  subtopic: { type: String },
  difficulty: { type: String, required: true },
  totalQuestions: { type: Number, required: true },
  answeredQuestions: { type: Number, default: 0 },
  correctAnswers: { type: Number, default: 0 },
  wrongAnswers: { type: Number, default: 0 },
  score: { type: Number, default: 0 },
  status: { type: String, enum: ['started', 'completed', 'abandoned'], default: 'started' },
  answers: [{
    questionId: { type: String, required: true },
    selectedOptionId: { type: Number, required: true },
    isCorrect: { type: Boolean, required: true },
    answeredAt: { type: Date, default: Date.now }
  }],
  startedAt: { type: Date, default: Date.now },
  completedAt: { type: Date }
}, { timestamps: true });

// Create indexes
quizAttemptSchema.index({ userId: 1, status: 1 });
quizAttemptSchema.index({ quizId: 1 });

export const QuizAttemptModel = mongoose.model<QuizAttempt>('QuizAttempt', quizAttemptSchema);
