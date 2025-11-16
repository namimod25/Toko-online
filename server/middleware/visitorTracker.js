import prisma from '../utils/database.js';

export const trackVisitor = async (req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api/admin')) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const existingVisitor = await prisma.visitor.findFirst({
        where: {
          date: {
            gte: today,
            lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
          }
        }
      });

      if (existingVisitor) {
        await prisma.visitor.update({
          where: { id: existingVisitor.id },
          data: { count: existingVisitor.count + 1 }
        });
      } else {
        await prisma.visitor.create({
          data: { date: today, count: 1 }
        });
      }
    } catch (error) {
      console.error('Visitor tracking error:', error);
    }
  }
  next();
};