import { Request, Response, NextFunction } from 'express';
import { QuestionService } from '../services/QuestionService';

const questionService = new QuestionService();

export class QuestionController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const q = await questionService.createQuestion(req.body);
      res.status(201).json({ success: true, data: q });
    } catch (error) { next(error); }
  }

  static async createBulk(req: Request, res: Response, next: NextFunction) {
    try {
      const q = await questionService.createBulk(req.body);
      res.status(201).json({ success: true, data: q });
    } catch (error) { next(error); }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const q = await questionService.updateQuestion(req.params.id, req.body);
      res.status(200).json({ success: true, data: q });
    } catch (error) { next(error); }
  }

  static async get(req: Request, res: Response, next: NextFunction) {
    try {
      const q = await questionService.getQuestion(req.params.id);
      res.status(200).json({ success: true, data: q });
    } catch (error) { next(error); }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await questionService.deleteQuestion(req.params.id);
      res.status(200).json({ success: true, message: 'Deleted' });
    } catch (error) { next(error); }
  }

  static async getTopics(req: Request, res: Response, next: NextFunction) {
    try {
      const topics = await questionService.getTopics();
      res.status(200).json({ success: true, data: topics });
    } catch (error) { next(error); }
  }

  static async getCount(req: Request, res: Response, next: NextFunction) {
    try {
      const { topic, difficulty, mode } = req.query;
      const count = await questionService.getCount(
        topic as string || '', 
        difficulty as string || 'mixed', 
        (mode as 'topic' | 'mixed') || 'topic'
      );
      res.status(200).json({ success: true, data: count });
    } catch (error) { next(error); }
  }
}
