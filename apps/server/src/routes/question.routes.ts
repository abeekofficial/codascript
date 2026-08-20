import { Router } from 'express';
import { QuestionController } from '../controllers/QuestionController';
import { protect } from '../middlewares/auth';

const router = Router();

// Public routes for quiz configuration
router.get('/topics', QuestionController.getTopics);
router.get('/count', QuestionController.getCount);

// Protected routes for admin management
router.use(protect);
router.post('/', QuestionController.create);
router.get('/:id', QuestionController.get);
router.put('/:id', QuestionController.update);
router.delete('/:id', QuestionController.delete);

export default router;
