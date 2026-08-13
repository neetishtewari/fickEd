import { Request, Response } from 'express';
import { FeedService } from './feed.service.js';

export async function getNextFeedItem(req: Request, res: Response): Promise<void> {
  try {
    const childId = req.params.childId || (req as any).childId;
    const topic = req.query.topic as string | undefined;

    if (!childId) {
      res.status(400).json({ error: 'Missing childId parameter' });
      return;
    }

    const payload = await FeedService.getNextFeedItem(childId, topic);
    if (!payload) {
      res.status(444).json({ message: 'No more video sequences available for this goal' });
      return;
    }

    res.json(payload);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to generate feed', details: err.message });
  }
}
