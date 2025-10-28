import crypto from 'crypto'
import bcrypt from 'bcryptjs'

// Generate random token
export const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex')
}

// Generate expiry time (1 hour from now)
export const generateTokenExpiry = () => {
  const expiry = new Date()
  expiry.setHours(expiry.getHours() + 1)
  return expiry
}

// Hash token untuk disimpan di database
export const hashToken = (token) => {
  return bcrypt.hashSync(token, 12)
}

// Verify token
export const verifyToken = (token, hashedToken) => {
  return bcrypt.compareSync(token, hashedToken)
}