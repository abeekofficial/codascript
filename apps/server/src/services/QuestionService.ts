import { QuestionRepository } from '../repositories/QuestionRepository';
import { Question } from '@codascript/types';

export class QuestionService {
  private repo = new QuestionRepository();

  async createQuestion(data: Partial<Question>) {
    return this.repo.create(data);
  }

  async createBulk(data: Partial<Question>[]) {
    // Assuming repo has createBulk or we use create in a loop/bulkInsert
    return this.repo.createBulk(data);
  }

  async updateQuestion(id: string, data: Partial<Question>) {
    const q = await this.repo.update(id, data);
    if (!q) throw { statusCode: 404, message: 'Question not found' };
    return q;
  }

  async getQuestion(id: string) {
    const q = await this.repo.findById(id);
    if (!q) throw { statusCode: 404, message: 'Question not found' };
    return q;
  }

  async deleteQuestion(id: string) {
    await this.repo.delete(id);
  }

  async getTopics() {
    return this.repo.getTopics();
  }

  async getSubtopics(topic: string) {
    return this.repo.getSubtopics(topic);
  }

  async getCount(topic: string, difficulty: string, mode: 'topic' | 'mixed', subtopic?: string) {
    return this.repo.getCount(topic, difficulty, mode, subtopic);
  }

  async getAll() {
    return this.repo.findByTopicAndDifficulty('', 'mixed', 'mixed', 'all');
  }

  async getQuestionStats() {
    const { QuizAttemptModel } = require('../models/QuizAttempt');
    
    // Aggregation pipeline to calculate stats for each question
    const stats = await QuizAttemptModel.aggregate([
      { $match: { status: 'completed' } },
      { $unwind: '$answers' },
      {
        $group: {
          _id: '$answers.questionId',
          totalViews: { $sum: 1 },
          correctCount: { $sum: { $cond: [{ $eq: ['$answers.isCorrect', true] }, 1, 0] } }
        }
      },
      {
        $project: {
          questionId: '$_id',
          totalViews: 1,
          correctCount: 1,
          accuracy: {
            $round: [
              { $multiply: [{ $divide: ['$correctCount', '$totalViews'] }, 100] },
              0
            ]
          }
        }
      }
    ]);

    return stats;
  }
}
