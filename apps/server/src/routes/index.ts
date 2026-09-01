import { Router } from 'express';
import authRoutes from './auth.routes';
import questionRoutes from './question.routes';
import quizRoutes from './quiz.routes';
import userRoutes from './user.routes';
import problemRoutes from './problem.routes';

import communityRoutes from './community.routes';
import followRoutes from './follow.routes';
import savedRoutes from './saved.routes';
import notificationRoutes from './notification.routes';
import adminRoutes from './admin.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/questions', questionRoutes);
router.use('/quiz', quizRoutes);
router.use('/users', followRoutes);
router.use('/users', userRoutes);
router.use('/problems', problemRoutes);
router.use('/community', communityRoutes);
router.use('/saved', savedRoutes);
router.use('/notifications', notificationRoutes);
router.use('/admin', adminRoutes);

router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

export default router;
