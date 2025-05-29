import { Router, RequestHandler } from 'express';
import { UserController } from '../controllers/userController';

const router = Router();

// User routes
router.post('/', UserController.createUser as RequestHandler);
router.get('/', UserController.getAllUsers as RequestHandler);
router.get('/:id', UserController.getUser as RequestHandler);
router.put('/:id', UserController.updateUser as RequestHandler);
router.delete('/:id', UserController.deleteUser as RequestHandler);

export default router;
