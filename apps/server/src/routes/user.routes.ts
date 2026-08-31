import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { optionalProtect } from '../middlewares/auth';

const router = Router();

router.get('/:username', optionalProtect, UserController.getPublicProfile);

export default router;
