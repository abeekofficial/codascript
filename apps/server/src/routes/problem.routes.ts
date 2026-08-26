import { Router } from 'express';
import { ProblemController } from '../controllers/problem.controller';
import { protect, admin } from '../middlewares/auth';

const router = Router();

// Public/Client routes
router.get('/', ProblemController.getAllClientProblems);
router.get('/:slug', ProblemController.getClientProblemBySlug);

// Protected routes (Code Submission)
router.post('/:id/submit', protect, ProblemController.submitCode);
router.post('/:id/run', protect, ProblemController.runCode);

// Admin routes
router.post('/bulk', protect, admin, ProblemController.bulkCreateProblems);
router.post('/', protect, admin, ProblemController.createProblem);
router.put('/:id', protect, admin, ProblemController.updateProblem);
router.delete('/:id', protect, admin, ProblemController.deleteProblem);

export default router;
