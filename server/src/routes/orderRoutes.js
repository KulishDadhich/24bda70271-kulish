/**
 * Order Routes
 */

const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrderById,
  getCustomerOrders,
  getRestaurantOrders,
  getDeliveryPartnerOrders,
  updateOrderStatus,
  advanceOrderStatus,
  addOrderReview,
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, createOrder);
router.get('/customer/my-orders', protect, getCustomerOrders);
router.get('/restaurant/:restaurantId', protect, getRestaurantOrders);
router.get('/delivery/jobs', protect, authorize('delivery_partner', 'restaurant_admin'), getDeliveryPartnerOrders);

router.get('/:id', protect, getOrderById);
router.patch('/:id/status', protect, updateOrderStatus);
router.post('/:id/advance-status', advanceOrderStatus); // Open for easy demo/viva fast-forward
router.post('/:id/review', protect, addOrderReview);

module.exports = router;
