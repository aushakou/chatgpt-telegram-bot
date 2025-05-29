import { Router } from 'express';
import { SessionController } from '../controllers/sessionController';

const router = Router();

router.post('/', SessionController.createSession);
router.put('/:sessionId/end', SessionController.endSession);
router.get('/user/:userId/active', SessionController.getActiveSession);

export default router;
