import express from 'express';
import { 
  register, 
  logout, 
  getAuthStatus, 
  getProfile,
  login,
  loginWithCaptcha
} from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';
import { loginWithCapchaSchema, validate } from '../middleware/validation.js';
import verifyRecaptchaMiddleware from '../middleware/recaptcha.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/auth/status', getAuthStatus);
router.get('/profile', requireAuth, getProfile);

router.post(
  '/login-with-captcha',
  validate(loginWithCapchaSchema),
  verifyRecaptchaMiddleware,
  loginWithCaptcha
)

export default router;