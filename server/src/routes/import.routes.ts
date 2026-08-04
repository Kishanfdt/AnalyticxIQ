import { Router } from 'express';
import multer from 'multer';
import { ImportController } from '../controllers/import.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Protect import paths
router.use(requireAuth);

router.post('/products', upload.single('file'), ImportController.importProducts);
router.post('/customers', upload.single('file'), ImportController.importCustomers);
router.post('/sales', upload.single('file'), ImportController.importSales);

export default router;
