import express from 'express';
import cors from 'cors';
import session from 'express-session';
import dotenv from 'dotenv';
import { connectDB } from './utils/database.js';
import path from 'path';
import { fileURLToPath } from 'url';
import  sessionConfig  from './config/session.js';

// Import routes
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import adminRoutes from './routes/admin.js';
import landingRoutes from './routes/landing.js'
import passwordRoutes from "./routes/password.js"

// Import middleware
import { trackVisitor } from './middleware/visitorTracker.js';
import { getAuthStatus } from './controllers/authController.js';
import { logger } from './utils/logger.js';
import {createServer} from 'http';
import { initializeSocket } from './socket/socket.js';

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


app.use(session(sessionConfig));

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json());

// Track visitor middleware
app.use(trackVisitor);


app.use('/api/', authRoutes); 
app.use('/api/products', productRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/landing', landingRoutes);
app.use('/api/password', passwordRoutes);


app.get('/api/status', getAuthStatus);

// handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// error handler route
app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});