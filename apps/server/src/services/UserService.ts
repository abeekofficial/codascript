import bcrypt from 'bcryptjs';
import { UserRepository } from '../repositories/UserRepository';
import { generateTokens, verifyRefreshToken } from '../utils/jwt';

export class UserService {
  private userRepository = new UserRepository();

  async register(data: any) {
    const existing = await this.userRepository.findByEmail(data.email);
    if (existing) throw { statusCode: 400, message: 'Email already in use' };

    const adminEmail = process.env.ADMIN_EMAIL || 'abeekoffi@gmail.com';
    const role = data.email === adminEmail ? 'admin' : 'user';

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

  /**
   * Refresh token orqali yangi access va refresh tokenlar olish
   */
  async refreshToken(refreshToken: string) {
    try {
      const decoded = verifyRefreshToken(refreshToken);
      const user = await this.userRepository.findById(decoded.userId);
      if (!user) throw { statusCode: 401, message: 'User not found' };
      return generateTokens(user._id.toString());
    } catch (error: any) {
      if (error.statusCode) throw error;
      throw { statusCode: 401, message: 'Invalid or expired refresh token' };
    }
  }

  /**
   * OAuth orqali kirish/ro'yxatdan o'tish
   */
  async oauthLogin(data: { email: string; name: string; provider: string; avatar?: string }) {
    let user = await this.userRepository.findByEmail(data.email);
    
    if (!user) {
      const adminEmail = process.env.ADMIN_EMAIL || 'abeekoffi@gmail.com';
      // Yangi foydalanuvchi yaratish (parolsiz)
      user = await this.userRepository.create({
        name: data.name,
        email: data.email,
        avatar: data.avatar,
        oauthProvider: data.provider,
        role: data.email === adminEmail ? 'admin' : 'user'
      } as any);
    }

    return generateTokens(user._id.toString());
  }
  
  async getProfile(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw { statusCode: 404, message: 'User not found' };
    const { password, followers, following, ...safeUser } = user as any;
    
    return {
      ...safeUser,
      followersCount: followers ? followers.length : 0,
      followingCount: following ? following.length : 0
    };
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

  // DANGER: Qaytarib bo'lmaydigan operatsiya
  // Foydalanuvchi va uning test natijalarini to'liq o'chiradi
  async deleteAccount(userId: string) {
    const { QuizAttemptModel } = require('../models/QuizAttempt');
    await QuizAttemptModel.deleteMany({ userId });
    await this.userRepository.delete(userId);
  }

  async forgotPassword(email: string, origin: string) {
    const user = await this.userRepository.findByEmail(email);
    // Security: Hatto topilmasa ham success qaytaramiz (enumeratsiyani oldini olish uchun)
    if (!user) return { success: true, message: 'If email exists, a reset link was sent' };

    const crypto = require('crypto');
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 mins

    await this.userRepository.update(user._id.toString(), {
      resetPasswordToken,
      resetPasswordExpires: new Date(resetPasswordExpires)
    });

    const resetUrl = `${origin}/reset-password?token=${resetToken}`;
    const message = `Parolingizni tiklash uchun quyidagi havolaga o'ting:\n\n${resetUrl}\n\nBu havola 15 daqiqadan so'ng o'z kuchini yo'qotadi.`;

    try {
      const { sendEmail } = require('../utils/sendEmail');
      await sendEmail({
        email: user.email,
        subject: 'CodaScript - Parolni tiklash',
        message
      });
    } catch (error) {
      // DONT reset tokens here, so the user can still use the generated token manually if email fails in QA
      // Test muhitida email xizmatini ulamasdan ham tokenni konsolga chiqaramiz (QA uchun)
      console.log('RESET URL (Email yuborilmadi, lekin QA uchun):', resetUrl);
    }

    return { success: true, message: 'If email exists, a reset link was sent' };
  }

  async resetPassword(token: string, newPassword: string) {
    const crypto = require('crypto');
    const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
    
    // Asosiy repozitoriy orqali to'g'ridan-to'g'ri Mongoose modelni so'raymiz
    const { UserModel } = require('../models/User');
    const user = await UserModel.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) throw { statusCode: 400, message: 'Token yaroqsiz yoki muddati o\'tgan' };

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return { success: true, message: 'Parol muvaffaqiyatli yangilandi' };
  }
}
