import express from 'express';
import { 
  register, 
  login, 
  logout, 
  getAuthStatus, 
  getProfile 
} from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/auth/status', getAuthStatus);
router.get('/profile', requireAuth, getProfile);

export default router;