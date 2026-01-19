import prisma from "../utils/database.js";

export const getWishlist = async (req, res) => {
    try{
        const userId = req.session.user.userId

        const Wishlist = await prisma.wishlist.findMany({
            where: {userId},
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        price: true,
                        image: true,
                        category: true,
                        stock: true
                    }
                }
            },
            orderBy: {createdAt: 'desc'}
        })

        res.json(Wishlist)
    }catch(error){
        res.status(500).json({error: 'Failed to fetch wishlist'})
    }
}

export const addToWishlist = async (req, res) => {
  try {
    const userId = req.session.user.id
    const { productId } = req.body

    // Cek apakah product ada
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }

    // Cek apakah sudah ada di wishlist
    const existingWishlist = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId,
          productId
        }
      }
    })

    if (existingWishlist) {
      return res.status(400).json({ error: 'Product already in wishlist' })
    }

    const wishlistItem = await prisma.wishlist.create({
      data: {
        userId,
        productId
      },
      include: {
        product: true
      }
    })

    res.status(201).json({
      message: 'Product added to wishlist',
      wishlistItem
    })
  } catch (error) {
    console.error('Error adding to wishlist:', error)
    res.status(500).json({ error: 'Failed to add to wishlist' })
  }
}

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

    res.json({ message: 'Product removed from wishlist' })
  } catch (error) {
    
    res.status(500).json({ error: 'Failed to remove from wishlist' })
  }
}