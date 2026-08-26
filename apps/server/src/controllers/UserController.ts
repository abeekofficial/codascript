import { Request, Response, NextFunction } from 'express';
import { UserModel } from '../models/User';

export class UserController {
  static async getPublicProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const { username } = req.params;
      
      const user = await UserModel.findOne({ username })
        .select('-password -email -resetPasswordToken -resetPasswordExpires -oauthProvider -updatedAt -__v')
        .lean();

      if (!user) {
        return res.status(404).json({ success: false, message: 'Foydalanuvchi topilmadi' });
      }

      res.status(200).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }
}
