import express from 'express'
import { 
  forgotPassword, 
  resetPassword, 
  changePassword, 
  validateResetToken 
} from '../controllers/passwordController.js'
import { validate } from '../middleware/validation.js'
import { 
  forgotPasswordSchema, 
  resetPasswordSchema, 
  changePasswordSchema 
} from '../middleware/validation.js'
import { requireAuth } from '../middleware/auth.js'

const router = express.Router()

// Public routes
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword)
router.post('/reset-password', validate(resetPasswordSchema), resetPassword)
router.get('/validate-reset-token', validateResetToken)

// Protected routes (require login)
router.post('/change-password', requireAuth, validate(changePasswordSchema), changePassword)

export default router