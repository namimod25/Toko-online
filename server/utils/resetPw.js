import crypto from 'crypto'
import bcrypt from 'bcryptjs'

// Generate random hex token
export const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex')
}

// Generate expiry time 
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

// Format token dengan prefix untuk response
export const validasiTokenFormat = (token) => {
  return `reset_${token}`
}

// Parse token - remove prefix if exists
export const parseTokenFromRequest = (token) => {
  return token.replace('reset_', '')
}