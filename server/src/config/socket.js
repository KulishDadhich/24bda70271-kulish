/**
 * Socket.IO Real-Time Communication Hub
 * 
 * Manages WebSocket connections for:
 * - Real-time order status updates (Placed -> Accepted -> Preparing -> Out for Delivery -> Delivered)
 * - Live rider GPS location streaming
 * - Restaurant live incoming order alerts
 * - Delivery partner job assignments
 */

const { Server } = require('socket.io');

let io = null;

const initSocket = httpServer => {
  io = new Server(httpServer, {
    cors: {
      origin: '*', // Allows local client during dev
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      credentials: true,
    },
  });

  io.on('connection', socket => {
    console.log(`⚡ [Socket.IO] New client connected: ${socket.id}`);

    // Join room for specific Order Live Tracking
    socket.on('join:order', orderId => {
      if (orderId) {
        const room = `order:${orderId}`;
        socket.join(room);
        console.log(`📦 Socket ${socket.id} joined room ${room}`);
      }
    });

    // Leave order room
    socket.on('leave:order', orderId => {
      if (orderId) {
        const room = `order:${orderId}`;
        socket.leave(room);
        console.log(`👋 Socket ${socket.id} left room ${room}`);
      }
    });

    // Join room for Restaurant Owner Dashboard (incoming orders)
    socket.on('join:restaurant', restaurantId => {
      if (restaurantId) {
        const room = `restaurant:${restaurantId}`;
        socket.join(room);
        console.log(`🍳 Restaurant socket joined room: ${room}`);
      }
    });

    // Join room for User Personal Alerts
    socket.on('join:user', userId => {
      if (userId) {
        const room = `user:${userId}`;
        socket.join(room);
        console.log(`👤 User socket joined personal room: ${room}`);
      }
    });

    // Join room for Delivery Partners
    socket.on('join:delivery', () => {
      socket.join('role:delivery_partner');
      console.log(`🛵 Delivery partner joined delivery room`);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 [Socket.IO] Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO has not been initialized yet!');
  }
  return io;
};

module.exports = { initSocket, getIO };
