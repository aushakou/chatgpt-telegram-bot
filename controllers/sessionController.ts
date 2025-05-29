import { Request, Response } from 'express';
import { SessionService } from '../services/sessionService';

export class SessionController {
  static async createSession(req: Request, res: Response) {
    try {
      const { userId } = req.body;
      const session = await SessionService.createSession(userId);
      res.status(201).json(session);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({ error: errorMessage });
    }
  }

  static async endSession(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      const session = await SessionService.endSession(sessionId);
      res.json(session);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({ error: errorMessage });
    }
  }

  static async getActiveSession(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const session = await SessionService.getActiveSession(userId);
      res.json(session);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({ error: errorMessage });
    }
  }
}
