/**
 * Restaurant Controller
 * Handles restaurant listing with dynamic query filtering, multi-cuisine filtering,
 * full-text search, sorting algorithms, and CRUD for restaurant admins.
 */

const Restaurant = require('../models/Restaurant');
const Dish = require('../models/Dish');

/**
 * @desc    Get all restaurants with search, filters, and sorting
 * @route   GET /api/restaurants
 * @access  Public
 */
const getAllRestaurants = async (req, res) => {
  try {
    const {
      search,
      cuisine,
      rating,
      isVegOnly,
      maxDeliveryTime,
      priceTier,
      sortBy,
      featured,
    } = req.query;

    const query = {};

    // 1. Full-text / Regex Search across name, tags, description, and cuisines
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { cuisines: searchRegex },
        { tags: searchRegex },
      ];
    }

    // 2. Cuisine Filter
    if (cuisine && cuisine !== 'All') {
      query.cuisines = { $in: [new RegExp(`^${cuisine}$`, 'i')] };
    }

    // 3. Rating Filter (e.g. 4.0+)
    if (rating) {
      query.rating = { $gte: Number(rating) };
    }

    // 4. Pure Veg Filter
    if (isVegOnly === 'true' || isVegOnly === true) {
      query.isVegOnly = true;
    }

    // 5. Max Delivery Time Filter (e.g. <= 30 mins)
    if (maxDeliveryTime) {
      query.deliveryTimeMinutes = { $lte: Number(maxDeliveryTime) };
    }

    // 6. Price Tier Filter ($, $$, $$$, $$$$)
    if (priceTier) {
      query.priceTier = priceTier;
    }

    // 7. Featured Filter
    if (featured === 'true' || featured === true) {
      query.isFeatured = true;
    }

    // Build Sorting
    let sortOptions = { rating: -1 }; // default: highest rating first
    if (sortBy === 'rating_desc') sortOptions = { rating: -1, ratingCount: -1 };
    else if (sortBy === 'time_asc') sortOptions = { deliveryTimeMinutes: 1 };
    else if (sortBy === 'price_asc') sortOptions = { priceForTwo: 1 };
    else if (sortBy === 'price_desc') sortOptions = { priceForTwo: -1 };
    else if (sortBy === 'popular') sortOptions = { ratingCount: -1 };

    const restaurants = await Restaurant.find(query).sort(sortOptions);

    // Extract unique cuisine list for quick filter chips on frontend
    const allCuisines = await Restaurant.distinct('cuisines');

    res.json({
      success: true,
      count: restaurants.length,
      cuisines: allCuisines,
      data: restaurants,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc    Get single restaurant by ID or Slug with all its menu dishes
 * @route   GET /api/restaurants/:idOrSlug
 * @access  Public
 */
const getRestaurantById = async (req, res) => {
  try {
    const { idOrSlug } = req.params;

    let restaurant;
    if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
      restaurant = await Restaurant.findById(idOrSlug);
    } else {
      restaurant = await Restaurant.findOne({ slug: idOrSlug });
    }

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found',
      });
    }

    // Fetch all active dishes belonging to this restaurant
    const dishes = await Dish.find({ restaurant: restaurant._id, isAvailable: true }).sort({
      isBestseller: -1,
      category: 1,
      price: 1,
    });

    // Group dishes by category for the sticky menu tabs
    const categoriesMap = {};
    dishes.forEach(dish => {
      if (!categoriesMap[dish.category]) {
        categoriesMap[dish.category] = [];
      }
      categoriesMap[dish.category].push(dish);
    });

    const menuByCategory = Object.keys(categoriesMap).map(categoryName => ({
      categoryName,
      items: categoriesMap[categoryName],
    }));

    res.json({
      success: true,
      data: {
        restaurant,
        dishes,
        menuByCategory,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc    Create new restaurant (Admin only)
 * @route   POST /api/restaurants
 * @access  Private (restaurant_admin)
 */
const createRestaurant = async (req, res) => {
  try {
    const restaurantData = {
      ...req.body,
      owner: req.user._id,
    };

    const restaurant = await Restaurant.create(restaurantData);

    // Link restaurant to user
    req.user.managedRestaurant = restaurant._id;
    await req.user.save();

    res.status(201).json({
      success: true,
      message: 'Restaurant created successfully',
      data: restaurant,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/**
 * @desc    Update restaurant details
 * @route   PUT /api/restaurants/:id
 * @access  Private (restaurant_admin)
 */
const updateRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    // Authorization check
    if (
      restaurant.owner &&
      restaurant.owner.toString() !== req.user._id.toString() &&
      req.user.role !== 'restaurant_admin'
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this restaurant' });
    }

    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Restaurant updated successfully',
      data: updatedRestaurant,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/**
 * @desc    Delete restaurant
 * @route   DELETE /api/restaurants/:id
 * @access  Private (restaurant_admin)
 */
const deleteRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    await Dish.deleteMany({ restaurant: restaurant._id });
    await restaurant.deleteOne();

    res.json({
      success: true,
      message: 'Restaurant and all associated dishes deleted successfully',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getAllRestaurants,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
};
