import { Router } from 'express';
import { QuestionController } from '../controllers/QuestionController';
import { protect, admin } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { createQuestionSchema, updateQuestionSchema, createBulkQuestionSchema } from '../validations/question.validation';

const router = Router();

// Public routes for quiz configuration
router.get('/topics', QuestionController.getTopics);
router.get('/subtopics', QuestionController.getSubtopics);
router.get('/count', QuestionController.getCount);

// Protected routes for admin management
router.use(protect);
router.use(admin); // Only admins can manage questions now
router.get('/', QuestionController.getAll);
router.get('/stats', QuestionController.getStats);
router.post('/', validate(createQuestionSchema), QuestionController.create);
router.post('/bulk', validate(createBulkQuestionSchema), QuestionController.createBulk);
router.get('/:id', QuestionController.get);
router.put('/:id', validate(updateQuestionSchema), QuestionController.update);
router.delete('/:id', QuestionController.delete);

export default router;
