import { Schema, model, Document } from 'mongoose';

export interface ILog extends Document {
  username: string;
  userid: string;
  message: string;
  timestamp: Date;
}

const logSchema = new Schema<ILog>({
  username: { type: String, required: true },
  userid: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, required: true },
});

export const Log = model<ILog>('Log', logSchema);
