import bcryptjs from 'bcryptjs'
import crypto from 'crypto'

export const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex')
}


export const generateTokenExpiry = () => {
  const expiry = new Date()
  expiry.setHours(expiry.getHours() + 1)
  return expiry
}


export const hashToken = (token) => {
  return bcryptjs.hashSync(token, 12)
}

// Verify token
export const verifyToken = (token, hashedToken) => {
  return bcryptjs.compareSync(token, hashedToken)
}