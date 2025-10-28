import prisma from '../config/database.js'

export const logAudit = async (useActionState, userId = null, userEmail = null, description = null, ipAddress = null, userAgent = null) => {
    try{
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
        console.log(`Audit logging: ${action} for user ${userEmail || userId || 'unknown'}`)
    }catch (error){
        console.log('Audit logging error:', error)
        console.log(`AUDIT FALLBACK - Action: ${action}, User: ${userEmail || userId || 'unknown'}, Description: ${description}`)
    }
}

//audit action
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