import { Router, Request, Response } from 'express';
import { protect, admin } from '../middlewares/auth';
import { UserModel } from '../models/User';
import { Problem } from '../models/Problem';
import { QuestionModel } from '../models/Question';
import { QuizAttemptModel } from '../models/QuizAttempt';

const router = Router();

router.use(protect, admin);

router.get('/users', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const role = req.query.role as string;

    const query: any = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role && (role === 'admin' || role === 'user')) {
      query.role = role;
    }

    const skip = (page - 1) * limit;
    
    const users = await UserModel.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
      
    const total = await UserModel.countDocuments(query);
    
    // Calculate isOnline for each user (lastSeenAt within last 5 minutes)
    const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    // Get submissions for each user
    const usersWithStats = await Promise.all(users.map(async u => {
      const isOnline = u.lastSeenAt ? new Date(u.lastSeenAt) > fiveMinsAgo : false;
      const uid = u._id.toString();
      
      const p = await Problem.find({ author: uid }).select('status').lean();
      const q = await QuestionModel.find({ author: uid }).select('status').lean();
      
      const combined = [...p, ...q];
      const stats = {
        total: combined.length,
        approved: combined.filter(c => c.status === 'approved').length,
        rejected: combined.filter(c => c.status === 'rejected').length
      };

      return { ...u.toObject(), isOnline, stats };
    }));

    res.status(200).json({
      success: true,
      data: {
        users: usersWithStats,
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.patch('/users/:id/ban', async (req: Request, res: Response) => {
  try {
    const user = await UserModel.findByIdAndUpdate(req.params.id, { isBanned: true }, { new: true }).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Foydalanuvchi topilmadi' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.patch('/users/:id/unban', async (req: Request, res: Response) => {
  try {
    const user = await UserModel.findByIdAndUpdate(req.params.id, { isBanned: false }, { new: true }).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Foydalanuvchi topilmadi' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.patch('/users/:id/role', async (req: Request, res: Response) => {
  try {
    const { role } = req.body;
    // Don't allow an admin to demote themselves
    if ((req as any).userId === req.params.id && role === 'user') {
      return res.status(400).json({ success: false, message: "O'z-o'zini adminlikdan olish taqiqlanadi." });
    }
    
    if (role !== 'admin' && role !== 'user') {
      return res.status(400).json({ success: false, message: "Noto'g'ri rol" });
    }

    const user = await UserModel.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Foydalanuvchi topilmadi' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/stats/online-count', async (req: Request, res: Response) => {
  try {
    const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);
    const count = await UserModel.countDocuments({ lastSeenAt: { $gte: fiveMinsAgo } });
    res.status(200).json({ success: true, data: { onlineCount: count } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/stats/overview', async (req: Request, res: Response) => {
  try {
    const totalUsers = await UserModel.countDocuments();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newUsersToday = await UserModel.countDocuments({ createdAt: { $gte: today } });
    
    const totalQuizzes = await QuizAttemptModel.countDocuments({ status: 'completed' });
    const totalProblems = await Problem.countDocuments({ isActive: true });

    res.status(200).json({ 
      success: true, 
      data: {
        totalUsers,
        newUsersToday,
        totalQuizzes,
        totalProblems
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/community/pending', async (req: Request, res: Response) => {
  try {
    const problems = await Problem.find({ status: 'pending' }).populate('author', 'name username').lean();
    const questions = await QuestionModel.find({ status: 'pending' }).populate('author', 'name username').lean();
    
    const combined = [
      ...problems.map(p => ({ ...p, itemType: 'problem' })),
      ...questions.map(q => ({ ...q, itemType: 'question' }))
    ].sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()); // oldest first

    res.status(200).json({ success: true, data: combined });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.patch('/community/:type/:id/force-approve', async (req: Request, res: Response) => {
  try {
    const { type, id } = req.params;
    const Model: any = type === 'problem' ? Problem : QuestionModel;
    const item = await Model.findById(id);
    
    if (!item) return res.status(404).json({ success: false, message: 'Topilmadi' });
    
    item.status = 'approved';
    item.isActive = true;
    await item.save();

    const { NotificationModel } = require('../models/Notification');
    await NotificationModel.create({
      recipient: item.author,
      type: 'content_approved',
      title: 'Taklifingiz tasdiqlandi!',
      message: `Sizning "${item.title || item.question}" taklifingiz admin tomonidan tasdiqlandi.`,
      relatedItemType: type,
      relatedItemId: item._id
    });

    res.status(200).json({ success: true, data: item });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.patch('/community/:type/:id/force-reject', async (req: Request, res: Response) => {
  try {
    const { type, id } = req.params;
    const { reason } = req.body;
    const Model: any = type === 'problem' ? Problem : QuestionModel;
    const item = await Model.findById(id);
    
    if (!item) return res.status(404).json({ success: false, message: 'Topilmadi' });
    
    item.status = 'rejected';
    item.isActive = false;
    await item.save();

    const { NotificationModel } = require('../models/Notification');
    await NotificationModel.create({
      recipient: item.author,
      type: 'content_rejected',
      title: 'Taklifingiz rad etildi',
      message: `Sizning "${item.title || item.question}" taklifingiz admin tomonidan rad etildi. Sabab: ${reason || 'Sifat talablariga javob bermadi.'}`,
      relatedItemType: type,
      relatedItemId: item._id
    });

    res.status(200).json({ success: true, data: item });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/users/:id/submissions', async (req: Request, res: Response) => {
  try {
    const problems = await Problem.find({ author: req.params.id }).select('status title createdAt').lean();
    const questions = await QuestionModel.find({ author: req.params.id }).select('status question createdAt').lean();
    
    const combined = [
      ...problems.map(p => ({ ...p, itemType: 'problem', titleText: p.title })),
      ...questions.map(q => ({ ...q, itemType: 'question', titleText: q.question }))
    ];

    const stats = {
      total: combined.length,
      approved: combined.filter(c => c.status === 'approved').length,
      rejected: combined.filter(c => c.status === 'rejected').length,
      pending: combined.filter(c => c.status === 'pending').length
    };

    res.status(200).json({ success: true, data: { submissions: combined, stats } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
