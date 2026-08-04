import express, { Request, Response } from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import authRouter from './routes/auth.routes.js';
import productRouter from './routes/product.routes.js';
import customerRouter from './routes/customer.routes.js';
import { errorHandler } from './middleware/errorHandler.js';

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

// API Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/customers', customerRouter);

// Global Error Handler (must be mounted after all routes)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 AnalyticxIQ Server running on port ${PORT}`);
});
