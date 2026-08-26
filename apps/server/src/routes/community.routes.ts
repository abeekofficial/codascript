import { Router, Request, Response, RequestHandler } from 'express';
import { Problem } from '../models/Problem';
import { QuestionModel } from '../models/Question';
import { protect, AuthRequest } from '../middlewares/auth';
import mongoose from 'mongoose';

const router = Router();

const generateGenericId = (prefix: string) => {
  const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${randomStr}`;
};

// POST /api/community/problems/submit
export const submitProblem: RequestHandler = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, difficulty, topic, description, constraints, examples, starterCode, testCases, tags } = req.body;
    
    // Auto-generate slug if not provided, just basic
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + generateGenericId('').substring(1).toLowerCase();

    const newProblem = await Problem.create({
      slug,
      title,
      difficulty,
      topic,
      description,
      constraints,
      examples,
      starterCode,
      testCases,
      tags,
      isActive: false, // hidden until approved maybe? wait, requirement says "Status is strictly 'pending'"
      genericId: generateGenericId('P'),
      author: req.userId,
      status: 'pending',
      upvotes: [],
      downvotes: []
    });

    res.status(201).json({ success: true, data: newProblem });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/community/questions/submit
export const submitQuestion: RequestHandler = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { topic, subtopic, difficulty, question, options, correctOptionId, explanation, code, type, language, starterCode, testCases, tags } = req.body;

    const newQuestion = await QuestionModel.create({
      topic,
      subtopic,
      difficulty,
      question,
      options,
      correctOptionId,
      explanation,
      code,
      type,
      language,
      starterCode,
      testCases,
      tags,
      isActive: false,
      genericId: generateGenericId('Q'),
      author: req.userId,
      status: 'pending',
      upvotes: [],
      downvotes: []
    });

    res.status(201).json({ success: true, data: newQuestion });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/community/:type/:id/vote
export const voteItem: RequestHandler = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { type, id } = req.params;
    const { vote } = req.body; // 'up' or 'down'
    const userId = req.userId as string;

    if (!['problems', 'questions'].includes(type)) {
      res.status(400).json({ success: false, message: 'Invalid type' });
      return;
    }

    if (!['up', 'down'].includes(vote)) {
      res.status(400).json({ success: false, message: 'Invalid vote type. Use "up" or "down".' });
      return;
    }

    const Model: any = type === 'problems' ? Problem : QuestionModel;
    const item = await Model.findById(id);

    if (!item) {
      res.status(404).json({ success: false, message: 'Item not found' });
      return;
    }

    // Initialize arrays if they don't exist
    if (!item.upvotes) item.upvotes = [];
    if (!item.downvotes) item.downvotes = [];

    const upvoteStrArray = item.upvotes.map((id: any) => id.toString());
    const downvoteStrArray = item.downvotes.map((id: any) => id.toString());
    const userIdStr = userId.toString();

    // Remove existing vote
    if (upvoteStrArray.includes(userIdStr)) {
      item.upvotes = item.upvotes.filter((id: any) => id.toString() !== userIdStr);
    }
    if (downvoteStrArray.includes(userIdStr)) {
      item.downvotes = item.downvotes.filter((id: any) => id.toString() !== userIdStr);
    }

    // Add new vote
    if (vote === 'up') {
      item.upvotes.push(userId);
    } else {
      item.downvotes.push(userId);
    }

    // Check auto-approve logic
    const totalVotes = item.upvotes.length + item.downvotes.length;
    if (item.status === 'pending' && totalVotes >= 5) {
      const upvoteRatio = item.upvotes.length / totalVotes;
      if (upvoteRatio >= 0.5) {
        item.status = 'approved';
        item.isActive = true;
      }
    }

    await item.save();

    res.status(200).json({ success: true, data: item });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/community/problems/pending
export const getPendingProblems: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const problems = await Problem.find({ status: 'pending' })
      .populate('author', 'name username avatar')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: problems });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/community/questions/pending
export const getPendingQuestions: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const questions = await QuestionModel.find({ status: 'pending' })
      .populate('author', 'name username avatar')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: questions });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

router.use(protect);
router.get('/problems/pending', getPendingProblems);
router.get('/questions/pending', getPendingQuestions);
router.post('/problems/submit', submitProblem);
router.post('/questions/submit', submitQuestion);
router.post('/:type/:id/vote', voteItem);

export default router;
