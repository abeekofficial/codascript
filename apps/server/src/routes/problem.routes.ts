import { Router } from 'express';
import { ProblemController } from '../controllers/problem.controller';
import { protect, admin } from '../middlewares/auth';

const router = Router();

import { rateLimit } from 'express-rate-limit';

const submitLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 15,
  message: { success: false, data: { status: 'rate_limit_exceeded', message: 'Too many requests' } },
  keyGenerator: (req: any) => req.user?.id || req.ip
});

// Public/Client routes
router.get('/', ProblemController.getAllClientProblems);
router.get('/:slug', ProblemController.getClientProblemBySlug);

// Protected routes (Code Submission)
router.post('/:id/submit', protect, submitLimiter, ProblemController.submitCode);
router.post('/:id/run', protect, submitLimiter, ProblemController.runCode);

// Admin routes
router.post('/bulk', protect, admin, ProblemController.bulkCreateProblems);
router.post('/', protect, admin, ProblemController.createProblem);
router.put('/:id', protect, admin, ProblemController.updateProblem);
router.delete('/:id', protect, admin, ProblemController.deleteProblem);

export default router;
