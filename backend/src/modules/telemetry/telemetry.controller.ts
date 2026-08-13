import { Request, Response } from 'express';
import { TelemetryService, TelemetryEventDto } from './telemetry.service.js';

export async function recordTelemetryEvent(req: Request, res: Response): Promise<void> {
  try {
    const childId = req.params.childId || (req as any).childId;
    const { video_id, question_id, concept_id, event_type, watch_time_seconds, selected_option_index } = req.body;
    const idempotencyKey = req.headers['x-idempotency-key'] as string | undefined;

    if (!childId || !event_type) {
      res.status(400).json({ error: 'Missing required parameters: childId, event_type' });
      return;
    }

    const dto: TelemetryEventDto = {
      childId,
      videoId: video_id,
      questionId: question_id,
      conceptId: concept_id,
      eventType: event_type,
      watchTimeSeconds: watch_time_seconds,
      selectedOptionIndex: selected_option_index,
      idempotencyKey,
    };

    const response = await TelemetryService.recordEvent(dto);
    res.json(response);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to log telemetry event', details: err.message });
  }
}
