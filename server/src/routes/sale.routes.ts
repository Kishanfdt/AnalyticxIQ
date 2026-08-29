import { Router } from 'express';
import { SaleController } from '../controllers/sale.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';
import { createSaleSchema, updateSaleSchema } from '@analyticiq/shared';
import { UserRole } from '@prisma/client';

const router = Router();

// Protect all sales routes with requireAuth
router.use(requireAuth);

// Sales CRUD endpoints
router.post('/', validateRequest(createSaleSchema), SaleController.create);
router.get('/', SaleController.getAll);
router.get('/:id', SaleController.getById);
router.put('/:id', validateRequest(updateSaleSchema), SaleController.update);
router.delete('/:id', requireRole(UserRole.OWNER, UserRole.ADMIN), SaleController.delete);

export default router;
