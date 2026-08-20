const fs = require('fs');
const path = require('path');

const base = path.join(__dirname, 'src');

const dirs = [
  'config',
  'controllers',
  'middlewares',
  'models',
  'repositories',
  'routes',
  'services',
  'utils',
  'validations'
];

dirs.forEach(d => fs.mkdirSync(path.join(base, d), { recursive: true }));

const files = {
  'config/db.ts': import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/codascript');
    console.log(\`MongoDB Connected: \${conn.connection.host}\`);
  } catch (error) {
    console.error(\`Error connecting to MongoDB\`, error);
    process.exit(1);
  }
};

  'utils/jwt.ts': `import jwt from 'jsonwebtoken';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'access_secret';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh_secret';

export const generateTokens = (userId: string) => {
  const accessToken = jwt.sign({ userId }, ACCESS_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ userId }, REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, ACCESS_SECRET) as { userId: string };
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, REFRESH_SECRET) as { userId: string };
};
`,
  'middlewares/errorHandler.ts': `import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);

  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: err.errors
    });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Server Error'
  });
};
`,
  'middlewares/auth.ts': `import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';

export interface AuthRequest extends Request {
  userId?: string;
}

export const protect = (req: AuthRequest, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }

  try {
    const decoded = verifyAccessToken(token);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
  }
};
`,
  'validations/user.validation.ts': `import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string()
  })
});
`,
  'middlewares/validate.ts': `import { Request, Response, NextFunction } from 'express';
import { AnyZodObject } from 'zod';

export const validate = (schema: AnyZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params
      });
      return next();
    } catch (error) {
      return next(error);
    }
  };
`,
  'models/User.ts': `import mongoose, { Schema } from 'mongoose';
import { User, Track, Role } from '@codascript/types';

const userSchema = new Schema<User>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  totalXP: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  currentStreak: { type: Number, default: 0 },
  lastActiveDate: { type: Date, default: Date.now },
  trackProgress: [{
    track: { type: String, required: true },
    progress: { type: Number, default: 0 }
  }]
}, { timestamps: true });

export const UserModel = mongoose.model<User>('User', userSchema);
`,
  'models/Question.ts': `import mongoose, { Schema } from 'mongoose';
import { Question } from '@codascript/types';

const questionSchema = new Schema<Question>({
  track: { type: String, required: true },
  level: { type: String, required: true },
  type: { type: String, required: true },
  content: { type: String, required: true },
  options: [{ type: String }],
  correctAnswers: [{ type: String, required: true }],
  explanation: { type: String, required: true },
  xpValue: { type: Number, required: true }
}, { timestamps: true });

export const QuestionModel = mongoose.model<Question>('Question', questionSchema);
`,
  'models/QuizSession.ts': `import mongoose, { Schema } from 'mongoose';
import { QuizSession } from '@codascript/types';

const quizSessionSchema = new Schema<QuizSession>({
  userId: { type: String, required: true },
  track: { type: String, required: true },
  level: { type: String, required: true },
  questions: [{ type: Schema.Types.ObjectId, ref: 'Question' }],
  answers: [{
    questionId: { type: String, required: true },
    userAnswer: [{ type: String }],
    isCorrect: { type: Boolean, required: true }
  }],
  score: { type: Number, default: 0 },
  earnedXP: { type: Number, default: 0 },
  status: { type: String, enum: ['in_progress', 'completed'], default: 'in_progress' },
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date }
}, { timestamps: true });

export const QuizSessionModel = mongoose.model<QuizSession>('QuizSession', quizSessionSchema);
`,
  'repositories/UserRepository.ts': `import { UserModel } from '../models/User';
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
}
`,
  'repositories/QuestionRepository.ts': `import { QuestionModel } from '../models/Question';
import { Question } from '@codascript/types';

export class QuestionRepository {
  async findById(id: string): Promise<Question | null> {
    return QuestionModel.findById(id).lean();
  }

  async findByTrackAndLevel(track: string, level: string, limit: number = 5): Promise<Question[]> {
    return QuestionModel.aggregate([
      { $match: { track, level } },
      { $sample: { size: limit } }
    ]);
  }

  async create(questionData: Partial<Question>): Promise<Question> {
    const question = new QuestionModel(questionData);
    await question.save();
    return question.toObject();
  }

