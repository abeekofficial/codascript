import 'dotenv/config';
import mongoose from 'mongoose';
import { Problem } from './src/models/Problem';

const mockProblems = [
  {
    title: 'Ikki son yig\'indisi',
    slug: 'ikki-son-yigindisi',
    difficulty: 'easy',
    topic: 'javascript',
    description: `Berilgan ikkita sonning yig'indisini hisoblovchi funksiya yozing.
Kodingiz natijani qaytarishi (return) yoki darhol konsolga chiqarishi (console.log) kerak. Ammo testlar console.log'ga qarab tekshiriladi.
Masalan: \`console.log(Number(INPUT.split(',')[0]) + Number(INPUT.split(',')[1]))\``,
    examples: [
      { input: '2, 3', output: '5' }
    ],
    starterCode: { javascript: "const [a, b] = INPUT.split(',').map(Number);\nconsole.log(a + b);\n" },
    testCases: [
      { input: '2, 3', expectedOutput: '5', isHidden: false },
      { input: '-1, 5', expectedOutput: '4', isHidden: false },
      { input: '10, 20', expectedOutput: '30', isHidden: true }
    ],
    isActive: true
  }
];

async function seedProblems() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/codascript');
    await Problem.deleteMany({});
    const inserted = await Problem.insertMany(mockProblems);
    console.log('Seeded problems:');
    inserted.forEach(p => console.log(`ID: ${p._id} - ${p.title}`));
  } catch (e) {
    console.error(e);
  } finally {
    mongoose.disconnect();
    process.exit(0);
  }
}

seedProblems();
