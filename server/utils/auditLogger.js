import prisma from '../utils/database.js'

export const logAudit = async (action, userId = null, userEmail = null, description = null, ipAddress = null, userAgent = null) => {
  try {
    await prisma.auditlog.create({
      data: {
        action,
        userId,
        userEmail,
        description,
        ipAddress,
        userAgent
      }
    })
  } catch (error) {
    console.error('Audit logging error:', error)
  }
}

// Audit actions
export const AUDIT_ACTIONS = {
  PASSWORD_RESET_REQUEST: 'PASSWORD_RESET_REQUEST',
  PASSWORD_RESET_SUCCESS: 'PASSWORD_RESET_SUCCESS', 
  PASSWORD_RESET_FAILED: 'PASSWORD_RESET_FAILED',
  PASSWORD_CHANGED: 'PASSWORD_CHANGED',
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  REGISTER: 'REGISTER',
  LOGIN_FAILED: 'LOGIN_FAILED',
  PROFILE_UPDATE: 'PROFILE_UPDATE',
  PRODUCT_VIEW: 'PRODUCT_VIEW',
  ORDER_CREATED: 'ORDER_CREATED',
  ORDER_UPDATED: 'ORDER_UPDATED'
}