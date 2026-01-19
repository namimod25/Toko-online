import express from 'express';
import { addToWishlist, changeCustomerPassword, createOrder, getCustomerOrders, getCustomerProfile, getWishlist, removeFromWishlist, updateCustomerProfile } from '../controllers/custmerContoller.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router()

router.use(requireAuth)

//profil management
router.get('/profile', getCustomerProfile)
router.put('/profile', updateCustomerProfile)

//orde management
router.get('/orders', getCustomerOrders)
router.post('/orders', createOrder)

//wishlist management
router.get('/wishlist', getWishlist)
router.post('/wishlist', addToWishlist)
router.delete('/wishlist/:product', removeFromWishlist)

//password manage
router.post('/change-password', changeCustomerPassword)

export default router