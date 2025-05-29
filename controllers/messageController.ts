import { Request, Response } from 'express';
import { MessageService } from '../services/messageService';

export class MessageController {
  static async createMessage(req: Request, res: Response) {
    try {
      const { username, userid, message } = req.body;
      const logEntry = await MessageService.createMessage({
        username,
        userid,
        message,
        timestamp: new Date()
      });
      res.status(201).json(logEntry);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({ error: errorMessage });
    }
  }

  static async getMessagesByUserId(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const messages = await MessageService.getMessagesByUserId(userId);
      res.json(messages);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({ error: errorMessage });
    }
  }

  static async getAllMessages(req: Request, res: Response) {
    try {
      const messages = await MessageService.getAllMessages();
      res.json(messages);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      res.status(500).json({ error: errorMessage });
    }
  }
}
