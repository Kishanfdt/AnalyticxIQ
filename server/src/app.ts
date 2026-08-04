import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config/index.js';
import authRouter from './routes/auth.routes.js';
import productRouter from './routes/product.routes.js';
import customerRouter from './routes/customer.routes.js';
import saleRouter from './routes/sale.routes.js';
import analyticsRouter from './routes/analytics.routes.js';
import importRouter from './routes/import.routes.js';
import exportRouter from './routes/export.routes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/logging.middleware.js';

const app = express();

// Security Headers
app.use(helmet());

// Rate Limiting (100 requests per 15 minutes)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many requests from this IP. Please try again after 15 minutes.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Request Logging
app.use(requestLogger);

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    status: 'UP',
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
  });
});

// API Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/customers', customerRouter);
app.use('/api/v1/sales', saleRouter);
app.use('/api/v1/analytics', analyticsRouter);
app.use('/api/v1/import', importRouter);
app.use('/api/v1/export', exportRouter);

// Catch-all 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route not found: ${req.method} ${req.originalUrl}`,
    },
  });
});

// Global Error Handler (must be mounted after all routes)
app.use(errorHandler);

export default app;
export { app };
