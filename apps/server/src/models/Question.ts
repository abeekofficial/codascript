import mongoose, { Schema } from 'mongoose';
import { Question } from '@codascript/types';

const questionSchema = new Schema<Question>({
  topic: { type: String, required: true },
  subtopic: { type: String },
  difficulty: { type: String, required: true },
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctOptionId: { type: Number, required: true },
  explanation: { type: String },
  code: { type: String },
  tags: [{ type: String }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Create compound index to optimize queries
questionSchema.index({ topic: 1, difficulty: 1, isActive: 1 });
questionSchema.index({ topic: 1, subtopic: 1, difficulty: 1, isActive: 1 });
// For duplicate detection:
questionSchema.index({ topic: 1, question: 1 }, { unique: true });

export const QuestionModel = mongoose.model<Question>('Question', questionSchema);
