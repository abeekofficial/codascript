import { Request, Response, NextFunction } from 'express';
import { QuestionService } from '../services/QuestionService';
import { NotificationModel } from '../models/Notification';
import { UserModel } from '../models/User';

const questionService = new QuestionService();

export class QuestionController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const q = await questionService.createQuestion(req.body);
      
      const users = await UserModel.find().limit(500).select('_id');
      if (users.length > 0) {
        const notifications = users.map(u => ({
          recipient: u._id,
          type: 'new_official_content',
          title: 'Yangi rasmiy test qo\'shildi!',
          message: `Admin tomonidan yangi test savoli: "${q.question}" qo'shildi.`,
          relatedItemType: 'question',
          relatedItemId: q._id
        }));
        await NotificationModel.insertMany(notifications);
      }

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
      const data = await questionService.getTopics();
      res.status(200).json({ success: true, data });
    } catch (error) { next(error); }
  }

  static async getSubtopics(req: Request, res: Response, next: NextFunction) {
    try {
      const { topic } = req.query;
      if (!topic) throw { statusCode: 400, message: 'Topic is required' };
      const data = await questionService.getSubtopics(topic as string);
      res.status(200).json({ success: true, data });
    } catch (error) { next(error); }
  }

  static async getCount(req: Request, res: Response, next: NextFunction) {
    try {
      const { topic, difficulty, mode, subtopic } = req.query;
      const count = await questionService.getCount(
        topic as string || '', 
        difficulty as string || 'mixed', 
        (mode as 'topic' | 'mixed') || 'topic',
        subtopic as string
      );
      res.status(200).json({ success: true, data: count });
    } catch (error) { next(error); }
  }

  static async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await questionService.getQuestionStats();
      res.status(200).json({ success: true, data: stats });
    } catch (error) { next(error); }
  }

  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const qs = await questionService.getAll();
      res.status(200).json({ success: true, data: qs });
    } catch (error) { next(error); }
  }
}
