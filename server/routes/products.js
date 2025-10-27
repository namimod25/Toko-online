import express from 'express';
import { 
  getProducts, 
  getProductById 
} from '../controllers/productController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', requireAuth, getProducts);
router.get('/:id', requireAuth, getProductById);

export default router;