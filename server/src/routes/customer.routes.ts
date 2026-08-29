import { Router } from 'express';
import { CustomerController } from '../controllers/customer.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';
import { createCustomerSchema, updateCustomerSchema } from '@analyticiq/shared';
import { UserRole } from '@prisma/client';

const router = Router();

// Protect all customer routes with requireAuth
router.use(requireAuth);

// Customer CRUD endpoints
router.post('/', validateRequest(createCustomerSchema), CustomerController.create);
router.get('/', CustomerController.getAll);
router.get('/:id', CustomerController.getById);
router.put('/:id', validateRequest(updateCustomerSchema), CustomerController.update);
router.delete('/:id', requireRole(UserRole.OWNER, UserRole.ADMIN), CustomerController.delete);

export default router;
