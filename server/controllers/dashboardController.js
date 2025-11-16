import prisma from '../utils/database.js';

export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalProducts = await prisma.product.count();
    const totalOrders = await prisma.order.count();
    const totalRevenue = await prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { in: ['DELIVERED', 'SHIPPED'] } }
    });

    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        items: { include: { product: { select: { name: true } } } }
      }
    });

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const visitorStats = await prisma.visitor.findMany({
      where: { date: { gte: sevenDaysAgo } },
      orderBy: { date: 'asc' }
    });

    const orderStats = await prisma.order.groupBy({
      by: ['status'],
      _count: { id: true }
    });

    res.json({
      statistics: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue: totalRevenue._sum.total || 0
      },
      recentOrders,
      visitorStats,
      orderStats
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
};