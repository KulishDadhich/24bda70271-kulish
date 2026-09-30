/**
 * Socket.IO Client Singleton
 * Manages WebSocket connection and provides room helpers.
 */

import { io } from 'socket.io-client';

let socket = null;

export const getSocket = () => {
  if (!socket) {
    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || window.location.origin;
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('⚡ [Socket.IO] Client connected to server:', socket.id);
    });

    socket.on('connect_error', err => {
      console.warn('⚠️ [Socket.IO] Connection error:', err.message);
    });
  }
  return socket;
};

export const joinOrderRoom = orderId => {
  const s = getSocket();
  if (s && orderId) {
    s.emit('join:order', orderId);
  }
};

export const leaveOrderRoom = orderId => {
  const s = getSocket();
  if (s && orderId) {
    s.emit('leave:order', orderId);
  }
};

export const joinRestaurantRoom = restaurantId => {
  const s = getSocket();
  if (s && restaurantId) {
    s.emit('join:restaurant', restaurantId);
  }
};

export const joinUserRoom = userId => {
  const s = getSocket();
  if (s && userId) {
    s.emit('join:user', userId);
  }
};
