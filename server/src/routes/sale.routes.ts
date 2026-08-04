import { Router } from 'express';
import { SaleController } from '../controllers/sale.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';
import { createSaleSchema, updateSaleSchema } from '@analyticiq/shared';

const router = Router();

// Protect all sales routes with requireAuth
router.use(requireAuth);

// Sales CRUD endpoints
router.post('/', validateRequest(createSaleSchema), SaleController.create);
router.get('/', SaleController.getAll);
router.get('/:id', SaleController.getById);
router.put('/:id', validateRequest(updateSaleSchema), SaleController.update);
router.delete('/:id', SaleController.delete);

export default router;
