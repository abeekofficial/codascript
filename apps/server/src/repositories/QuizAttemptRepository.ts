import { QuizAttemptModel } from '../models/QuizAttempt';
import { QuizAttempt } from '@codascript/types';

export class QuizAttemptRepository {
  async create(data: Partial<QuizAttempt>): Promise<QuizAttempt> {
    const session = new QuizAttemptModel(data);
    return session.save();
  }

  async findByQuizId(quizId: string): Promise<QuizAttempt | null> {
    return QuizAttemptModel.findOne({ quizId }).lean();
  }

  async updateByQuizId(quizId: string, data: Partial<QuizAttempt>): Promise<QuizAttempt | null> {
    return QuizAttemptModel.findOneAndUpdate({ quizId }, data, { new: true }).lean();
  }
}
