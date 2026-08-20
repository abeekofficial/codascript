import { UserModel } from '../models/User';
import { User } from '@codascript/types';

export class UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    return UserModel.findOne({ email }).lean();
  }
  
  async findById(id: string): Promise<User | null> {
    return UserModel.findById(id).lean();
  }
  
  async create(userData: Partial<User>): Promise<User> {
    const user = new UserModel(userData);
    await user.save();
    return user.toObject();
  }

  async getLeaderboard(limit: number = 10): Promise<User[]> {
    return UserModel.find({}, { name: 1, totalXP: 1 })
      .sort({ totalXP: -1 })
      .limit(limit)
      .lean();
  }

  async update(id: string, data: Partial<User>): Promise<User | null> {
    return UserModel.findByIdAndUpdate(id, { $set: data }, { new: true }).lean();
  }

  async findByUsername(username: string): Promise<User | null> {
    return UserModel.findOne({ username }).lean();
  }
}
