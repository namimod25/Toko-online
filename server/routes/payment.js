import express from 'express'
import crypto from 'crypto'
import prisma from '../utils/database.js'
import { emitOrderUpdate } from '../socket/socket.js'

const router = express.Router()


const verifyMidtransSignature = (orderId, statusCode, grossAmount, serverKey) => {
  const signatureKey = serverKey
  const hash = crypto.createHash('sha512')
  const input = orderId + statusCode + grossAmount + signatureKey
  hash.update(input)
  return hash.digest('hex')
}


router.post('/midtrans-webhook', async (req, res) => {
  try {
    const {
      order_id,
      transaction_status,
      fraud_status,
      status_code,
      gross_amount,
      signature_key
    } = req.body

    console.log('Midtrans webhook received:', {
      order_id,
      transaction_status,
      fraud_status,
      status_code,
      gross_amount
    })


    const serverKey = process.env.MIDTRANS_SERVER_KEY || 'SB-Mid-server-YourServerKey'
    const mySignatureKey = verifyMidtransSignature(
      order_id,
      status_code,
      gross_amount,
      serverKey
    )

    if (signature_key !== mySignatureKey) {
      console.error('Invalid signature')
      return res.status(400).json({ error: 'Invalid signature' })
    }

    
    const orderId = parseInt(order_id.split('-')[1])
    
    if (!orderId) {
      console.error('Invalid order ID format:', order_id)
      return res.status(400).json({ error: 'Invalid order ID' })
    }

    let orderStatus = 'PENDING'

    
    switch (transaction_status) {
      case 'capture':
        if (fraud_status === 'accept') {
          orderStatus = 'PAID'
        } else {
          orderStatus = 'PENDING'
        }
        break
      case 'settlement':
        orderStatus = 'PAID'
        break
      case 'pending':
        orderStatus = 'PENDING'
        break
      case 'deny':
        orderStatus = 'FAILED'
        break
      case 'cancel':
      case 'expire':
        orderStatus = 'CANCELLED'
        break
      case 'refund':
      case 'partial_refund':
        orderStatus = 'REFUNDED'
        break
      default:
        orderStatus = 'PENDING'
    }

    
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: orderStatus,
        paymentStatus: transaction_status,
        updatedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        },
        items: {
          include: {
            product: true
          }
        }
      }
    })

    console.log('Order updated:', updatedOrder.id, 'Status:', orderStatus)

    
    if (orderStatus === 'PAID') {
      for (const item of updatedOrder.items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        })
        
        console.log(`Stock updated for product ${item.productId}, reduced by ${item.quantity}`)
      }
    }

    
    emitOrderUpdate(updatedOrder)

    res.json({ 
      message: 'Webhook processed successfully',
      orderId: updatedOrder.id,
      status: orderStatus 
    })

  } catch (error) {
    console.error('Webhook processing error:', error)
    res.status(500).json({ 
      error: 'Failed to process webhook',
      details: error.message 
    })
  }
})


router.post('/sync-order-status/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params
    const { status } = req.body

    const validStatuses = ['PENDING', 'PROCESSING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'FAILED', 'REFUNDED']
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' })
    }

    const order = await prisma.order.update({
      where: { id: parseInt(orderId) },
      data: { status },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    })

   
    emitOrderUpdate(order)

    res.json({
      message: 'Order status synced successfully',
      order
    })

  } catch (error) {
    console.error('Sync error:', error)
    res.status(500).json({ error: 'Failed to sync order status' })
  }
})

export default router