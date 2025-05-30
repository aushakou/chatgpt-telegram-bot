import { Schema, model, Types, Document } from 'mongoose';

interface IUser extends Document {
  username: string;
  telegramId: string;
  createdAt: Date;
  apiAccess: boolean;
  totalMessages: number;
}

const userSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  telegramId:    { type: String, required: true, unique: true },
  createdAt:{ type: Date, default: Date.now },
  apiAccess: { type: Boolean, default: false },
  totalMessages: { type: Number, default: 0 },
});

export const User = model<IUser>('User', userSchema);
