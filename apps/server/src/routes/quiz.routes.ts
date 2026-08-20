import { Router } from 'express';
import { QuizController } from '../controllers/QuizController';
import { protect } from '../middlewares/auth';

const router = Router();

router.use(protect);
router.post('/start', QuizController.start);
router.post('/answer', QuizController.submitAnswer);
router.post('/complete', QuizController.complete);

export default router;
