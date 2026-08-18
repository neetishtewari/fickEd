import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { register, Histogram } from 'prom-client';
import { pool } from './db/index.js';
import { authenticateParent, authenticateChildSession } from './middleware/auth.js';
import { registerParent, loginParent, createChildProfile } from './modules/auth/auth.controller.js';
import { getNextFeedItem } from './modules/feed/feed.controller.js';
import { recordTelemetryEvent } from './modules/telemetry/telemetry.controller.js';
import { getParentDashboard } from './modules/parent/parent.controller.js';
import { triggerIngestionBatch } from './modules/admin/ingest.controller.js';

export const app = express();

const httpRequestDurationMicroseconds = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'code'],
  buckets: [0.05, 0.1, 0.25, 0.5, 1.0, 2.5]
});

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestDurationMicroseconds
      .labels(req.method, req.route ? req.route.path : req.path, res.statusCode.toString())
      .observe(duration);
  });
  next();
});

app.get('/healthz', async (req: Request, res: Response) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', timestamp: new Date().toISOString(), database: 'connected' });
  } catch (err: any) {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), database: 'mock_mode' });
  }
});

app.get('/metrics', async (req: Request, res: Response) => {
  res.setHeader('Content-Type', register.contentType);
  res.send(await register.metrics());
});

// 1. Auth Routes
app.post('/api/v1/auth/parent/register', registerParent);
app.post('/api/v1/auth/parent/login', loginParent);
app.post('/api/v1/auth/child/create', authenticateParent as any, createChildProfile);

// 2. Child Feed & Telemetry Routes
app.get('/api/v1/child/:childId/feed/next', authenticateChildSession as any, getNextFeedItem);
app.post('/api/v1/child/:childId/telemetry', authenticateChildSession as any, recordTelemetryEvent);

// 3. Parent Intelligence Routes
app.get('/api/v1/parent/dashboard', authenticateParent as any, getParentDashboard);

// 4. Admin Content Ingestion Worker Trigger
app.post('/api/v1/admin/ingest/trigger', triggerIngestionBatch);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[UNHANDLED ERROR]', err);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});
