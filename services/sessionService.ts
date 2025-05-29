import { Session } from '../models/Session';

export class SessionService {
  static async createSession(userId: string) {
    try {
      const session = new Session({ userId });
      await session.save();
      return session;
    } catch (error) {
      throw new Error(`Failed to create session: ${error}`);
    }
  }

  static async endSession(sessionId: string) {
    try {
      const session = await Session.findByIdAndUpdate(
        sessionId,
        { 
          endTime: new Date(),
          status: 'ended'
        },
        { new: true }
      );
      return session;
    } catch (error) {
      throw new Error(`Failed to end session: ${error}`);
    }
  }

  static async getActiveSession(userId: string) {
    try {
      return await Session.findOne({ 
        userId,
        status: 'active'
      });
    } catch (error) {
      throw new Error(`Failed to get active session: ${error}`);
    }
  }

  static async incrementMessageCount(sessionId: string) {
    try {
      const session = await Session.findByIdAndUpdate(
        sessionId,
        { $inc: { messageCount: 1 } },
        { new: true }
      );
      return session;
    } catch (error) {
      throw new Error(`Failed to increment message count: ${error}`);
    }
  }
}
