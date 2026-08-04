import { Router } from 'express';
import { ProductController } from '../controllers/product.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';
import { createProductSchema, updateProductSchema } from '@analyticiq/shared';

const router = Router();

// Protect all product routes with requireAuth
router.use(requireAuth);

// Product CRUD endpoints
router.post('/', validateRequest(createProductSchema), ProductController.create);
router.get('/', ProductController.getAll);
router.get('/:id', ProductController.getById);
router.put('/:id', validateRequest(updateProductSchema), ProductController.update);
router.delete('/:id', ProductController.delete);

export default router;
