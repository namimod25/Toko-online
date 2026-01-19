import prisma from '../utils/database.js'
import bcrypt from 'bcryptjs'
import { 
  generateResetToken, 
  generateTokenExpiry, 
  hashToken, 
  verifyToken,
  validasiTokenFormat,
  parseTokenFromRequest
} from '../utils/resetPw.js'
import { logAudit, AUDIT_ACTIONS } from '../utils/auditLogger.js'

// Request password reset - generate token
export const forgotPassword = async (req, res) => {
  try {
    console.log('=== FORGOT PASSWORD REQUEST ===')
    const { email } = req.body
    console.log('Email:', email)

    // Cari user by email
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      console.log('User not found for email:', email)
      await logAudit(
        AUDIT_ACTIONS.PASSWORD_RESET_FAILED,
        null,
        email,
        'User not found',
        req.ip,
        req.get('User-Agent')
      )
      return res.status(404).json({ error: 'Email tidak ditemukan' })
    }

    console.log('User found:', user.id, user.email)

    // Generate reset token
    const rawToken = generateResetToken()
    const tokenExpiry = generateTokenExpiry()
    const hashedToken = await hashToken(rawToken)

    console.log('Generated token info:')
    console.log('- Raw token:', rawToken)
    console.log('- Hashed token (first 20 chars):', hashedToken.substring(0, 20))
    console.log('- Expiry:', tokenExpiry)

    // Hapus existing reset tokens untuk email ini
    const deleted = await prisma.passwordReset.deleteMany({
      where: { email }
    })
    console.log('Deleted existing tokens:', deleted.count)

    // Simpan reset token di database
    const resetRecord = await prisma.passwordReset.create({
      data: {
        email,
        token: hashedToken,
        expiresAt: tokenExpiry
      }
    })

    console.log('Saved reset record:', {
      id: resetRecord.id,
      email: resetRecord.email,
      expiresAt: resetRecord.expiresAt,
      tokenLength: hashedToken.length
    })

    // Format token untuk response (tambahkan prefix)
    const formattedToken = validasiTokenFormat(rawToken)

    await logAudit(
      AUDIT_ACTIONS.PASSWORD_RESET_REQUEST,
      user.id,
      user.email,
      'Password reset token generated',
      req.ip,
      req.get('User-Agent')
    )

    res.json({ 
      message: 'Reset token berhasil dibuat',
      resetToken: formattedToken,
      email: email,
      expiresAt: tokenExpiry.toISOString()
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
    res.status(500).json({ error: 'Gagal memproses permintaan reset password' })
  }
}

// Reset password dengan token
export const resetPassword = async (req, res) => {
  try {
    console.log('=== RESET PASSWORD REQUEST ===')
    
    let { token, email, password } = req.body
    console.log('Request data:', { 
      token: token ? `${token.substring(0, 20)}...` : 'empty',
      email,
      passwordLength: password?.length 
    })

    // Parse token (remove prefix jika ada)
    token = parseTokenFromRequest(token)
    

    if (!token || !email || !password) {
      console.log('Missing required fields')
      return res.status(400).json({ error: 'Token, email, dan password diperlukan' })
    }

    // Validasi token dari database
    const resetRecord = await prisma.passwordReset.findFirst({
      where: { email }
    })

    console.log('Reset record from DB:', resetRecord ? {
      id: resetRecord.id,
      email: resetRecord.email,
      used: resetRecord.used,
      expiresAt: resetRecord.expiresAt,
      tokenLength: resetRecord.token?.length,
      currentTime: new Date().toISOString()
    } : 'Not found')

    if (!resetRecord) {
      await logAudit(
        AUDIT_ACTIONS.PASSWORD_RESET_FAILED,
        null,
        email,
        'Reset token not found in database',
        req.ip,
        req.get('User-Agent')
      )
      return res.status(400).json({ error: 'Token reset tidak ditemukan' })
    }

    // Cek jika token sudah digunakan
    if (resetRecord.used) {
      console.log('Token already used')
      await logAudit(
        AUDIT_ACTIONS.PASSWORD_RESET_FAILED,
        null,
        email,
        'Reset token already used',
        req.ip,
        req.get('User-Agent')
      )
      return res.status(400).json({ error: 'Token reset sudah digunakan' })
    }

    // Cek jika token expired
    const now = new Date()
    const expiryDate = new Date(resetRecord.expiresAt)
    console.log('Token expiry check:', {
      now: now.toISOString(),
      expiry: expiryDate.toISOString(),
      isExpired: now > expiryDate
    })

    if (now > expiryDate) {
      console.log('Token expired')
      await logAudit(
        AUDIT_ACTIONS.PASSWORD_RESET_FAILED,
        null,
        email,
        'Reset token expired',
        req.ip,
        req.get('User-Agent')
      )
      return res.status(400).json({ error: 'Token reset sudah kadaluarsa' })
    }

    // Verify token
    console.log('Verifying token...')
    const isTokenValid = await verifyToken(token, resetRecord.token)
    console.log('Token verification result:', isTokenValid)

    if (!isTokenValid) {
      console.log('Token verification failed')
      console.log('Input token (first 20):', token.substring(0, 20))
      console.log('DB token (first 20):', resetRecord.token.substring(0, 20))
      
      await logAudit(
        AUDIT_ACTIONS.PASSWORD_RESET_FAILED,
        null,
        email,
        'Token verification failed',
        req.ip,
        req.get('User-Agent')
      )
      return res.status(400).json({ error: 'Token reset tidak valid' })
    }

    // Cari user
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      console.log('User not found')
      await logAudit(
        AUDIT_ACTIONS.PASSWORD_RESET_FAILED,
        null,
        email,
        'User not found for reset',
        req.ip,
        req.get('User-Agent')
      )
      return res.status(400).json({ error: 'User tidak ditemukan' })
    }

    console.log('User found:', user.id, user.email)

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12)

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

    // Log audit
    await logAudit(
      AUDIT_ACTIONS.PASSWORD_RESET_SUCCESS,
      user.id,
      user.email,
      'Password reset successfully',
      req.ip,
      req.get('User-Agent')
    )

    console.log('Password reset successful for user:', user.email)

    res.json({ 
      success: true,
      message: 'Password berhasil direset' 
    })

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
    res.status(500).json({ error: 'Gagal mereset password' })
  }
}

