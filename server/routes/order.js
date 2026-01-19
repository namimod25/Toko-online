import express from 'express'
import { requireAuth } from '../middleware/auth.js'
import { checkPaymentStatus, createOrder, getOrderById, getOrders, paymentNotification } from '../controllers/orderController.js'


const router = express.Router()

//webhook midtrans
router.post('/notifikasi', paymentNotification)

//route
router.use(requireAuth)
router.get('/', getOrders)
router.get('/:id', getOrderById)
router.post('/create', createOrder)
router.get('/status/:orderId', checkPaymentStatus)

export default router