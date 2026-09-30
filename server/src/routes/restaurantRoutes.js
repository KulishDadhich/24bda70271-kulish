/**
 * Restaurant Routes
 */

const express = require('express');
const router = express.Router();
const {
  getAllRestaurants,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
} = require('../controllers/restaurantController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(getAllRestaurants)
  .post(protect, authorize('restaurant_admin'), createRestaurant);

router.route('/:idOrSlug')
  .get(getRestaurantById)
  .put(protect, authorize('restaurant_admin'), updateRestaurant)
  .delete(protect, authorize('restaurant_admin'), deleteRestaurant);

module.exports = router;
