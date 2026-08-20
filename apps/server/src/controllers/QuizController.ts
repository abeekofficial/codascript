import { Response, NextFunction } from 'express';
import { QuizService } from '../services/QuizService';
import { AuthRequest } from '../middlewares/auth';

const quizService = new QuizService();

export class QuizController {
  static async start(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { topic, difficulty, mode, count } = req.body;
      const data = await quizService.startQuiz(req.userId!, topic, difficulty, mode, count);
      res.status(201).json({ success: true, data });
    } catch (error) { next(error); }
  }

  static async submitAnswer(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { quizId, questionId, selectedOptionIndex, selectedOptionText } = req.body;
      const data = await quizService.submitAnswer(quizId, req.userId!, questionId, selectedOptionIndex, selectedOptionText);
      res.status(200).json({ success: true, data });
    } catch (error) { next(error); }
  }

  static async complete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { quizId } = req.body;
      const data = await quizService.completeQuiz(quizId, req.userId!);
      res.status(200).json({ success: true, data });
    } catch (error) { next(error); }
  }
}
