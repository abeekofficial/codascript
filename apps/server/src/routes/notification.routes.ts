import { Router } from 'express';
import { NotificationController } from '../controllers/NotificationController';
import { protect } from '../middlewares/auth';

const router = Router();

router.use(protect);

router.get('/', NotificationController.getNotifications);
router.get('/unread-count', NotificationController.getUnreadCount);
router.patch('/read-all', NotificationController.markAllAsRead);
router.patch('/:id/read', NotificationController.markAsRead);

export default router;
