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

  static async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return res.status(400).json({ success: false, message: 'Refresh token is required' });
      }
      const tokens = await userService.refreshToken(refreshToken);
      res.status(200).json({ success: true, data: tokens });
    } catch (error) {
      next(error);
    }
  }

  static async oauthLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, name, provider, avatar } = req.body;
      if (!email || !name || !provider) {
        return res.status(400).json({ success: false, message: 'Email, name, and provider are required' });
      }
      const tokens = await userService.oauthLogin({ email, name, provider, avatar });
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

  static async deleteAccount(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await userService.deleteAccount(req.userId!);
      res.status(200).json({ success: true, message: 'Account deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  static async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      const origin = req.headers.origin || 'http://localhost:3000';
      const result = await userService.forgotPassword(email, origin);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, newPassword } = req.body;
      const result = await userService.resetPassword(token, newPassword);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}
