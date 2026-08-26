import mongoose, { Schema, Document } from 'mongoose';
import { ProblemDifficulty, ProblemExample, ProblemTestCase } from '@codascript/types';

export interface IProblem extends Document {
  slug: string;
  title: string;
  difficulty: ProblemDifficulty;
  topic: string;
  description: string;
  constraints?: string[];
  examples: ProblemExample[];
  starterCode: Map<string, string>;
  testCases: ProblemTestCase[];
  tags?: string[];
  isActive: boolean;
  genericId?: string;
  author?: mongoose.Types.ObjectId;
  status?: 'pending' | 'approved' | 'rejected';
  upvotes?: mongoose.Types.ObjectId[];
  downvotes?: mongoose.Types.ObjectId[];
}

const ProblemExampleSchema = new Schema({
  input: { type: String, required: true },
  output: { type: String, required: true },
  explanation: { type: String }
}, { _id: false });

const ProblemTestCaseSchema = new Schema({
  input: { type: String, required: true },
  expectedOutput: { type: String, required: true },
  isHidden: { type: Boolean, required: true, default: false }
}, { _id: false });

const ProblemSchema = new Schema<IProblem>({
  slug: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true },
  difficulty: { type: String, required: true, enum: ['easy', 'medium', 'hard'] },
  topic: { type: String, required: true, index: true },
  description: { type: String, required: true },
  constraints: [{ type: String }],
  examples: [ProblemExampleSchema],
  starterCode: {
    type: Map,
    of: String,
    required: true,
  },
  testCases: [ProblemTestCaseSchema],
  tags: [{ type: String, index: true }],
  isActive: { type: Boolean, default: true, index: true },
  genericId: { type: String, unique: true, sparse: true, index: true },
  author: { type: Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' },
  upvotes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  downvotes: [{ type: Schema.Types.ObjectId, ref: 'User' }]
}, {
  timestamps: true,
  toJSON: {
    transform: (_, ret: any) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    }
  }
});

export const Problem = mongoose.model<IProblem>('Problem', ProblemSchema);
