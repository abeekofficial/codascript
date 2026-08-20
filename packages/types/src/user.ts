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
  avatar?: string;
  role: Role;
  totalXP: number;
  level: number;
  currentStreak: number;
  lastActiveDate: Date | string;
  trackProgress: UserTrackProgress[];
  createdAt?: Date | string;
  updatedAt?: Date | string;
}
