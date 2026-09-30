/**
 * Analytics & Stats Routes
 */

const express = require('express');
const router = express.Router();
const { getRestaurantStats } = require('../controllers/statsController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/restaurant/:restaurantId', protect, authorize('restaurant_admin'), getRestaurantStats);

module.exports = router;
