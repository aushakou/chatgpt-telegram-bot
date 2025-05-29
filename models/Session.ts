import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date },
  status: { type: String, enum: ['active', 'ended'], default: 'active' },
  messageCount: { type: Number, default: 0 }
});

export const Session = mongoose.model('Session', sessionSchema);
