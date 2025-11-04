import express from 'express';
import prisma from '../config/database.js';
import { getActiveHeroSlides } from '../controllers/heroSlideController.js';

const router = express.Router();

// Get featured products for landing page
router.get('/featured-products', async (req, res) => {
  try {
    console.log('Fetching featured products from database...');
    
    const featuredProducts = await prisma.product.findMany({
      take: 8,
      orderBy: { 
        createdAt: 'desc' 
      },
      where: {
        stock: { 
          gt: 0 
        }
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        image: true,
        category: true,
        stock: true,
        createdAt: true
      }
    });

    console.log(`Found ${featuredProducts.length} featured products`);
    
    res.json(featuredProducts);
  } catch (error) {
    console.error('Error fetching featured products:', error);
    res.status(500).json({ 
      error: 'Failed to fetch featured products',
      details: error.message 
    });
  }
});

// Get hero slides from database
router.get('/hero-slide', getActiveHeroSlides)
router.get('/hero-slides', async (req, res) => {
  try {

    const heroSlides = await prisma.heroSlide.findMany({
      where: { 
        active: true 
      },
      orderBy: { 
        order: 'asc' 
      },
      select: {
        id: true,
        title: true,
        description: true,
        image: true,
        buttonText: true,
        buttonLink: true,
        order: true
      }
    });

    console.log(`Found ${heroSlides.length} active hero slides`);

    // Jika tidak ada data, return empty array
    if (heroSlides.length === 0) {
      console.log('No hero slides found in database, returning empty array');
      return res.json([]);
    }

    res.json(heroSlides);
  } catch (error) {
    console.error('Error fetching hero slides:', error);

    res.status(500).json({ 
      error: 'Failed to fetch hero slides',
      details: error.message 
    });
  }
});

//  product categories dari database
router.get('/categories', async (req, res) => {
  try {
    console.log('Fetching categories from database...');
    
    const categories = await prisma.product.groupBy({
      by: ['category'],
      _count: {
        id: true
      },
      where: {
        stock: { 
          gt: 0 
        }
      }
    });

    console.log(`Found ${categories.length} categories`);

    const formattedCategories = categories.map(cat => ({
      id: cat.category,
      name: cat.category,
      count: cat._count.id
    }));

    // Add "All Products" option
    const totalProducts = await prisma.product.count({ 
      where: { 
        stock: { 
          gt: 0 
        } 
      } 
    });
    
    formattedCategories.unshift({
      id: 'all',
      name: 'All Products',
      count: totalProducts
    });

    res.json(formattedCategories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ 
      error: 'Failed to fetch categories',
      details: error.message 
    });
  }
});

// Get landing page statistics
router.get('/stats', async (req, res) => {
  try {
    const [totalProducts, totalCategories, featuredProductsCount] = await Promise.all([
      prisma.product.count({
        where: { stock: { gt: 0 } }
      }),
      prisma.product.groupBy({
        by: ['category'],
        where: { stock: { gt: 0 } }
      }).then(result => result.length),
      prisma.product.count({
        where: { stock: { gt: 0 } },
        take: 8
      })
    ]);

    res.json({
      totalProducts,
      totalCategories,
      featuredProductsCount
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ 
      error: 'Failed to fetch stats',
      details: error.message 
    });
  }
});

export default router;