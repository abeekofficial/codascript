import mongoose, { Schema } from 'mongoose';
import { User, Track, Role } from '@codascript/types';

const userSchema = new Schema<User>({
  name: { type: String, required: true },
  username: { type: String, unique: true, sparse: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },  // OAuth foydalanuvchilar uchun ixtiyoriy
  oauthProvider: { type: String },  // 'google' | 'github'
  avatar: { type: String, default: '' },
  bio: { type: String, default: '', maxlength: 200 },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  totalXP: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  currentStreak: { type: Number, default: 0 },
  completedQuizzes: { type: Number, default: 0 },
  lastActiveDate: { type: Date, default: Date.now },
  trackProgress: [{
    track: { type: String, required: true },
    progress: { type: Number, default: 0 }
  }],
  followers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  lastSeenAt: { type: Date, default: Date.now },
  isBanned: { type: Boolean, default: false }
}, { timestamps: true });

userSchema.index({ totalXP: -1 });
userSchema.index({ email: 1 }); // might be useful
export const UserModel = mongoose.model<User>('User', userSchema);
