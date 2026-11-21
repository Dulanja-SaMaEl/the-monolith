import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { isBackendSupabaseConfigured } from './services/supabase';
import projectsRouter from './routes/projects';
import clientsRouter from './routes/clients';
import partnersRouter from './routes/partners';
import billingRouter from './routes/billing';
import meetingsRouter from './routes/meetings';
import reviewsRouter from './routes/reviews';
import postsRouter from './routes/posts';
import inquiriesRouter from './routes/inquiries';
import tasksRouter from './routes/tasks';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 10000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const ALLOWED_ORIGINS = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map((url) => url.trim().replace(/\/$/, ''))
  .filter(Boolean);

// Production Security Headers
app.disable('x-powered-by');
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Strict Production-Ready CORS
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const normalized = origin.replace(/\/$/, '');
      if (
        ALLOWED_ORIGINS.includes(normalized) ||
        normalized.endsWith('.vercel.app') ||
        (NODE_ENV !== 'production' && (normalized.includes('localhost') || normalized.includes('127.0.0.1')))
      ) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} not allowed by CORS policy`));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '1mb' }));

// Root & Telemetry Health Endpoints
app.get('/', (_req: Request, res: Response) => {
  res.json({
    service: 'Monolith LK Enterprise API',
    status: 'ONLINE',
    health: '/api/health',
  });
});

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ONLINE',
    service: 'Monolith LK Enterprise Backend',
    environment: NODE_ENV,
    databaseConfigured: isBackendSupabaseConfigured,
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Mount API Routes
app.use('/api/projects', projectsRouter);
app.use('/api/clients', clientsRouter);
app.use('/api/partners', partnersRouter);
app.use('/api/billing', billingRouter);
app.use('/api/meetings', meetingsRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/posts', postsRouter);
app.use('/api/inquiries', inquiriesRouter);
app.use('/api/tasks', tasksRouter);

// 404 Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled Server Exception:', err);
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    ...(NODE_ENV !== 'production' ? { message: err.message } : {}),
  });
});

app.listen(PORT, () => {
  console.log(`⚡ Monolith LK Backend online on port ${PORT} (${NODE_ENV})`);
});
