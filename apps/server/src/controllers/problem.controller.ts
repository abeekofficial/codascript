import { Request, Response } from 'express';
import { ProblemService } from '../services/problem.service';

const problemService = new ProblemService();

export class ProblemController {
  
  static async getAllClientProblems(req: Request, res: Response) {
    try {
      const problems = await problemService.getAllClientProblems();
      res.json({ success: true, data: problems });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getClientProblemBySlug(req: Request, res: Response) {
    try {
      const { slug } = req.params;
      const problem = await problemService.getClientProblemBySlug(slug);
      
      if (!problem) {
        return res.status(404).json({ success: false, message: 'Problem not found' });
      }

      res.json({ success: true, data: problem });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async submitCode(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { code, language } = req.body;

      if (!code || !language) {
        return res.status(400).json({ success: false, message: 'Code and language are required' });
      }

      const result = await problemService.submitCode(id, code, language);
      res.json(result);
    } catch (error: any) {
      if (error.name === 'CastError') {
        return res.status(400).json({ success: false, message: 'Invalid Problem ID' });
      }
      if (error.message === 'Problem not found') {
        return res.status(404).json({ success: false, message: error.message });
      }
      if (error.message === 'Only JavaScript is currently supported') {
        return res.status(400).json({ success: false, message: error.message });
      }
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async runCode(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { code, language } = req.body;

      if (!code || !language) {
        return res.status(400).json({ success: false, message: 'Code and language are required' });
      }

      const result = await problemService.runCode(id, code, language);
      res.json(result);
    } catch (error: any) {
      if (error.name === 'CastError') {
        return res.status(400).json({ success: false, message: 'Invalid Problem ID' });
      }
      if (error.message === 'Problem not found') {
        return res.status(404).json({ success: false, message: error.message });
      }
      if (error.message === 'Only JavaScript is currently supported') {
        return res.status(400).json({ success: false, message: error.message });
      }
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Admin routes
  static async bulkCreateProblems(req: Request, res: Response) {
    try {
      const problems = Array.isArray(req.body) ? req.body : [req.body];
      const created = await problemService.bulkCreateProblems(problems);
      res.status(201).json({ success: true, data: created });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async createProblem(req: Request, res: Response) {
    try {
      const problem = await problemService.createProblem(req.body);
      res.status(201).json({ success: true, data: problem });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async updateProblem(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const problem = await problemService.updateProblem(id, req.body);
      if (!problem) {
        return res.status(404).json({ success: false, message: 'Problem not found' });
      }
      res.json({ success: true, data: problem });
    } catch (error: any) {
      if (error.name === 'CastError') {
        return res.status(400).json({ success: false, message: 'Invalid Problem ID' });
      }
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async deleteProblem(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const success = await problemService.deleteProblem(id);
      if (!success) {
        return res.status(404).json({ success: false, message: 'Problem not found' });
      }
      res.json({ success: true, message: 'Problem deleted' });
    } catch (error: any) {
      if (error.name === 'CastError') {
        return res.status(400).json({ success: false, message: 'Invalid Problem ID' });
      }
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
