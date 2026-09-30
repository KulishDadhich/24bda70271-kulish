/**
 * FoodVerse Server Entrypoint
 * 
 * Sets up Express REST API, HTTP Server, Socket.IO real-time hub,
 * MongoDB database connectivity, and automated startup data verification.
 */

const express = require('express');
const http = require('http');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');

// Load environment config
dotenv.config({ path: path.join(__dirname, '../.env') });

const { connectDB } = require('./config/db');
const { initSocket } = require('./config/socket');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const Restaurant = require('./models/Restaurant');
const { seedDatabase } = require('./seed/seeder');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const restaurantRoutes = require('./routes/restaurantRoutes');
const dishRoutes = require('./routes/dishRoutes');
const orderRoutes = require('./routes/orderRoutes');
const couponRoutes = require('./routes/couponRoutes');
const statsRoutes = require('./routes/statsRoutes');

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = initSocket(server);

// Middleware
app.use(cors({
  origin: '*',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'FoodVerse API',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/dishes', dishRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/stats', statsRoutes);

// Error Middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // 1. Connect to Database (Mongo local or MongoMemoryServer fallback)
    await connectDB();

    // 2. Auto-seed if database is brand new or empty
    const restaurantCount = await Restaurant.countDocuments();
    if (restaurantCount === 0) {
      console.log('📦 Empty database detected. Auto-populating initial FoodVerse seed data...');
      await seedDatabase();
    }

    // 3. Start listening on PORT
    server.listen(PORT, () => {
      console.log(`
  ✨ =================================================== ✨
     🌌 FoodVerse API & Real-Time Socket.IO Server 🌌
     🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on PORT ${PORT}
     📡 Local API: http://localhost:${PORT}/api/health
     ⚡ WebSockets: Active for Live GPS Order Tracking
  ✨ =================================================== ✨
      `);
    });
  } catch (error) {
    console.error('Fatal Server Startup Error:', error);
    process.exit(1);
  }
};

startServer();
