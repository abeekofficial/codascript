import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { QuestionModel } from './models/Question';

dotenv.config();

async function seedDatabase() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }
    
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    const quizzesDir = path.join(__dirname, 'data', 'quizzes');
    const files = fs.readdirSync(quizzesDir).filter(file => file.endsWith('.json'));
    let totalUpserted = 0;
    let totalDuplicates = 0;

    for (const file of files) {
      const filePath = path.join(quizzesDir, file);
      const fileData = fs.readFileSync(filePath, 'utf-8');
      const questions = JSON.parse(fileData);

      for (const q of questions) {
        // Map JSON format to Mongoose schema
        const topic = q.topic;
        const difficulty = q.difficulty;
        const question = q.question;
        const options = q.options;
        const correctOptionId = q.correctOptionIndex;
        const explanation = q.explanation;

        if (!topic || !difficulty || !question || !options || correctOptionId === undefined) {
            console.warn(`[WARNING] Skipping invalid question in ${file}: ${question}`);
            continue;
        }

        const result = await QuestionModel.updateOne(
          { topic, question },
          {
            $set: {
              topic,
              difficulty,
              question,
              options,
              correctOptionId,
              explanation
            }
          },
          { upsert: true }
        );
        
        if (result.upsertedCount > 0) {
            totalUpserted++;
        } else if (result.modifiedCount > 0) {
            totalUpserted++; // Count as updated if we're upserting
        } else {
            totalDuplicates++;
        }
      }
      console.log(`Processed ${file}`);
    }

    console.log(`Seeding completed successfully. Total questions upserted/updated: ${totalUpserted}, unchanged/duplicates: ${totalDuplicates}`);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seedDatabase();
