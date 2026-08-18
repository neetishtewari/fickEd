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

app.use(helmet({ contentSecurityPolicy: false }));
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

// Root API Welcome Page & Interactive Route Explorer
app.get('/', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>FlickEd Enterprise Backend API</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0B0E14; color: #F9FAFB; margin: 0; padding: 40px; }
        .card { max-width: 720px; margin: 0 auto; background: #161B26; border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        h1 { margin-top: 0; color: #6366F1; font-size: 1.8rem; display: flex; align-items: center; gap: 10px; }
        .badge { background: #10B981; color: #fff; font-size: 0.75rem; padding: 4px 10px; border-radius: 12px; vertical-align: middle; }
        p { color: #9CA3AF; line-height: 1.6; }
        ul { list-style: none; padding: 0; margin-top: 24px; }
        li { margin-bottom: 12px; background: rgba(255,255,255,0.03); padding: 12px 16px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.08); display: flex; justify-content: space-between; align-items: center; }
        a { color: #06B6D4; text-decoration: none; font-weight: 600; }
        a:hover { text-decoration: underline; }
        .method { font-family: monospace; font-size: 0.8rem; padding: 3px 8px; border-radius: 6px; font-weight: 700; }
        .get { background: rgba(6,182,212,0.2); color: #06B6D4; }
        .post { background: rgba(99,102,241,0.2); color: #818CF8; }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>✨ FlickEd Backend API <span class="badge">ONLINE</span></h1>
        <p>Welcome to the production-grade backend engine for <strong>FlickEd — Flick. Learn. Unlock.</strong></p>
        
        <h3>Available API Endpoints:</h3>
        <ul>
          <li>
            <span><span class="method get">GET</span> <a href="/healthz" target="_blank">/healthz</a></span>
            <span style="color:#9CA3AF; font-size:0.85rem;">System Health Check</span>
          </li>
          <li>
            <span><span class="method get">GET</span> <a href="/metrics" target="_blank">/metrics</a></span>
            <span style="color:#9CA3AF; font-size:0.85rem;">Prometheus Telemetry</span>
          </li>
          <li>
            <span><span class="method get">GET</span> <a href="/api/v1/child/child-agrima-001/feed/next" target="_blank">/api/v1/child/child-agrima-001/feed/next</a></span>
            <span style="color:#9CA3AF; font-size:0.85rem;">Next Learning Video</span>
          </li>
          <li>
            <span><span class="method get">GET</span> <a href="/api/v1/parent/dashboard" target="_blank">/api/v1/parent/dashboard</a></span>
            <span style="color:#9CA3AF; font-size:0.85rem;">Parent Portal Summary</span>
          </li>
          <li>
            <span><span class="method post">POST</span> <code>/api/v1/child/:childId/telemetry</code></span>
            <span style="color:#9CA3AF; font-size:0.85rem;">Record Progress / Quiz</span>
          </li>
          <li>
            <span><span class="method post">POST</span> <code>/api/v1/admin/ingest/trigger</code></span>
            <span style="color:#9CA3AF; font-size:0.85rem;">Phase 3 AI Content Ingest Worker</span>
          </li>
        </ul>
      </div>
    </body>
    </html>
  `);
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
