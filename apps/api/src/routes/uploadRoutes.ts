import { Router } from 'express';
import multer from 'multer';
import { uploadPdf } from '../controllers/uploadController.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      cb(new Error('Only PDF files are allowed'));
      return;
    }
    cb(null, true);
  },
});

const router = Router();
router.post('/', upload.single('file'), uploadPdf);
export default router;