  async update(id: string, questionData: Partial<Question>): Promise<Question | null> {
    return QuestionModel.findByIdAndUpdate(id, questionData, { new: true }).lean();
  }

  async delete(id: string): Promise<boolean> {
    const res = await QuestionModel.findByIdAndDelete(id);
    return res !== null;
  }
}
`,
  'repositories/QuizSessionRepository.ts': `import { QuizSessionModel } from '../models/QuizSession';
import { QuizSession } from '@codascript/types';

export class QuizSessionRepository {
  async findById(id: string): Promise<QuizSession | null> {
    return QuizSessionModel.findById(id).lean();
  }

  async create(sessionData: Partial<QuizSession>): Promise<QuizSession> {
    const session = new QuizSessionModel(sessionData);
    await session.save();
    return session.toObject();
  }

  async update(id: string, sessionData: Partial<QuizSession>): Promise<QuizSession | null> {
    return QuizSessionModel.findByIdAndUpdate(id, sessionData, { new: true }).lean();
  }
}
`,
  'services/UserService.ts': `import bcrypt from 'bcrypt';
import { UserRepository } from '../repositories/UserRepository';
import { generateTokens } from '../utils/jwt';

export class UserService {
  private userRepository = new UserRepository();

  async register(data: any) {
    const existing = await this.userRepository.findByEmail(data.email);
    if (existing) throw { statusCode: 400, message: 'Email already in use' };

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await this.userRepository.create({ ...data, password: hashedPassword });

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
}
`,
  'services/QuestionService.ts': `import { QuestionRepository } from '../repositories/QuestionRepository';
import { Question } from '@codascript/types';

export class QuestionService {
  private repo = new QuestionRepository();

  async createQuestion(data: Partial<Question>) {
    return this.repo.create(data);
  }

  async updateQuestion(id: string, data: Partial<Question>) {
    const q = await this.repo.update(id, data);
    if (!q) throw { statusCode: 404, message: 'Question not found' };
    return q;
  }

  async getQuestion(id: string) {
    const q = await this.repo.findById(id);
    if (!q) throw { statusCode: 404, message: 'Question not found' };
    return q;
  }

  async deleteQuestion(id: string) {
    const success = await this.repo.delete(id);
    if (!success) throw { statusCode: 404, message: 'Question not found' };
    return true;
  }
}
`,
  'services/QuizService.ts': `import { QuizSessionRepository } from '../repositories/QuizSessionRepository';
import { QuestionRepository } from '../repositories/QuestionRepository';

export class QuizService {
  private sessionRepo = new QuizSessionRepository();
  private questionRepo = new QuestionRepository();

  async startQuiz(userId: string, track: string, level: string) {
    const questions = await this.questionRepo.findByTrackAndLevel(track, level, 5);
    if (questions.length === 0) throw { statusCode: 404, message: 'No questions found for this track and level' };

    const sessionData = {
      userId,
      track: track as any,
      level: level as any,
      questions: questions.map(q => q._id.toString()),
      answers: [],
      score: 0,
      earnedXP: 0,
      status: 'in_progress' as const
    };

    const session = await this.sessionRepo.create(sessionData);
    return session;
  }

  async submitAnswer(sessionId: string, userId: string, questionId: string, userAnswer: string[]) {
    const session = await this.sessionRepo.findById(sessionId);
    if (!session) throw { statusCode: 404, message: 'Session not found' };
    if (session.userId !== userId) throw { statusCode: 403, message: 'Forbidden' };
    if (session.status === 'completed') throw { statusCode: 400, message: 'Quiz already completed' };

    const question = await this.questionRepo.findById(questionId);
    if (!question) throw { statusCode: 404, message: 'Question not found' };

    // simple check for multiple choice/select
    const isCorrect = JSON.stringify(question.correctAnswers.sort()) === JSON.stringify(userAnswer.sort());

    // Check if already answered
    const alreadyAnswered = session.answers.find(a => a.questionId === questionId);
    if (alreadyAnswered) throw { statusCode: 400, message: 'Question already answered' };

    session.answers.push({ questionId, userAnswer, isCorrect });

    if (isCorrect) {
      session.score += 1;
      session.earnedXP += question.xpValue;
    }

    // if all questions answered
    if (session.answers.length === session.questions.length) {
      session.status = 'completed';
      session.endTime = new Date();
    }

    return this.sessionRepo.update(sessionId, session);
  }
}
`,
  'controllers/AuthController.ts': `import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/UserService';
import { AuthRequest } from '../middlewares/auth';

const userService = new UserService();

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const tokens = await userService.register(req.body);
      res.status(201).json({ success: true, data: tokens });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const tokens = await userService.login(req.body);
      res.status(200).json({ success: true, data: tokens });
    } catch (error) {
      next(error);
    }
  }

  static async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const profile = await userService.getProfile(req.userId!);
      res.status(200).json({ success: true, data: profile });
    } catch (error) {
      next(error);
    }
  }
}
`,
  'controllers/QuestionController.ts': `import { Request, Response, NextFunction } from 'express';
