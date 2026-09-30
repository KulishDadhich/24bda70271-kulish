/**
 * Dish Routes
 */

const express = require('express');
const router = express.Router();
const {
  getDishesByRestaurant,
  getFeaturedDishes,
  createDish,
  updateDish,
  toggleAvailability,
  deleteDish,
} = require('../controllers/dishController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/featured', getFeaturedDishes);
router.get('/restaurant/:restaurantId', getDishesByRestaurant);

router.post('/', protect, authorize('restaurant_admin'), createDish);
router.put('/:id', protect, authorize('restaurant_admin'), updateDish);
router.patch('/:id/toggle-availability', protect, authorize('restaurant_admin'), toggleAvailability);
router.delete('/:id', protect, authorize('restaurant_admin'), deleteDish);

module.exports = router;
