import { Log } from '../models/Log';

export class MessageService {
  static async createMessage(logData: {
    username: string;
    userid: string;
    message: string;
    timestamp: Date;
  }) {
    try {
      const logEntry = new Log(logData);
      await logEntry.save();
      return logEntry;
    } catch (error) {
      throw new Error(`Failed to create message: ${error}`);
    }
  }

  static async getMessagesByUserId(userId: string) {
    try {
      return await Log.find({ userid: userId }).sort({ timestamp: -1 });
    } catch (error) {
      throw new Error(`Failed to get messages: ${error}`);
    }
  }

  static async getAllMessages() {
    try {
      return await Log.find().sort({ timestamp: -1 });
    } catch (error) {
      throw new Error(`Failed to get all messages: ${error}`);
    }
  }
}
