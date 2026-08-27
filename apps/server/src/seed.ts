import 'dotenv/config';
import mongoose from 'mongoose';
import { QuestionModel } from './models/Question';
import { UserModel } from './models/User';
import bcrypt from 'bcryptjs';

// Import directly via relative path, tsx handles it perfectly
// @ts-ignore
import { ADMIN_QUESTIONS } from '../../web/src/data/questions';

async function seed() {
  try {
    await mongoose.connect('mongodb://localhost:27017/codascript');
    console.log('Connected to DB');

    // 1. Seed Admin User
    const adminEmail = process.env.SEED_ADMIN_EMAIL;
    const adminPassword = process.env.SEED_ADMIN_PASSWORD;
    
    if (!adminEmail || !adminPassword) {
      throw new Error('Missing SEED_ADMIN_EMAIL or SEED_ADMIN_PASSWORD in environment variables');
    }

    if (adminPassword === 'admin123') {
      console.warn('\n========================================================================');
      console.warn('WARNING: You are using the default "admin123" password for the admin account.');
      console.warn('Please change SEED_ADMIN_PASSWORD in your environment variables IMMEDIATELY.');
      console.warn('========================================================================\n');
    }

    let admin = await UserModel.findOne({ email: adminEmail });
    if (!admin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      admin = new UserModel({
        name: 'Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        totalXP: 0,
        completedQuizzes: 0
      });
      await admin.save();
      console.log(`Created admin user: ${adminEmail}`);
    } else {
      admin.role = 'admin';
      await admin.save();
      console.log(`Updated existing user ${adminEmail} to admin role.`);
    }

    // 2. Seed Questions
    // Clear existing questions
    await QuestionModel.deleteMany({});
    console.log('Cleared existing questions');

    // Transform and insert
    const formattedQuestions = ADMIN_QUESTIONS.map((q: any) => ({
      topic: q.tech === 'js' ? 'JavaScript' : 
             q.tech === 'ts' ? 'TypeScript' : 
             q.tech === 'react' ? 'React' : 
             q.tech === 'html' ? 'HTML' : 
             q.tech === 'css' ? 'CSS' : q.tech,
      difficulty: q.difficulty,
      question: q.prompt,
      options: q.options,
      correctOptionId: q.correctIndex,
      explanation: q.explanation,
      code: q.code || ''
    }));

    await QuestionModel.insertMany(formattedQuestions, { ordered: false });
    console.log(`Successfully seeded ${formattedQuestions.length} questions from data/questions.ts`);

  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    mongoose.disconnect();
    process.exit(0);
  }
}

seed();
