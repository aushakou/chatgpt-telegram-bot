import { Request, Response } from 'express';
import { createLog, getAllLogs } from '../services/logService';

export const createLogHandler = async (req: Request, res: Response) => {
  try {
    const log = await createLog(req.body);
    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create log' });
  }
};

export const getLogsHandler = async (_req: Request, res: Response) => {
  try {
    const logs = await getAllLogs();
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve logs' });
  }
};
