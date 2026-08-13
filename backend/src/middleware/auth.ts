import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
  childId?: string;
}

export function authenticateParent(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: Missing or invalid authorization token' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as { id: string; email: string; role: string };
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Unauthorized: Token expired or invalid' });
  }
}

export function authenticateChildSession(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const childHeader = req.headers['x-child-id'] as string;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as { id: string; childId?: string };
      req.childId = decoded.childId || childHeader || (req.params.childId as string);
      next();
      return;
    } catch (err) {
      // Fall through to header check
    }
  }

  const childIdParam = req.params.childId as string || childHeader;
  if (!childIdParam) {
    res.status(401).json({ error: 'Unauthorized: Missing child identifier' });
    return;
  }

  req.childId = childIdParam;
  next();
}
