import { Response, NextFunction } from 'express';
import { QuizService } from '../services/QuizService';
import { AuthRequest } from '../middlewares/auth';

const quizService = new QuizService();

export class QuizController {
  static async start(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { topic, difficulty, mode, count, subtopic } = req.body;
      const data = await quizService.startQuiz(req.userId!, topic, difficulty, mode, count, subtopic);
      res.status(201).json({ success: true, data });
    } catch (error) { next(error); }
  }

  static async submitAnswer(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { quizId, questionId, selectedOptionIndex, selectedOptionText } = req.body;
      const result = await quizService.submitAnswer(quizId, req.userId!, questionId, selectedOptionIndex, selectedOptionText);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getTestCases(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { quizId, questionId } = req.params;
      const result = await quizService.getTestCases(quizId, req.userId!, questionId);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async complete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { quizId } = req.body;
      const data = await quizService.completeQuiz(quizId, req.userId!);
      res.status(200).json({ success: true, data });
    } catch (error) { next(error); }
  }

  static async getProfileStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await quizService.getProfileStats(req.userId!);
      res.status(200).json({ success: true, data });
    } catch (error) { next(error); }
  }

  static async getGrowthData(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await quizService.getGrowthData(req.userId!);
      res.status(200).json({ success: true, data });
    } catch (error) { next(error); }
  }

  static async getSkillStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await quizService.getSkillStats(req.userId!);
      res.status(200).json({ success: true, data });
    } catch (error) { next(error); }
  }

  static async getHistory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const data = await quizService.getHistory(req.userId!, page, limit);
      res.status(200).json({ success: true, data });
    } catch (error) { next(error); }
  }
}
