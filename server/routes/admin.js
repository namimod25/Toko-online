import express from 'express';
import { 
  getHeroSlides, 
  createHeroSlide, 
  updateHeroSlide, 
  deleteHeroSlide } from '../controllers/heroSlideController.js';
import { 
  getAdminProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct 
} from '../controllers/productController.js';
import { getOrders, updateOrderStatus } from '../controllers/orderController.js';
import { getUsers } from '../controllers/userController.js';
import { getDashboardStats } from '../controllers/dashboardController.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { validate, productSchema } from '../middleware/validation.js';

const router = express.Router();

// Dashboard
router.get('/dashboard', requireAuth, requireAdmin, getDashboardStats);

// Product Management
router.get('/products', requireAuth, requireAdmin, getAdminProducts);
router.post('/products', requireAuth, requireAdmin, validate(productSchema), createProduct);
router.put('/products/:id', requireAuth, requireAdmin, validate(productSchema), updateProduct);
router.delete('/products/:id', requireAuth, requireAdmin, deleteProduct);

// rute untuk heroslide management
router.get('/hero-slides', requireAuth, requireAdmin, getHeroSlides);
router.post('/hero-slides', requireAuth, requireAdmin, createHeroSlide);
router.put('/hero-slides/:id', requireAuth, requireAdmin, updateHeroSlide);
router.delete('/hero-slides/:id', requireAuth, requireAdmin, deleteHeroSlide);

// Order Management
router.get('/orders', requireAuth, requireAdmin, getOrders);
router.patch('/orders/:id/status', requireAuth, requireAdmin, updateOrderStatus);

// User Management
router.get('/users', requireAuth, requireAdmin, getUsers);

export default router;