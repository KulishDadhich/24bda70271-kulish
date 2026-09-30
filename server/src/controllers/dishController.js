/**
 * Dish Controller
 * Manages restaurant menu items, 3D model previews, add-on customization schemas,
 * and quick in-stock availability toggles.
 */

const Dish = require('../models/Dish');
const Restaurant = require('../models/Restaurant');

/**
 * @desc    Get all dishes for a specific restaurant
 * @route   GET /api/dishes/restaurant/:restaurantId
 * @access  Public
 */
const getDishesByRestaurant = async (req, res) => {
  try {
    const dishes = await Dish.find({ restaurant: req.params.restaurantId });
    res.json({ success: true, count: dishes.length, data: dishes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc    Get global featured/bestseller dishes (for Homepage 3D Showcase & Carousels)
 * @route   GET /api/dishes/featured
 * @access  Public
 */
const getFeaturedDishes = async (req, res) => {
  try {
    const featured = await Dish.find({ isBestseller: true, isAvailable: true })
      .populate('restaurant', 'name rating image deliveryTimeMinutes')
      .limit(10);

    res.json({ success: true, count: featured.length, data: featured });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc    Create new dish for a restaurant
 * @route   POST /api/dishes
 * @access  Private (restaurant_admin)
 */
const createDish = async (req, res) => {
  try {
    const { restaurant, name, description, price, category, image, isVeg, isBestseller, isSpicy, spiceLevel, model3dType, options } = req.body;

    const dish = await Dish.create({
      restaurant,
      name,
      description,
      price,
      category,
      image,
      isVeg: isVeg ?? false,
      isBestseller: isBestseller ?? false,
      isSpicy: isSpicy ?? false,
      spiceLevel: spiceLevel || 0,
      model3dType: model3dType || 'default',
      options: options || [],
    });

    res.status(201).json({
      success: true,
      message: 'Dish added to menu successfully',
      data: dish,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/**
 * @desc    Update dish
 * @route   PUT /api/dishes/:id
 * @access  Private (restaurant_admin)
 */
const updateDish = async (req, res) => {
  try {
    const dish = await Dish.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!dish) {
      return res.status(404).json({ success: false, message: 'Dish not found' });
    }

    res.json({
      success: true,
      message: 'Dish updated successfully',
      data: dish,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/**
 * @desc    Toggle dish availability (In Stock / Out of Stock)
 * @route   PATCH /api/dishes/:id/toggle-availability
 * @access  Private (restaurant_admin)
 */
const toggleAvailability = async (req, res) => {
  try {
    const dish = await Dish.findById(req.params.id);
    if (!dish) {
      return res.status(404).json({ success: false, message: 'Dish not found' });
    }

    dish.isAvailable = !dish.isAvailable;
    await dish.save();

    res.json({
      success: true,
      message: `Dish marked ${dish.isAvailable ? 'In Stock' : 'Out of Stock'}`,
      data: dish,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc    Delete dish
 * @route   DELETE /api/dishes/:id
 * @access  Private (restaurant_admin)
 */
const deleteDish = async (req, res) => {
  try {
    const dish = await Dish.findById(req.params.id);
    if (!dish) {
      return res.status(404).json({ success: false, message: 'Dish not found' });
    }

    await dish.deleteOne();
    res.json({ success: true, message: 'Dish removed successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getDishesByRestaurant,
  getFeaturedDishes,
  createDish,
  updateDish,
  toggleAvailability,
  deleteDish,
};
