import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { validate } from '../middlewares/validate';
import { registerSchema, loginSchema, updateProfileSchema, changePasswordSchema } from '../validations/user.validation';
import { protect } from '../middlewares/auth';

const router = Router();

router.post('/register', validate(registerSchema), AuthController.register);
router.post('/login', validate(loginSchema), AuthController.login);
router.get('/me', protect, AuthController.getProfile);
router.get('/leaderboard', AuthController.getLeaderboard);
router.put('/profile', protect, validate(updateProfileSchema), AuthController.updateProfile);
router.put('/password', protect, validate(changePasswordSchema), AuthController.changePassword);

export default router;
