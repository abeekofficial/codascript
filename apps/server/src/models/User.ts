import mongoose, { Schema } from 'mongoose';
import { User, Track, Role } from '@codascript/types';

const userSchema = new Schema<User>({
  name: { type: String, required: true },
  username: { type: String, unique: true, sparse: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  totalXP: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  currentStreak: { type: Number, default: 0 },
  lastActiveDate: { type: Date, default: Date.now },
  trackProgress: [{
    track: { type: String, required: true },
    progress: { type: Number, default: 0 }
  }]
}, { timestamps: true });

export const UserModel = mongoose.model<User>('User', userSchema);
