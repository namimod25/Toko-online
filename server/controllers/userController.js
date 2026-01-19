import prisma from '../utils/database.js'
import bcrypt from 'bcryptjs'
import { logAudit, AUDIT_ACTIONS } from '../utils/auditLogger.js'


export const getUsers = async (req, res) => {
  try {
    console.log('Fetching users from database...')
    
    const { page = 1, limit = 10, search = '' } = req.query
    const skip = (parseInt(page) - 1) * parseInt(limit)

    const where = search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    } : {}

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: { orders: true }
          }
        }
      }),
      prisma.user.count({ where })
    ])

    console.log(`Found ${users.length} users`)

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    res.status(500).json({ 
      error: 'Failed to fetch users',
      details: error.message 
    })
  }
}

// Create new user (admin only)
export const createUser = async (req, res) => {
  try {
    console.log('Creating new user with data:', req.body)
    
    const { name, email, password, role = 'CUSTOMER' } = req.body

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      await logAudit(
        AUDIT_ACTIONS.REGISTER,
        null,
        email,
        'User creation failed - email already exists',
        req.ip,
        req.get('User-Agent')
      )
      return res.status(400).json({ error: 'User with this email already exists' })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    })

    // Audit log
    await logAudit(
      AUDIT_ACTIONS.REGISTER,
      user.id,
      user.email,
      `User created by admin ${req.session.user.email}`,
      req.ip,
      req.get('User-Agent')
    )

    console.log('User created successfully:', user)

    res.status(201).json({
      message: 'User created successfully',
      user
    })
  } catch (error) {
    console.error('Error creating user:', error)
    await logAudit(
      AUDIT_ACTIONS.REGISTER,
      null,
      req.body.email,
      `User creation error: ${error.message}`,
      req.ip,
      req.get('User-Agent')
    )
    res.status(500).json({ 
      error: 'Failed to create user',
      details: error.message 
    })
  }
}

// Update user
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params
    const { name, email, role } = req.body

    //cek user jika user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: parseInt(id) }
    })

    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Check if new email is already taken by another user
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email }
      })

      if (emailExists) {
        return res.status(400).json({ error: 'Email already taken' })
      }
    }

    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(role && { role })
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        updatedAt: true
      }
    })

    // Audit log
    await logAudit(
      AUDIT_ACTIONS.PROFILE_UPDATE,
      user.id,
      user.email,
      `User updated by admin ${req.session.user.email}`,
      req.ip,
      req.get('User-Agent')
    )

    res.json({
      message: 'User updated successfully',
      user
    })
  } catch (error) {
    console.error('Error updating user:', error)
    res.status(500).json({ 
      error: 'Failed to update user',
      details: error.message 
    })
  }
}

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) }
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Jangan izinkan penghapusan diri sendiri
    if (user.id === req.session.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' })
    }

    await prisma.user.delete({
      where: { id: parseInt(id) }
    })

    // Audit log
    await logAudit(
      AUDIT_ACTIONS.PROFILE_UPDATE,
      user.id,
      user.email,
      `User deleted by admin ${req.session.user.email}`,
      req.ip,
      req.get('User-Agent')
    )

    res.json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('Error deleting user:', error)
    res.status(500).json({ 
      error: 'Failed to delete user',
      details: error.message 
    })
  }
}

// Reset user password (admin only)
export const resetUserPassword = async (req, res) => {
  try {
    const { id } = req.params
    const { newPassword } = req.body

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' })
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) }
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12)

    await prisma.user.update({
      where: { id: parseInt(id) },
      data: { password: hashedPassword }
    })

    // Audit log
    await logAudit(
      AUDIT_ACTIONS.PASSWORD_CHANGED,
      user.id,
      user.email,
      `Password reset by admin ${req.session.user.email}`,
      req.ip,
      req.get('User-Agent')
    )

    res.json({ message: 'Password reset successfully' })
  } catch (error) {
    console.error('Error resetting password:', error)
    res.status(500).json({ 
      error: 'Failed to reset password',
      details: error.message 
    })
  }
}