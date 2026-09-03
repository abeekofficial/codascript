import { Router, Request, Response, RequestHandler } from 'express';
import { UserModel } from '../models/User';
import { protect, AuthRequest } from '../middlewares/auth';

const router = Router();

// POST /api/users/:id/follow
export const followUser: RequestHandler = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.userId as string;

    if (targetUserId === currentUserId.toString()) {
      res.status(400).json({ success: false, message: 'You cannot follow yourself' });
      return;
    }

    const targetUser = await UserModel.findById(targetUserId);
    const currentUser = await UserModel.findById(currentUserId);

    if (!targetUser || !currentUser) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    if (!currentUser.following) currentUser.following = [];
    if (!targetUser.followers) targetUser.followers = [];

    const followingStrs = currentUser.following.map(id => id.toString());
    
    if (!followingStrs.includes(targetUserId)) {
      currentUser.following.push(targetUser._id as any);
      targetUser.followers.push(currentUser._id as any);
      
      await Promise.all([currentUser.save(), targetUser.save()]);
    }

    res.status(200).json({ success: true, message: 'Successfully followed user' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/users/:id/unfollow
export const unfollowUser: RequestHandler = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.userId as string;

    const targetUser = await UserModel.findById(targetUserId);
    const currentUser = await UserModel.findById(currentUserId);

    if (!targetUser || !currentUser) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    if (!currentUser.following) currentUser.following = [];
    if (!targetUser.followers) targetUser.followers = [];

    currentUser.following = currentUser.following.filter(id => id.toString() !== targetUserId) as any[];
    targetUser.followers = targetUser.followers.filter(id => id.toString() !== currentUserId.toString()) as any[];

    await Promise.all([currentUser.save(), targetUser.save()]);

    res.status(200).json({ success: true, message: 'Successfully unfollowed user' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/users/recommendations
export const getRecommendations: RequestHandler = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const currentUserId = req.userId as string;
    const currentUser = await UserModel.findById(currentUserId);

    if (!currentUser) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const followingIds = currentUser.following ? currentUser.following.map(id => id.toString()) : [];
    
    // Find users not followed and not current user, sorted by totalXP desc
    const recommendations = await UserModel.find({
      _id: { $nin: [...followingIds, currentUserId] }
    })
    .sort({ totalXP: -1 })
    .limit(10)
    .select('-password -resetPasswordToken -resetPasswordExpires');

    res.status(200).json({ success: true, data: recommendations });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/users/:username/followers
export const getFollowers: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username } = req.params;
    const user = await UserModel.findOne({ username }).populate('followers', 'name username avatar level');
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    res.status(200).json({ success: true, data: user.followers });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/users/:username/following
export const getFollowing: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username } = req.params;
    const user = await UserModel.findOne({ username }).populate('following', 'name username avatar level');
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    res.status(200).json({ success: true, data: user.following });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

router.get('/:username/followers', getFollowers);
router.get('/:username/following', getFollowing);

router.get('/recommendations', protect, getRecommendations);
router.post('/:id/follow', protect, followUser);
router.post('/:id/unfollow', protect, unfollowUser);

export default router;
