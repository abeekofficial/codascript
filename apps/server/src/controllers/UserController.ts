import { Request, Response, NextFunction } from 'express';
import { UserModel } from '../models/User';
import { AuthRequest } from '../middlewares/auth';

export class UserController {
  static async getPublicProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { username } = req.params;
      
      const user = await UserModel.findOne({ username })
        .select('-password -email -resetPasswordToken -resetPasswordExpires -oauthProvider -updatedAt -__v')
        .lean();

      if (!user) {
        return res.status(404).json({ success: false, message: 'Foydalanuvchi topilmadi' });
      }

      const followersCount = user.followers ? user.followers.length : 0;
      const followingCount = user.following ? user.following.length : 0;
      
      let isFollowedByMe = false;
      if (req.userId && user.followers) {
        isFollowedByMe = user.followers.map((id: any) => id.toString()).includes(req.userId);
      }

      res.status(200).json({ 
        success: true, 
        data: { 
          ...user, 
          followersCount, 
          followingCount, 
          isFollowedByMe 
        } 
      });
    } catch (error) {
      next(error);
    }
  }
}
