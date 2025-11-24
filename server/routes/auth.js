import express from 'express';
import { login, logout, getAuthStatus, register } from '../controllers/authController.js';
import { requireNoAuth, requireAuth } from '../middleware/auth.js';

const router = express.Router();


router.post('/login', requireNoAuth, login);

router.post('/logout', requireAuth, logout);

router.post('/register', requireAuth, register);

router.get('/status', getAuthStatus);

export default router;