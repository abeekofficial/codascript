import { Router } from 'express';
import authRoutes from './auth.routes';
import questionRoutes from './question.routes';
import quizRoutes from './quiz.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/questions', questionRoutes);
router.use('/quiz', quizRoutes);

router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

export default router;
