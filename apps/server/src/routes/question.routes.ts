import { Router } from 'express';
import { QuestionController } from '../controllers/QuestionController';
import { protect, admin } from '../middlewares/auth';

const router = Router();

// Public routes for quiz configuration
router.get('/topics', QuestionController.getTopics);
router.get('/count', QuestionController.getCount);

// Protected routes for admin management
router.use(protect);
router.use(admin); // Only admins can manage questions now
router.post('/', QuestionController.create);
router.post('/bulk', QuestionController.createBulk);
router.get('/:id', QuestionController.get);
router.put('/:id', QuestionController.update);
router.delete('/:id', QuestionController.delete);

export default router;
