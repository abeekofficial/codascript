import { QuizAttemptModel } from '../models/QuizAttempt';
import { QuizAttempt, QuizAnswer } from '@codascript/types';

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

  /**
   * Atomik: Javob qo'shish va hisoblagichlarni yangilash.
   * $push va $inc operatorlari orqali race condition'lardan himoya qiladi.
   */
  async pushAnswer(quizId: string, answer: QuizAnswer, isCorrect: boolean): Promise<QuizAttempt | null> {
    return QuizAttemptModel.findOneAndUpdate(
      { quizId },
      {
        $push: { answers: answer },
        $inc: {
          answeredQuestions: 1,
          correctAnswers: isCorrect ? 1 : 0,
          wrongAnswers: isCorrect ? 0 : 1
        }
      },
      { new: true }
    ).lean();
  }

  /**
   * Atomik: Quizni yakunlash — faqat status, completedAt, score ni yangilaydi.
   */
  async completeAttempt(quizId: string, score: number): Promise<QuizAttempt | null> {
    return QuizAttemptModel.findOneAndUpdate(
      { quizId },
      {
        $set: {
          status: 'completed',
          completedAt: new Date(),
          score
        }
      },
      { new: true }
    ).lean();
  }

  /**
   * Foydalanuvchining barcha QuizAttempt larini qaytaradi (pagination bilan).
   */
  async findByUserId(userId: string, status?: string, page = 1, limit = 20): Promise<{ attempts: QuizAttempt[]; total: number }> {
    const query: any = { userId };
    if (status) query.status = status;

    const [attempts, total] = await Promise.all([
      QuizAttemptModel.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      QuizAttemptModel.countDocuments(query)
    ]);

    return { attempts: attempts as QuizAttempt[], total };
  }
}
