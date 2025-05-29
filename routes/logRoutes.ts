import { Router } from 'express';
import { createLogHandler, getLogsHandler } from '../controllers/logController';

const router = Router();

router.post('/logs', createLogHandler);
router.get('/logs', getLogsHandler);

export default router;
