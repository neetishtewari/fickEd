import { Request, Response } from 'express';
import { ParentService } from './parent.service.js';

export async function getParentDashboard(req: Request, res: Response): Promise<void> {
  try {
    const parentId = (req as any).user.id;
    const summary = await ParentService.getDashboardSummary(parentId);
    res.json(summary);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch parent dashboard', details: err.message });
  }
}
