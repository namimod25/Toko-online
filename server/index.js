import express from 'express';
import cors from 'cors';
import session from 'express-session';
import dotenv from 'dotenv';
import { connectDB } from './utils/database.js';
import prisma from './utils/database.js';
import path from 'path';
import { fileURLToPath } from 'url';
import sessionConfig from './config/session.js';

// Import routes
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import adminRoutes from './routes/admin.js';
import landingRoutes from './routes/landing.js'
import wishlistRoutes from './routes/wishlist.js';
import passwordRoutes from "./routes/password.js"
import customerRoutes from './routes/customer.js';
import captchaRoutes from './routes/captcha.js';
import cartRoutes from './routes/cart.js'
import orderRoutes from './routes/order.js'

// Import middleware
import { trackVisitor } from './middleware/visitorTracker.js';
import { logger } from './utils/logger.js';
import { createServer } from 'http';
import { initializeSocket } from './socket/socket.js';
import { getProfile, updateProfile } from './controllers/authController.js';
import { requireAuth } from './middleware/auth.js';


dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || '5001';


connectDB();

// http server
const server = createServer(app);
// Initialize socket.io
initializeSocket(server);

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(session(sessionConfig));


// Track visitor middleware
app.use(trackVisitor);


// Rute
app.use('/api/', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/landing', landingRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/password', passwordRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/captcha', captchaRoutes);
app.use('/api/cart', cartRoutes)
app.use('/api/orders', orderRoutes)


// Profile routes - fixed to use proper HTTP methods
app.get('/api/profile', requireAuth, getProfile);
app.put('/api/profile', requireAuth, updateProfile);

// handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

app.get('/api/status', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get user info' });
  }
});

// error handler route
app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});