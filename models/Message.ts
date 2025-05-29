import { Schema, model, Types, Document } from 'mongoose';

interface IMessage extends Document {
  session: Types.ObjectId;
  sender: Types.ObjectId;
  content: string;
  createdAt: Date;
}

const messageSchema = new Schema<IMessage>({
  session: { type: Schema.Types.ObjectId, ref: 'Session', required: true },
  sender:  { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
}, { timestamps: true });

// Compound index to optimize queries for recent messages in a conversation
messageSchema.index({ session: 1, createdAt: -1 });

export const Message = model<IMessage>('Message', messageSchema);
