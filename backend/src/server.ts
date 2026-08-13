import { app } from './app.js';
import { env } from './config/env.js';

const PORT = env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`
  🚀 FlickEd Enterprise Backend API Server running on port ${PORT}
  -------------------------------------------------------------
  • Healthcheck: http://localhost:${PORT}/healthz
  • Metrics:     http://localhost:${PORT}/metrics
  • Auth API:    http://localhost:${PORT}/api/v1/auth/parent/login
  • Feed API:    http://localhost:${PORT}/api/v1/child/:childId/feed/next
  • Parent Dash: http://localhost:${PORT}/api/v1/parent/dashboard
  -------------------------------------------------------------
  `);
});
