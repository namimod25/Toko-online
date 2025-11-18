import express from 'express';
import { login, logout, getAuthStatus } from '../controllers/authController.js';
import { validateLoginInput } from '../middleware/validation.js';
import { requireNoAuth, requireAuth } from '../middleware/auth.js';

const router = express.Router();


router.post('/login', requireNoAuth, validateLoginInput, login);

router.post('/logout', requireAuth, logout);

router.get('/status', getAuthStatus);

export default router;