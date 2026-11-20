import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import projectsRouter from './routes/projects';
import clientsRouter from './routes/clients';
import partnersRouter from './routes/partners';
import billingRouter from './routes/billing';
import meetingsRouter from './routes/meetings';
import reviewsRouter from './routes/reviews';
import postsRouter from './routes/posts';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin) return callback(null, true);
      // Allow configured frontend and any vercel preview deployments
      if (
        origin === FRONTEND_URL ||
        origin.endsWith('.vercel.app') ||
        origin.includes('localhost')
      ) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive in dev/staging
    },
    credentials: true,
  })
);

app.use(express.json());

// Telemetry & Health Endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ONLINE',
    service: 'Monolith LK Enterprise Backend',
    region: 'Render Singapore Cluster',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/projects', projectsRouter);
app.use('/api/clients', clientsRouter);
app.use('/api/partners', partnersRouter);
app.use('/api/billing', billingRouter);
app.use('/api/meetings', meetingsRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/posts', postsRouter);

// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: any) => {
  console.error('Unhandled Server Exception:', err);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

app.listen(PORT, () => {
  console.log(`⚡ Monolith LK Backend Cluster online at http://localhost:${PORT}`);
});
