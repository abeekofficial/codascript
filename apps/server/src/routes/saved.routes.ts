import { Router } from 'express';
import { SavedController } from '../controllers/SavedController';
import { protect } from '../middlewares/auth';

const router = Router();

router.use(protect); // All routes protected

router.get('/', SavedController.getSavedItems);
router.get('/check', SavedController.checkSaved);
router.post('/', SavedController.saveItem);
router.delete('/:itemType/:itemId', SavedController.unsaveItem);

export default router;
