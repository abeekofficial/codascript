import { QuestionModel } from '../models/Question';
import { Question } from '@codascript/types';

export class QuestionRepository {
  async create(data: Partial<Question>): Promise<Question> {
    const q = new QuestionModel(data);
    return q.save();
  }

  async findById(id: string): Promise<Question | null> {
    return QuestionModel.findById(id).lean();
  }

  async update(id: string, data: Partial<Question>): Promise<Question | null> {
    return QuestionModel.findByIdAndUpdate(id, data, { new: true }).lean();
  }

  async delete(id: string): Promise<void> {
    await QuestionModel.findByIdAndDelete(id);
  }

  async findByTopicAndDifficulty(
    topic: string, 
    difficulty: string, 
    mode: 'topic' | 'mixed', 
    limit: number | 'all'
  ): Promise<Question[]> {
    const query: any = { isActive: true };
    if (mode === 'topic' && topic) {
      query.topic = { $regex: new RegExp('^' + topic + '$', 'i') };
    }
    if (difficulty !== 'mixed') {
      query.difficulty = difficulty;
    }

    // Using aggregation to randomize directly in DB
    const pipeline: any[] = [{ $match: query }, { $sample: { size: limit === 'all' ? 10000 : limit } }];
    return QuestionModel.aggregate(pipeline);
  }

  async getTopics(): Promise<string[]> {
    return QuestionModel.distinct('topic', { isActive: true });
  }

  async getCount(topic: string, difficulty: string, mode: 'topic' | 'mixed'): Promise<number> {
    const query: any = { isActive: true };
    if (mode === 'topic' && topic) {
      query.topic = { $regex: new RegExp('^' + topic + '$', 'i') };
    }
    if (difficulty !== 'mixed') {
      query.difficulty = difficulty;
    }
    return QuestionModel.countDocuments(query);
  }
}
