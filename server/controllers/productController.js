import prisma from '../config/database.js';
import {emitProductUpdate, 
  emitProductCreated, 
  emitProductDeleted,
  emitStockUpdate} from '../socket/socket.js'
import { logger } from '../utils/logger.js';

export const getProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    res.json(products);
  } catch (error) {
    logger.info("Gagal mengambil products");
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(req.params.id) }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};

export const getAdminProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } }
      ]
    } : {};

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.product.count({ where })
    ]);

    res.json({
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

export const createProduct = async (req, res) => {
  try {
    const product = await prisma.product.create({
      data: req.body
    });
      console.log('Product created successfully:', product)
      emitProductCreated(product);

    res.status(201).json({
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create product' });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const product = await prisma.product.update({
      where: { id: parseInt(req.params.id) },
      data: {
        name: req.body.name,
        description: req.body.description,
        price: parseInt(req.body.price),
        image: req.body.image,
        stock: parseInt(req.body.stock),
        category: req.body.category
      }
    });

    emitProductUpdate(product);

    res.json({
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product' });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    await prisma.product.delete({
      where: { id: parseInt(req.params.id) }
    });

    emitProductDeleted(productId);

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
};

// New function untuk update stock
export const updateStock = async (req, res) => {
  try {
    const { stock } = req.body
    const productId = parseInt(req.params.id)

    const product = await prisma.product.update({
      where: { id: productId },
      data: { stock: parseInt(stock) }
    })

    // Emit realtime event untuk stock update
    emitStockUpdate(productId, product.stock)

    res.json({
      message: 'Stock updated successfully',
      product
    })
  } catch (error) {
    console.error('Error updating stock:', error)
    res.status(500).json({ error: 'Failed to update stock' })
  }
}

export const getProduct = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' }
    })
    res.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    res.status(500).json({ error: 'Failed to fetch products' })
  }
}
