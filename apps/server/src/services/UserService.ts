import bcrypt from 'bcryptjs';
import { UserRepository } from '../repositories/UserRepository';
import { generateTokens } from '../utils/jwt';

export class UserService {
  private userRepository = new UserRepository();

  async register(data: any) {
    const existing = await this.userRepository.findByEmail(data.email);
    if (existing) throw { statusCode: 400, message: 'Email already in use' };

    const role = data.email === 'abeekoffi@gmail.com' ? 'admin' : 'user';

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await this.userRepository.create({ ...data, password: hashedPassword, role });
    
    return generateTokens(user._id.toString());
  }

  async login(data: any) {
    const user = await this.userRepository.findByEmail(data.email);
    if (!user || !user.password) throw { statusCode: 401, message: 'Invalid credentials' };

    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) throw { statusCode: 401, message: 'Invalid credentials' };

    return generateTokens(user._id.toString());
  }
  
  async getProfile(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw { statusCode: 404, message: 'User not found' };
    const { password, ...safeUser } = user as any;
    return safeUser;
  }

  async getLeaderboard() {
    return this.userRepository.getLeaderboard();
  }

  async updateProfile(userId: string, data: any) {
    if (data.username) {
      const existing = await this.userRepository.findByUsername(data.username);
      if (existing && existing._id.toString() !== userId) {
        throw { statusCode: 400, message: 'Username is already taken' };
      }
    }
    const updated = await this.userRepository.update(userId, data);
    if (!updated) throw { statusCode: 404, message: 'User not found' };
    const { password, ...safeUser } = updated as any;
    return safeUser;
  }

  async changePassword(userId: string, data: any) {
    const user = await this.userRepository.findById(userId);
    if (!user || !user.password) throw { statusCode: 404, message: 'User not found' };

    const isMatch = await bcrypt.compare(data.currentPassword, user.password);
    if (!isMatch) throw { statusCode: 400, message: 'Current password is incorrect' };

    const hashedPassword = await bcrypt.hash(data.newPassword, 10);
    await this.userRepository.update(userId, { password: hashedPassword });
    return { success: true, message: 'Password updated successfully' };
  }
}
