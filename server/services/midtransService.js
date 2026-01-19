import midtransClient from 'midtrans-client'
import prisma from '../utils/database.js'


let snap = null

export const initializeMidtrans = () => {
  const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'false'

  snap = new midtransClient.Snap({
    isProduction: isProduction,
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    clientKey: process.env.MIDTRANS_CLIENT_KEY
  })

  console.log('Midtrans initialized:', isProduction ? 'Production' : 'Sandbox')
  return snap
}

export const getSnapInstance = () => {
  if (!snap) {
    throw new Error('Midtrans not initialized. Call initializeMidtrans() first.')
  }
  return snap
}


export const createTransaction = async (order) => {
  try {
    const snap = getSnapInstance()


    if (!order.orderNumber) {
      const orderNumber = `ORD-${order.userId}-${Date.now()}`
      await prisma.order.update({
        where: { id: order.id },
        data: { orderNumber }
      })
      order.orderNumber = orderNumber
    }


    const parameter = {
      transaction_details: {
        order_id: order.orderNumber,
        gross_amount: order.total
      },
      customer_details: {
        first_name: order.user.name.split(' ')[0],
        last_name: order.user.name.split(' ').slice(1).join(' ') || '',
        email: order.user.email,
        phone: order.user.phone || ''
      },
      item_details: order.items.map(item => ({
        id: item.product.id.toString(),
        price: item.price,
        quantity: item.quantity,
        name: item.product.name
      })),
      callbacks: {
        finish: `${process.env.FRONTEND_URL}/orders/${order.id}`,
        error: `${process.env.FRONTEND_URL}/orders/${order.id}/error`,
        pending: `${process.env.FRONTEND_URL}/orders/${order.id}/pending`
      }
    }


    const transaction = await snap.createTransaction(parameter)


    await prisma.order.update({
      where: { id: order.id },
      data: {
        midtransTransactionId: transaction.token
      }
    })

    return {
      token: transaction.token,
      redirect_url: transaction.redirect_url
    }

  } catch (error) {
    console.error('Error creating Midtrans transaction:', error)
    throw error
  }
}


export const checkTransactionStatus = async (orderId) => {
  try {
    const snap = getSnapInstance()


    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true
      }
    })

    if (!order || !order.midtransTransactionId) {
      throw new Error('Order or transaction ID not found')
    }


    const statusResponse = await snap.transaction.status(order.midtransTransactionId)

    return statusResponse

  } catch (error) {
    console.error('Error checking transaction status:', error)
    throw error
  }
}