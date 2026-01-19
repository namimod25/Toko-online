import express from 'express'
import { requireAuth } from '../middleware/auth.js'
import { addToCart, clearCart, getCart, removeFromCart, updateCartItem } from '../controllers/cartController.js'

const router = express.Router()

router.use(requireAuth)

router.get('/', getCart)
router.post('/add', addToCart)
router.put('/items/:cartItemId', updateCartItem)
router.delete('/items/:cartItemId', removeFromCart)
router.delete('/clear', clearCart)

export default router