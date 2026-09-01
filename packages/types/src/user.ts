export type Track = 'HTML' | 'CSS' | 'JavaScript' | 'TypeScript' | 'React';
export type Role = 'user' | 'admin';

export interface UserTrackProgress {
  track: Track;
  progress: number;
}

export interface User {
  _id: string;
  name: string;
  username?: string;
  email: string;
  password?: string;
  oauthProvider?: string;
  avatar?: string;
  bio?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date | string;
  role: Role;
  totalXP: number;
  level: number;
  currentStreak: number;
  completedQuizzes?: number;
  lastActiveDate: Date | string;
  lastSeenAt?: Date | string;
  isBanned?: boolean;
  followers?: string[];
  following?: string[];
  trackProgress: UserTrackProgress[];
  createdAt?: Date | string;
  updatedAt?: Date | string;
}
