import { Router } from 'express';
import { MessageController } from '../controllers/messageController';

const router = Router();

router.post('/', MessageController.createMessage);
router.get('/user/:userId', MessageController.getMessagesByUserId);
router.get('/', MessageController.getAllMessages);

export default router;
