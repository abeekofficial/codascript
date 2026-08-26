import mongoose, { Schema } from 'mongoose';
import { Question } from '@codascript/types';

const questionSchema = new Schema<Question>({
  topic: { type: String, required: true },
  subtopic: { type: String },
  difficulty: { type: String, required: true },
  question: { type: String, required: true },
  options: [{ type: String }],
  correctOptionId: { type: Number },
  explanation: { type: String },
  code: { type: String },
  type: { type: String, enum: ['multiple_choice', 'code'], default: 'multiple_choice' },
  language: { type: String },
  starterCode: { type: String },
  testCases: [{
    input: { type: String },
    expectedOutput: { type: String },
    isHidden: { type: Boolean, default: false }
  }],
  tags: [{ type: String }],
  isActive: { type: Boolean, default: true },
  genericId: { type: String, unique: true, sparse: true, index: true },
  author: { type: Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' },
  upvotes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  downvotes: [{ type: Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

// Create compound index to optimize queries
questionSchema.index({ topic: 1, difficulty: 1, isActive: 1 });
questionSchema.index({ topic: 1, subtopic: 1, difficulty: 1, isActive: 1 });
// For duplicate detection:
questionSchema.index({ topic: 1, question: 1 }, { unique: true });

export const QuestionModel = mongoose.model<Question>('Question', questionSchema);
