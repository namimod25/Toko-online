import prisma from '../utils/database.js'
import { snap, generateOrderNumber } from '../config/midtrans.js'

// Create order and Midtrans payment
export const createOrder = async (req, res) => {
  try {
    const userId = req.session.user.id
    const { shippingAddress, paymentMethod = 'bank_transfer' } = req.body

    // Get user's cart
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    })

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' })
    }

    // Validate stock and calculate total
    let total = 0
    const orderItems = []

    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        return res.status(400).json({ 
          error: `Insufficient stock for ${item.product.name}. Only ${item.product.stock} available` 
        })
      }
      
      const itemTotal = item.product.price * item.quantity
      total += itemTotal
      
      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: item.product.price
      })
    }

    // Add shipping cost (example: fixed 20000)
    const shippingCost = 20000
    total += shippingCost

    // Generate order number
    const orderNumber = generateOrderNumber()

    // Create order in database
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId,
        total,
        shippingAddress,
        shippingCost,
        paymentMethod,
        status: 'PENDING',
        paymentStatus: 'pending',
        items: {
          create: orderItems
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    // Prepare Midtrans transaction parameters
    const transactionDetails = {
      order_id: orderNumber,
      gross_amount: Math.round(total) // Midtrans requires integer
    }

    const customerDetails = {
      first_name: order.user.name.split(' ')[0],
      last_name: order.user.name.split(' ').slice(1).join(' ') || '',
      email: order.user.email,
      phone: '081234567890' // Default phone number for sandbox
    }

    const itemDetails = order.items.map(item => ({
      id: item.product.id.toString(),
      price: Math.round(item.price),
      quantity: item.quantity,
      name: item.product.name
    }))

    // Add shipping as item
    itemDetails.push({
      id: 'shipping',
      price: Math.round(shippingCost),
      quantity: 1,
      name: 'Shipping Cost'
    })

    // Create Midtrans transaction
    const parameter = {
      transaction_details: transactionDetails,
      customer_details: customerDetails,
      item_details: itemDetails
    }

    // Generate Snap Token
    const snapResponse = await snap.createTransaction(parameter)
    
    // Update order with Midtrans data
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        midtransOrderId: snapResponse.order_id,
        midtransToken: snapResponse.token
      }
    })

    res.json({
      message: 'Order created successfully',
      order: updatedOrder,
      snapToken: snapResponse.token,
      snapRedirectUrl: snapResponse.redirect_url
    })

  } catch (error) {
    console.error('Error creating order:', error)
    res.status(500).json({ error: 'Failed to create order' })
  }
}

// Get user's orders
export const getOrders = async (req, res) => {
  try {
    const userId = req.session.user.id

    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                image: true
              }
            }
          }
        }
      }
    })

    res.json(orders)
  } catch (error) {
    console.error('Error fetching orders:', error)
    res.status(500).json({ error: 'Failed to fetch orders' })
  }
}

// Get order by ID
export const getOrderById = async (req, res) => {
  try {
    const userId = req.session.user.id
    const { id } = req.params

    const order = await prisma.order.findFirst({
      where: {
        id: parseInt(id),
        userId
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    })

    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    res.json(order)
  } catch (error) {
    console.error('Error fetching order:', error)
    res.status(500).json({ error: 'Failed to fetch order' })
  }
}

// Midtrans payment notification handler (webhook)
export const paymentNotification = async (req, res) => {
  try {
    const notification = req.body

    // Verify notification with Midtrans
    const statusResponse = await snap.transaction.notification(notification)

    const orderId = statusResponse.order_id
    const transactionStatus = statusResponse.transaction_status
    const fraudStatus = statusResponse.fraud_status

    console.log(`Payment notification:`, {
      orderId,
      transactionStatus,
      fraudStatus
    })

    // Find order by order number
    const order = await prisma.order.findUnique({
      where: { orderNumber: orderId }
    })

    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    let orderStatus = order.status
    let paymentStatus = order.paymentStatus

    // Handle transaction status
    if (transactionStatus === 'capture') {
      if (fraudStatus === 'challenge') {
        paymentStatus = 'challenge'
      } else if (fraudStatus === 'accept') {
        paymentStatus = 'success'
        orderStatus = 'PROCESSING'
        
        // Update product stock
        const orderItems = await prisma.orderItem.findMany({
          where: { orderId: order.id },
          include: { product: true }
        })

        for (const item of orderItems) {
          await prisma.product.update({
            where: { id: item.productId },
            data: {
              stock: item.product.stock - item.quantity
            }
          })
        }

        // Clear user's cart
        await prisma.cartItem.deleteMany({
          where: {
            cart: {
              userId: order.userId
            }
          }
        })
      }
    } else if (transactionStatus === 'settlement') {
      paymentStatus = 'success'
      orderStatus = 'PROCESSING'
    } else if (transactionStatus === 'pending') {
      paymentStatus = 'pending'
    } else if (transactionStatus === 'deny') {
      paymentStatus = 'failed'
      orderStatus = 'CANCELLED'
    } else if (transactionStatus === 'expire') {
      paymentStatus = 'expired'
      orderStatus = 'CANCELLED'
    } else if (transactionStatus === 'cancel') {
      paymentStatus = 'cancelled'
      orderStatus = 'CANCELLED'
    }

    // Update order
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: orderStatus,
        paymentStatus
      }
    })

    res.json({ message: 'Notification processed' })
  } catch (error) {
    console.error('Error processing payment notification:', error)
    res.status(500).json({ error: 'Failed to process notification' })
  }
}

// Check payment status
export const checkPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params

    const order = await prisma.order.findUnique({
      where: { orderNumber: orderId }
    })

    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    res.json({
      orderId: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      total: order.total
    })
  } catch (error) {
    console.error('Error checking payment status:', error)
    res.status(500).json({ error: 'Failed to check payment status' })
  }
}