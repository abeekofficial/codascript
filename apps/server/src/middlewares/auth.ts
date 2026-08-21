import { Request, Response, NextFunction } from 'express';
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

import { UserModel } from '../models/User';

export const admin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.userId) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }

  try {
    const user = await UserModel.findById(req.userId);
    if (user && user.role === 'admin') {
      next();
    } else {
      return res.status(403).json({ success: false, message: 'Not authorized as an admin' });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
