import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Protect all analytics routes with requireAuth
router.use(requireAuth);

// Analytics endpoints
router.get('/overview', AnalyticsController.getOverview);
router.get('/products', AnalyticsController.getProducts);
router.get('/customers', AnalyticsController.getCustomers);
router.get('/categories', AnalyticsController.getCategories);
router.get('/trends', AnalyticsController.getTrends);

export default router;
