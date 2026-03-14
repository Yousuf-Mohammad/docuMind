import { Router } from 'express';
import { ask } from '../controllers/askController.js';
import { validateBody } from '../middlewares/validate.js';
import { askBodySchema } from '../utils/validation.js';

const router = Router();
router.post('/', validateBody(askBodySchema), ask);
export default router;