import { QuestionService } from '../services/QuestionService';

const questionService = new QuestionService();

export class QuestionController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const q = await questionService.createQuestion(req.body);
      res.status(201).json({ success: true, data: q });
    } catch (error) { next(error); }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const q = await questionService.updateQuestion(req.params.id, req.body);
      res.status(200).json({ success: true, data: q });
    } catch (error) { next(error); }
  }

  static async get(req: Request, res: Response, next: NextFunction) {
    try {
      const q = await questionService.getQuestion(req.params.id);
      res.status(200).json({ success: true, data: q });
    } catch (error) { next(error); }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await questionService.deleteQuestion(req.params.id);
      res.status(200).json({ success: true, message: 'Deleted' });
    } catch (error) { next(error); }
  }
}
`,
  'controllers/QuizController.ts': `import { Response, NextFunction } from 'express';
import { QuizService } from '../services/QuizService';
import { AuthRequest } from '../middlewares/auth';

const quizService = new QuizService();

export class QuizController {
  static async start(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { track, level } = req.body;
      const session = await quizService.startQuiz(req.userId!, track, level);
      res.status(201).json({ success: true, data: session });
    } catch (error) { next(error); }
  }

  static async submitAnswer(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { sessionId, questionId, userAnswer } = req.body;
      const session = await quizService.submitAnswer(sessionId, req.userId!, questionId, userAnswer);
      res.status(200).json({ success: true, data: session });
    } catch (error) { next(error); }
  }
}
`,
  'routes/auth.routes.ts': `import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { validate } from '../middlewares/validate';
import { registerSchema, loginSchema } from '../validations/user.validation';
import { protect } from '../middlewares/auth';

const router = Router();

router.post('/register', validate(registerSchema), AuthController.register);
router.post('/login', validate(loginSchema), AuthController.login);
router.get('/me', protect, AuthController.getProfile);

export default router;
`,
  'routes/question.routes.ts': `import { Router } from 'express';
import { QuestionController } from '../controllers/QuestionController';
import { protect } from '../middlewares/auth';

const router = Router();

router.use(protect); // Require auth for questions management
router.post('/', QuestionController.create);
router.get('/:id', QuestionController.get);
router.put('/:id', QuestionController.update);
router.delete('/:id', QuestionController.delete);

export default router;
`,
  'routes/quiz.routes.ts': `import { Router } from 'express';
import { QuizController } from '../controllers/QuizController';
import { protect } from '../middlewares/auth';

const router = Router();

router.use(protect);
router.post('/start', QuizController.start);
router.post('/answer', QuizController.submitAnswer);

export default router;
`,
  'routes/index.ts': `import { Router } from 'express';
import authRoutes from './auth.routes';
import questionRoutes from './question.routes';
import quizRoutes from './quiz.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/questions', questionRoutes);
router.use('/quiz', quizRoutes);

export default router;
`,
  'app.ts': `import express from 'express';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';
import routes from './routes';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

app.use(cors());
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

app.use('/api', routes);

app.use(errorHandler);

export default app;
`,
  'index.ts': `import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { connectDB } from './config/db';

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(\`Server is running on port \${PORT}\`);
  });
});
`
};

for (const [file, content] of Object.entries(files)) {
  fs.writeFileSync(path.join(base, file), content);
}

console.log('Server files created successfully.');
