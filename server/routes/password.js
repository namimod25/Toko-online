import express from 'express'
import {
  forgotPassword,
  resetPassword,
  verifyResetToken,
  validateResetToken
} from '../controllers/passwordController.js'

const router = express.Router()

// Public routes
router.post('/forgot-password', forgotPassword)
router.post('/verify-token', verifyResetToken)
router.get('/validate-reset-token', validateResetToken)
router.post('/reset-password', resetPassword)




export default router