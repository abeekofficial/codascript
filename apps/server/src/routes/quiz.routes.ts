import { Router } from 'express';
import { QuizController } from '../controllers/QuizController';
import { protect } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { startQuizSchema, submitAnswerSchema, completeQuizSchema } from '../validations/quiz.validation';

const router = Router();

router.use(protect);
router.post('/start', validate(startQuizSchema), QuizController.start);
router.post('/answer', validate(submitAnswerSchema), QuizController.submitAnswer);
router.get('/:quizId/questions/:questionId/test-cases', QuizController.getTestCases);
router.post('/complete', validate(completeQuizSchema), QuizController.complete);
router.get('/profile-stats', QuizController.getProfileStats);
router.get('/growth-data', QuizController.getGrowthData);
router.get('/skill-stats', QuizController.getSkillStats);
router.get('/history', QuizController.getHistory);

export default router;
