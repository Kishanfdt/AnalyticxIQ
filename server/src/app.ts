import express, { Request, Response } from 'express';
import cors from 'cors';
import { loginSchema } from '@analyticiq/shared';
import { config } from './config/index.js';

const app = express();
const PORT = config.PORT;

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

// Test endpoint to demonstrate sharing Zod schemas
app.post('/api/v1/test-validation', (req: Request, res: Response) => {
  const parseResult = loginSchema.safeParse(req.body);

  if (!parseResult.success) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed using shared schemas',
        details: parseResult.error.errors,
      },
    });
  }

  res.json({
    success: true,
    message: 'Backend validated your payload successfully using shared package schemas!',
    data: parseResult.data,
  });
});

app.listen(PORT, () => {
  console.log(`🚀 AnalyticxIQ Server running on port ${PORT}`);
});
