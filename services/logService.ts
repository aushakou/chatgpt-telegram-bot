import { Log, ILog } from '../models/Log';

export const createLog = async (logData: Partial<ILog>): Promise<ILog> => {
  const log = new Log(logData);
  return await log.save();
};

export const getAllLogs = async (): Promise<ILog[]> => {
  return await Log.find().sort({ timestamp: -1 });
};
