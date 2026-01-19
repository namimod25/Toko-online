import prisma from '../utils/database.js'

export const logAudit = async (action, userId = null, userEmail = null, description = null, ipAddress = null, userAgent = null) => {
  try {
    await prisma.auditlog.create({
      data: {
        action,
        userId: userId || undefined,
        userEmail,
        description,
        ipAddress,
        userAgent
      }
    })
    console.log(`Audit logged: ${action} for user ${userEmail || userId || 'unknown'}`)
  } catch (error) {
    console.error('Audit logging error:', error)
    console.log(`AUDIT FALLBACK - Action: ${action}, User: ${userEmail || userId || 'unknown'}, Description: ${description}`)
  }
}

// Audit actions constants
export const AUDIT_ACTIONS = {
  USER_CREATED: 'USER_CREATED',
  USER_UPDATED: 'USER_UPDATED',
  USER_DELETED: 'USER_DELETED',
  USER_BULK_ACTION: 'USER_BULK_ACTION',
  ROLE_CHANGED: 'ROLE_CHANGED',
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