import prisma from '../utils/database.js'
import bcryptjs from 'bcryptjs'

import { 
  generateResetToken, 
  generateTokenExpiry, 
  hashToken, 
  verifyToken 
} from '../utils/resetPw.js'
import { sendPasswordResetEmail, sendPasswordChangedEmail } from '../utils/emailServices.js'
import { logAudit, AUDIT_ACTIONS } from '../utils/auditLogger.js'

// Request password reset
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body

    // Cari user by email
    const user = await prisma.user.findUnique({
      where: { email }
    })

    // Always return success even if email doesn't exist (for security)
    if (!user) {
      console.log(`Password reset requested for non-existent email: ${email}`)
      await logAudit(
        AUDIT_ACTIONS.PASSWORD_RESET_REQUEST,
        null,
        email,
        'Password reset requested for non-existent email',
        req.ip,
        req.get('User-Agent')
      )
      return res.json({ 
        message: 'If the email exists, a password reset link has been sent' 
      })
    }

    // Generate reset token
    const resetToken = generateResetToken()
    const tokenExpiry = generateTokenExpiry()

    // Hapus existing reset tokens untuk email ini
    await prisma.passwordReset.deleteMany({
      where: { email }
    })

    // Simpan reset token di database
    await prisma.passwordReset.create({
      data: {
        email,
        token: hashToken(resetToken),
        expiresAt: tokenExpiry
      }
    })

    // Kirim email reset password
    const emailSent = await sendPasswordResetEmail(email, resetToken)

    if (!emailSent) {
      await logAudit(
        AUDIT_ACTIONS.PASSWORD_RESET_FAILED,
        user.id,
        user.email,
        'Failed to send reset email',
        req.ip,
        req.get('User-Agent')
      )
      return res.status(500).json({ error: 'Failed to send reset email' })
    }

    // Log audit
    await logAudit(
      AUDIT_ACTIONS.PASSWORD_RESET_REQUEST,
      user.id,
      user.email,
      'Password reset requested successfully',
      req.ip,
      req.get('User-Agent')
    )

    res.json({ 
      message: 'If the email exists, a password reset link has been sent' 
    })

  } catch (error) {
    console.error('Forgot password error:', error)
    await logAudit(
      AUDIT_ACTIONS.PASSWORD_RESET_FAILED,
      null,
      req.body.email,
      `Error: ${error.message}`,
      req.ip,
      req.get('User-Agent')
    )
    res.status(500).json({ error: 'Failed to process password reset request' })
  }
}