// Validate reset token
export const validateResetToken = async (req, res) => {
  try {
    console.log('=== VALIDATE TOKEN REQUEST ===')
    
    let { token, email } = req.query
    console.log('Validation request:', { 
      token: token ? `${token.substring(0, 20)}...` : 'empty',
      email 
    })

    if (!token || !email) {
      console.log('Missing token or email')
      return res.status(400).json({ 
        valid: false, 
        error: 'Token dan email diperlukan' 
      })
    }

    // Parse token
    token = parseTokenFromRequest(token)
    console.log('Parsed token for validation:', token.substring(0, 20) + '...')

    const resetRecord = await prisma.passwordReset.findFirst({
      where: { email }
    })

    console.log('Reset record found:', !!resetRecord)

    if (!resetRecord) {
      return res.status(400).json({ 
        valid: false, 
        error: 'Token reset tidak ditemukan' 
      })
    }

    // Cek berbagai kondisi
    if (resetRecord.used) {
      console.log('Token already used')
      return res.status(400).json({ 
        valid: false, 
        error: 'Token sudah digunakan' 
      })
    }

    const now = new Date()
    const expiryDate = new Date(resetRecord.expiresAt)
    
    if (now > expiryDate) {
      console.log('Token expired')
      return res.status(400).json({ 
        valid: false, 
        error: 'Token sudah kadaluarsa' 
      })
    }

    // Verify token
    const isTokenValid = await verifyToken(token, resetRecord.token)
    console.log('Token validation result:', isTokenValid)

    if (!isTokenValid) {
      console.log('Token verification failed')
      return res.status(400).json({ 
        valid: false, 
        error: 'Token tidak valid' 
      })
    }

    console.log('Token is valid')
    res.json({ 
      valid: true,
      email,
      expiresAt: resetRecord.expiresAt 
    })

  } catch (error) {
    console.error('Validate token error:', error)
    res.status(500).json({ 
      valid: false,
      error: 'Gagal memvalidasi token' 
    })
  }
}

// Verify reset token
export const verifyResetToken = async (req, res) => {
  try {
    const { token, email } = req.body

    // Validasi format token
    if (!validasiTokenFormat(token)) {
      return res.status(400).json({ 
        valid: false, 
        error: 'Token harus berupa 6 digit angka' 
      })
    }

    // Validasi token di database
    const resetRecord = await prisma.passwordReset.findFirst({
      where: { email }
    })

    if (!resetRecord) {
      return res.status(400).json({ 
        valid: false, 
        error: 'Token tidak valid atau sudah kadaluarsa' 
      })
    }

    // Cek jika token sudah digunakan
    if (resetRecord.used) {
      return res.status(400).json({ 
        valid: false, 
        error: 'Token sudah digunakan' 
      })
    }

    // Cek jika token expired
    if (new Date() > resetRecord.expiresAt) {
      return res.status(400).json({ 
        valid: false, 
        error: 'Token sudah kadaluarsa' 
      })
    }

    // Verify token
    if (!verifyToken(token, resetRecord.token)) {
      return res.status(400).json({ 
        valid: false, 
        error: 'Token tidak valid' 
      })
    }

    res.json({ 
      valid: true,
      message: 'Token valid' 
    })

  } catch (error) {
    console.error('Verify token error:', error)
    res.status(500).json({ 
      valid: false,
      error: 'Gagal memverifikasi token' 
    })
  }
}