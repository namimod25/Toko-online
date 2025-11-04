import prisma from '../config/database.js';

export const getAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50, action, userId } = req.query
    const skip = (parseInt(page) - 1) * parseInt(limit)

    const where = {}
    if (action) where.action = action
    if (userId) where.userId = parseInt(userId)

    const [auditLogs, total] = await Promise.all([
      prisma.auditlog.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      }),
      prisma.auditLog.count({ where })
    ])

    res.json({
      auditLogs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    })
  } catch (error) {
    console.error('Error fetching audit logs:', error)
    res.status(500).json({ error: 'Failed to fetch audit logs' })
  }
}