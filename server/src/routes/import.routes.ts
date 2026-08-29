import { Router } from 'express';
import multer from 'multer';
import { ImportController } from '../controllers/import.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowedExtensions = ['.csv', '.xlsx'];
    const allowedMimeTypes = [
      'text/csv',
      'text/plain',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'application/csv',
      'text/x-csv',
    ];
    const ext = file.originalname.toLowerCase().slice(file.originalname.lastIndexOf('.'));
    const isExtAllowed = allowedExtensions.includes(ext);
    const isMimeAllowed = allowedMimeTypes.includes(file.mimetype);

    if (isExtAllowed && isMimeAllowed) {
      cb(null, true);
    } else {
      cb(new Error('Only .csv and .xlsx files are allowed'));
    }
  },
});

// Protect import paths
router.use(requireAuth);

router.post('/products', upload.single('file'), ImportController.importProducts);
router.post('/customers', upload.single('file'), ImportController.importCustomers);
router.post('/sales', upload.single('file'), ImportController.importSales);

export default router;
