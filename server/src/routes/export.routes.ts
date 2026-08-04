import { Router } from 'express';
import { ExportController } from '../controllers/export.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Protect export paths
router.use(requireAuth);

router.get('/:resource', ExportController.exportData);

export default router;
