import { Request, Response, NextFunction } from 'express';
import { NotificationModel } from '../models/Notification';
import { AuthRequest } from '../middlewares/auth';

export class NotificationController {
  static async getNotifications(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = 20;

      const notifications = await NotificationModel.find({ recipient: userId })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      res.status(200).json({ success: true, data: notifications });
    } catch (error) {
      next(error);
    }
  }

  static async getUnreadCount(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId;
      const count = await NotificationModel.countDocuments({ recipient: userId, isRead: false });
      res.status(200).json({ success: true, data: count });
    } catch (error) {
      next(error);
    }
  }

  static async markAsRead(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.userId;

      await NotificationModel.findOneAndUpdate(
        { _id: id, recipient: userId },
        { isRead: true }
      );

      res.status(200).json({ success: true, message: "O'qilgan deb belgilandi" });
    } catch (error) {
      next(error);
    }
  }

  static async markAllAsRead(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId;

      await NotificationModel.updateMany(
        { recipient: userId, isRead: false },
        { isRead: true }
      );

      res.status(200).json({ success: true, message: "Barchasi o'qilgan deb belgilandi" });
    } catch (error) {
      next(error);
    }
  }
}
