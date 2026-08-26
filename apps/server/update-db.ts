import mongoose from 'mongoose';
import { Problem } from './src/models/Problem';
import 'dotenv/config';

(async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URL as string);
    const result = await Problem.updateOne({ slug: 'ikki-son-yigindisi' }, {
      $set: {
        'starterCode.javascript': '// Ikki son yig\'indisini hisoblovchi funksiya\nconst [a, b] = INPUT.split(\',\').map(Number);\n\n// Natijani console.log() orqali chiqaring:\nconsole.log( /* shu yerga yozing */ );\n'
      }
    });
    console.log('Update result:', result);
  } catch(e) {
    console.log('Error:', e);
  } finally {
    process.exit(0);
  }
})();
