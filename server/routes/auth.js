import { loginWithCaptcha } from '../controllers/authController.js'
import { verifyRecaptchaMiddleware } from '../middleware/recaptcha.js'
import { validate } from '../middleware/validation.js'
import { loginWithCaptchaSchema } from '../middleware/validation.js'

// Tambahkan route login dengan CAPTCHA
router.post('/login-with-captcha', 
  validate(loginWithCaptchaSchema), 
  verifyRecaptchaMiddleware, 
  loginWithCaptcha
)

// Keep existing login route for backward compatibility
router.post('/login', login)