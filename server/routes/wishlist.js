import express from 'express'
import { addToWishlist, getWishlist, removeFromWishlist } from '../controllers/wishlistController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router()

router.get('/', requireAuth, getWishlist)
router.post('/', requireAuth, addToWishlist)
router.delete('/:productId', requireAuth, removeFromWishlist)

export default router