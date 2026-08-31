import { Request, Response, NextFunction } from 'express';
import { SavedItemModel } from '../models/SavedItem';
import { AuthRequest } from '../middlewares/auth';

export class SavedController {
  static async saveItem(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { itemType, itemId } = req.body;
      const userId = req.userId;

      if (!['question', 'problem'].includes(itemType)) {
        res.status(400).json({ success: false, message: 'Yaroqsiz itemType' });
        return;
      }

      const existing = await SavedItemModel.findOne({ user: userId, itemType, itemId });
      if (existing) {
        // Idempotent: agar saqlangan bo'lsa xato bermaymiz
        res.status(200).json({ success: true, message: 'Allaqachon saqlangan', data: existing });
        return;
      }

      const savedItem = await SavedItemModel.create({
        user: userId,
        itemType,
        itemId
      });

      res.status(201).json({ success: true, data: savedItem });
    } catch (error) {
      next(error);
    }
  }

  static async unsaveItem(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { itemType, itemId } = req.params;
      const userId = req.userId;

      await SavedItemModel.findOneAndDelete({ user: userId, itemType, itemId });
      
      res.status(200).json({ success: true, message: 'Olib tashlandi' });
    } catch (error) {
      next(error);
    }
  }

  static async getSavedItems(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId;
      const { type } = req.query;

      const query: any = { user: userId };
      if (type && ['question', 'problem'].includes(type as string)) {
        query.itemType = type;
      }

      // Population using dynamic refPath
      const items = await SavedItemModel.find(query)
        .populate('itemId')
        .sort({ createdAt: -1 });

      res.status(200).json({ success: true, data: items });
    } catch (error) {
      next(error);
    }
  }

  static async checkSaved(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId;
      const { itemType, itemId } = req.query;

      if (!itemType || !itemId) {
        res.status(400).json({ success: false, message: 'itemType and itemId required' });
        return;
      }

      const existing = await SavedItemModel.findOne({ user: userId, itemType, itemId });
      
      res.status(200).json({ success: true, data: { isSaved: !!existing } });
    } catch (error) {
      next(error);
    }
  }
}
