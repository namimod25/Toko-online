import prisma from "../utils/database.js";
import {logAudit, AUDIT_ACTIONS} from '../utils/auditLogger.js';


// customer profile
export const getCustomerProfile = async (req, res) => {
  try {
    const userId = req.session.user.id

    const profile = await prisma.userProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true
          }
        }
      }
    })

    // Jika belum ada profile, buat default
    if (!profile) {
      const newProfile = await prisma.userProfile.create({
        data: { userId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              createdAt: true
            }
          }
        }
      })

      await logAudit(
        AUDIT_ACTIONS.PROFILE_UPDATE,
        userId,
        req.session.user.email,
        'Customer profile created',
        req.ip,
        req.get('User-Agent')
      )

      return res.json(newProfile)
    }

    res.json(profile)
  } catch (error) {
    console.error('Error fetching customer profile:', error)
    res.status(500).json({ error: 'Failed to fetch profile' })
  }
}

// Update customer profile
export const updateCustomerProfile = async (req, res) => {
  try {
    const userId = req.session.user.id
    const { phone, address, city, postalCode, country, avatar, bio } = req.body

    const profile = await prisma.userProfile.upsert({
      where: { userId },
      update: {
        phone,
        address,
        city,
        postalCode,
        country,
        avatar,
        bio
      },
      create: {
        userId,
        phone,
        address,
        city,
        postalCode,
        country,
        avatar,
        bio
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true
          }
        }
      }
    })

    await logAudit(
      AUDIT_ACTIONS.PROFILE_UPDATE,
      userId,
      req.session.user.email,
      'Customer profile updated',
      req.ip,
      req.get('User-Agent')
    )

    res.json({
      message: 'Profile updated successfully',
      profile
    })
  } catch (error) {
    console.error('Error updating customer profile:', error)
    res.status(500).json({ error: 'Failed to update profile' })
  }
}

//  customer orders
export const getCustomerOrders = async (req, res) => {
  try {
    const userId = req.session.user.id
    const { page = 1, limit = 10, status } = req.query
    const skip = (parseInt(page) - 1) * parseInt(limit)

    const where = { userId }
    if (status) where.status = status

    const [orders, total] = await Promise.all([
      prisma.userOrder.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.userOrder.count({ where })
    ])

    res.json({
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    })
  } catch (error) {
    console.error('Error fetching customer orders:', error)
    res.status(500).json({ error: 'Failed to fetch orders' })
  }
}

// Create order (simulate checkout)
export const createOrder = async (req, res) => {
  try {
    const userId = req.session.user.id
    const { items, total } = req.body

    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    const order = await prisma.userOrder.create({
      data: {
        userId,
        orderNumber,
        total,
        status: 'PENDING',
        items
      }
    })

    await logAudit(
      AUDIT_ACTIONS.ORDER_CREATED,
      userId,
      req.session.user.email,
      `Order created: ${orderNumber}`,
      req.ip,
      req.get('User-Agent')
    )

    res.status(201).json({
      message: 'Order created successfully',
      order
    })
  } catch (error) {
    console.error('Error creating order:', error)
    res.status(500).json({ error: 'Failed to create order' })
  }
}

// Get wishlist
export const getWishlist = async (req, res) => {
  try {
    const userId = req.session.user.id

    const wishlist = await prisma.wishlist.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            image: true,
            category: true,
            stock: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    res.json(wishlist)
  } catch (error) {
    console.error('Error fetching wishlist:', error)
    res.status(500).json({ error: 'Failed to fetch wishlist' })
  }
}

// Add to wishlist
export const addToWishlist = async (req, res) => {
  try {
    const userId = req.session.user.id
    const { productId } = req.body

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) }
    })

    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }

    // Check if already in wishlist
    const existing = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId,
          productId: parseInt(productId)
        }
      }
    })

    if (existing) {
      return res.status(400).json({ error: 'Product already in wishlist' })
    }

    const wishlistItem = await prisma.wishlist.create({
      data: {
        userId,
        productId: parseInt(productId)
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            image: true
          }
        }
      }
    })

    await logAudit(
      AUDIT_ACTIONS.PROFILE_UPDATE,
      userId,
      req.session.user.email,
      `Added to wishlist: ${product.name}`,
      req.ip,
      req.get('User-Agent')
    )

    res.status(201).json({
      message: 'Added to wishlist',
      wishlistItem
    })
  } catch (error) {
    console.error('Error adding to wishlist:', error)
    res.status(500).json({ error: 'Failed to add to wishlist' })
  }
}

// Remove from wishlist
export const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.session.user.id
    const { productId } = req.params

    await prisma.wishlist.delete({
      where: {
        userId_productId: {
          userId,
          productId: parseInt(productId)
        }
      }
    })

    await logAudit(
      AUDIT_ACTIONS.PROFILE_UPDATE,
      userId,
      req.session.user.email,
      'Removed from wishlist',
      req.ip,
      req.get('User-Agent')
    )

    res.json({ message: 'Removed from wishlist' })
  } catch (error) {
    console.error('Error removing from wishlist:', error)
    res.status(500).json({ error: 'Failed to remove from wishlist' })
  }
}

// Change password (customer only)
export const changeCustomerPassword = async (req, res) => {
  try {
    const userId = req.session.user.id
    const { currentPassword, newPassword } = req.body

    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Verify current password
    const bcrypt = require('bcryptjs')
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password)
    
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ error: 'Current password is incorrect' })
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    })

    await logAudit(
      AUDIT_ACTIONS.PASSWORD_CHANGED,
      userId,
      user.email,
      'Password changed via customer dashboard',
      req.ip,
      req.get('User-Agent')
    )

    res.json({ message: 'Password changed successfully' })
  } catch (error) {
    console.error('Error changing password:', error)
    res.status(500).json({ error: 'Failed to change password' })
  }
}
