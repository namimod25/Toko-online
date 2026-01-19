import express from 'express';
import { 
  getHeroSlides, 
  createHeroSlide, 
  updateHeroSlide,
  deleteHeroSlide,
  toggleHeroSlide
} from '../controllers/heroSlideController.js';
import { 
  getAdminProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct, 
  updateStock
} from '../controllers/productController.js';
import { createOrder } from '../controllers/orderController.js';
import {  createUser, deleteUser, getUsers, updateUser, resetUserPassword } from '../controllers/userController.js';
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
router.patch('/products/:id/stock', requireAuth, requireAdmin, updateStock)
router.delete('/products/:id', requireAuth, requireAdmin, deleteProduct);

// rute untuk heroslide management
router.get('/hero-slides', requireAuth, requireAdmin, getHeroSlides);
router.post('/hero-slides', requireAuth, requireAdmin, createHeroSlide);
router.put('/hero-slides/:id', requireAuth, requireAdmin, updateHeroSlide);
router.get('/hero-slide/:id/toggle', requireAuth, requireAdmin, toggleHeroSlide);
router.delete('/hero-slides/:id', requireAuth, requireAdmin, deleteHeroSlide);

// Order Management
router.get('/orders', requireAuth, requireAdmin, createOrder);
router.patch('/orders/:id/status', requireAuth, requireAdmin);

// User Management
router.get('/users', requireAuth, requireAdmin, getUsers);
router.post('/users', requireAuth, requireAdmin, createUser);
router.put('/users/:id', requireAuth, requireAdmin, updateUser);
router.delete("/users/:id", requireAuth, requireAdmin, deleteUser);
router.post('/users/:id/reset-password', requireAuth, requireAdmin, resetUserPassword);
export default router;