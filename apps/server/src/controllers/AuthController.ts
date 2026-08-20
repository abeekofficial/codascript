import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/UserService';
import { AuthRequest } from '../middlewares/auth';

const userService = new UserService();

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const tokens = await userService.register(req.body);
      res.status(201).json({ success: true, data: tokens });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const tokens = await userService.login(req.body);
      res.status(200).json({ success: true, data: tokens });
    } catch (error) {
      next(error);
    }
  }
  
  static async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const profile = await userService.getProfile(req.userId!);
      res.status(200).json({ success: true, data: profile });
    } catch (error) {
      next(error);
    }
  }

  static async getLeaderboard(req: Request, res: Response, next: NextFunction) {
    try {
      const leaderboard = await userService.getLeaderboard();
      res.status(200).json({ success: true, data: leaderboard });
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const profile = await userService.updateProfile(req.userId!, req.body);
      res.status(200).json({ success: true, data: profile });
    } catch (error) {
      next(error);
    }
  }

  static async changePassword(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await userService.changePassword(req.userId!, req.body);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}
