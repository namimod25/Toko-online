import express from 'express'
import { changePasswordSchema, forgotPasswordSchema, resetPasswordSchema, validate } from '../middleware/validation'
import { changePassword, forgotPassword, resetPassword, validateResetToken } from '../controllers/passwordController'
import { requireAuth } from '../middleware/auth'
import { validate } from '../middleware/validation'


const router = express.Router()



// public schema
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword)
router.post('/reset-password', validate(resetPasswordSchema), resetPassword)
router.get('/validate-reset-token', validateResetToken)

//protexct rute(login)
router.post('/change-password', requireAuth, validate(changePasswordSchema), changePassword)

export default router
