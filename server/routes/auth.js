import express from 'express';
import { 
  register, 
  login, 
  logout, 
  getAuthStatus, 
  getProfile 
} from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';
import { validasiSchema, validate } from '../middleware/validation.js';
import { validateCaptcha } from '../middleware/captchaValidation.js';
import captchaGenerate from '../utils/captchaGenerator.js';

const router = express.Router();

router.get('/captcha', (req, res) => {
  try {
    const captcha = captchaGenerate.generate();
    
    // Simpan di session
    req.session.captcha = {
      text: captcha.text,
      expiresAt: captcha.expiresAt
    };

    res.json({
      success: true,
      captcha: {
        text: captcha.text,
        expiresAt: captcha.expiresAt
      }
    });
  } catch (error) {
    console.error('Captcha generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate captcha'
    });
  }
});

// Validasi captcha standalone
router.post('/validate-captcha', 
  validate(validasiSchema.captchaValidation),
  (req, res) => {
    const { captchaText } = req.body;
    
    const isValid = captchaGenerate.validate(
      captchaText,
      req.session.captcha?.text,
      req.session.captcha?.expiresAt
    );

    if (isValid) {
      // Hapus captcha dari session setelah validasi berhasil
      delete req.session.captcha;
      res.json({ success: true, message: 'Captcha valid' });
    } else {
      res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired captcha' 
      });
    }
  }
);

// Route registrasi dengan validasi captcha
router.post('/register', 
  validate(validasiSchema.userRegistration),
  validateCaptcha,
  register
);

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/auth/status', getAuthStatus);
router.get('/profile', requireAuth, getProfile);


export default router;