// Reset password dengan token
export const resetPassword = async (req, res) => {
  try {
    const { token, email, password } = req.body

    // Validasi token
    const resetRecord = await prisma.passwordReset.findFirst({
      where: { email }
    })

    if (!resetRecord) {
      await logAudit(
        AUDIT_ACTIONS.PASSWORD_RESET_FAILED,
        null,
        email,
        'Invalid or expired reset token',
        req.ip,
        req.get('User-Agent')
      )
      return res.status(400).json({ error: 'Invalid or expired reset token' })
    }

    // Cek jika token sudah digunakan
    if (resetRecord.used) {
      await logAudit(
        AUDIT_ACTIONS.PASSWORD_RESET_FAILED,
        null,
        email,
        'Reset token already used',
        req.ip,
        req.get('User-Agent')
      )
      return res.status(400).json({ error: 'Reset token has already been used' })
    }

    // Cek jika token expired
    if (new Date() > resetRecord.expiresAt) {
      await logAudit(
        AUDIT_ACTIONS.PASSWORD_RESET_FAILED,
        null,
        email,
        'Reset token expired',
        req.ip,
        req.get('User-Agent')
      )
      return res.status(400).json({ error: 'Reset token has expired' })
    }

    // Verify token
    if (!verifyToken(token, resetRecord.token)) {
      await logAudit(
        AUDIT_ACTIONS.PASSWORD_RESET_FAILED,
        null,
        email,
        'Invalid reset token',
        req.ip,
        req.get('User-Agent')
      )
      return res.status(400).json({ error: 'Invalid reset token' })
    }

    // Cari user
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      await logAudit(
        AUDIT_ACTIONS.PASSWORD_RESET_FAILED,
        null,
        email,
        'User not found for reset',
        req.ip,
        req.get('User-Agent')
      )
      return res.status(400).json({ error: 'User not found' })
    }

    // Hash new password
    const hashedPassword = await bcryptjs.hash(password, 12)

    // Update user password
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword }
    })

    // Mark token as used
    await prisma.passwordReset.update({
      where: { id: resetRecord.id },
      data: { used: true }
    })

    // Hapus semua reset tokens untuk user ini
    await prisma.passwordReset.deleteMany({
      where: { email }
    })

    // Kirim notification email
    await sendPasswordChangedEmail(email)

    // Log audit
    await logAudit(
      AUDIT_ACTIONS.PASSWORD_RESET_SUCCESS,
      user.id,
      user.email,
      'Password reset successfully',
      req.ip,
      req.get('User-Agent')
    )

    res.json({ message: 'Password has been reset successfully' })

  } catch (error) {
    console.error('Reset password error:', error)
    await logAudit(
      AUDIT_ACTIONS.PASSWORD_RESET_FAILED,
      null,
      req.body.email,
      `Error: ${error.message}`,
      req.ip,
      req.get('User-Agent')
    )
    res.status(500).json({ error: 'Failed to reset password' })
  }
}

// Change password (untuk logged-in users)
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    const userId = req.session.user.id

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Verify current password
    const isCurrentPasswordValid = await bcryptjs.compare(currentPassword, user.password)
    if (!isCurrentPasswordValid) {
      await logAudit(
        AUDIT_ACTIONS.PASSWORD_RESET_FAILED,
        userId,
        user.email,
        'Current password incorrect',
        req.ip,
        req.get('User-Agent')
      )
      return res.status(400).json({ error: 'Current password is incorrect' })
    }

    // Hash new password
    const hashedPassword = await bcryptjs.hash(newPassword, 12)

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    })

    // Kirim notification email
    await sendPasswordChangedEmail(user.email)

    // Log audit
    await logAudit(
      AUDIT_ACTIONS.PASSWORD_CHANGED,
      userId,
      user.email,
      'Password changed successfully',
      req.ip,
      req.get('User-Agent')
    )

    res.json({ message: 'Password has been changed successfully' })

  } catch (error) {
    console.error('Change password error:', error)
    await logAudit(
      AUDIT_ACTIONS.PASSWORD_RESET_FAILED,
      req.session.user.id,
      req.session.user.email,
      `Error: ${error.message}`,
      req.ip,
      req.get('User-Agent')
    )
    res.status(500).json({ error: 'Failed to change password' })
  }
}

// Validasi reset token
export const validateResetToken = async (req, res) => {
  try {
    const { token, email } = req.query

    if (!token || !email) {
      return res.status(400).json({ error: 'Token and email are required' })
    }

    const resetRecord = await prisma.passwordReset.findFirst({
      where: { email }
    })

    if (!resetRecord) {
      return res.status(400).json({ valid: false, error: 'Invalid reset token' })
    }

    // Cek kondisi
    if (resetRecord.used) {
      return res.status(400).json({ valid: false, error: 'Token has already been used' })
    }

    if (new Date() > resetRecord.expiresAt) {
      return res.status(400).json({ valid: false, error: 'Token has expired' })
    }

    if (!verifyToken(token, resetRecord.token)) {
      return res.status(400).json({ valid: false, error: 'Invalid token' })
    }

    res.json({ valid: true })

  } catch (error) {
    console.error('Validate token error:', error)
    res.status(500).json({ error: 'Failed to validate token' })
  }
}