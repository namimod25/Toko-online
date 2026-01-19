import prisma from '../utils/database.js'


// Get user's cart
export const getCart = async (req, res) => {
  try {
    const userId = req.session.user.id

    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                description: true,
                price: true,
                image: true,
                stock: true,
                category: true
              }
            }
          }
        }
      }
    })

    if (!cart) {
      // Buat keranjang kosong kalu belum ada
      const newCart = await prisma.cart.create({
        data: {
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
      return res.json(newCart)
    }

    res.json(cart)
  } catch (error) {
    console.error('Error fetching cart:', error)
    res.status(500).json({ error: 'Failed to fetch cart' })
  }
}

// Add item to cart
export const addToCart = async (req, res) => {
  try {
    const userId = req.session.user.id
    const { productId, quantity = 1 } = req.body

    // Validate product exists and has stock
    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) }
    })

    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        error: `Insufficient stock. Only ${product.stock} items available`
      })
    }

    // Get or create user's cart
    let cart = await prisma.cart.findUnique({
      where: { userId }
    })

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId }
      })
    }

    // Check if product already in cart
    const existingCartItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: parseInt(productId)
      }
    })

    if (existingCartItem) {
      // Update quantity if already exists
      const updatedCartItem = await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: existingCartItem.quantity + quantity }
      })

      res.json({
        message: 'Product quantity updated in cart',
        cartItem: updatedCartItem
      })
    } else {
      // Add new item to cart
      const cartItem = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: parseInt(productId),
          quantity
        },
        include: {
          product: true
        }
      })

      res.json({
        message: 'Product added to cart',
        cartItem
      })
    }
  } catch (error) {
    console.error('Error adding to cart:', error)
    res.status(500).json({
      error: 'Failed to add product to cart',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  }
}

// Update cart item quantity
export const updateCartItem = async (req, res) => {
  try {
    const userId = req.session.user.id
    const { cartItemId } = req.params
    const { quantity } = req.body

    // Validate cart ownership
    const cart = await prisma.cart.findUnique({
      where: { userId }
    })

    if (!cart) {
      return res.status(404).json({ error: 'Cart tidak ditemukan' })
    }

    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: parseInt(cartItemId),
        cartId: cart.id
      },
      include: {
        product: true
      }
    })

    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item tidak ada' })
    }

    // Check stock
    if (quantity > cartItem.product.stock) {
      return res.status(400).json({
        error: `Insufficient stock. Only ${cartItem.product.stock} items available`
      })
    }

    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      await prisma.cartItem.delete({
        where: { id: parseInt(cartItemId) }
      })
      return res.json({ message: 'Item removed from cart' })
    }

    // Update quantity
    const updatedCartItem = await prisma.cartItem.update({
      where: { id: parseInt(cartItemId) },
      data: { quantity }
    })

    res.json({
      message: 'Cart item updated',
      cartItem: updatedCartItem
    })
  } catch (error) {
    console.error('Error updating cart item:', error)
    res.status(500).json({ error: 'Failed to update cart item' })
  }
}

// Remove item from cart
export const removeFromCart = async (req, res) => {
  try {
    const userId = req.session.user.id
    const { cartItemId } = req.params

    // Validate cart ownership
    const cart = await prisma.cart.findUnique({
      where: { userId }
    })

    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' })
    }

    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: parseInt(cartItemId),
        cartId: cart.id
      }
    })

    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found' })
    }

    await prisma.cartItem.delete({
      where: { id: parseInt(cartItemId) }
    })

    res.json({ message: 'Item removed from cart' })
  } catch (error) {
    console.error('Error removing from cart:', error)
    res.status(500).json({ error: 'Failed to remove item from cart' })
  }
}

// Clear cart
export const clearCart = async (req, res) => {
  try {
    const userId = req.session.user.id

    const cart = await prisma.cart.findUnique({
      where: { userId }
    })

    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' })
    }

    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id }
    })

    res.json({ message: 'Cart cleared' })
  } catch (error) {
    console.error('Error clearing cart:', error)
    res.status(500).json({ error: 'Failed to clear cart' })
  }
}