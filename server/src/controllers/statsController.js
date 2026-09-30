/**
 * Analytics & Stats Controller
 * Computes live revenue, order volume metrics, status distributions,
 * and top-selling dishes for Restaurant Admin & System dashboards.
 */

const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const Dish = require('../models/Dish');

/**
 * @desc    Get dashboard analytics for a restaurant
 * @route   GET /api/stats/restaurant/:restaurantId
 * @access  Private (restaurant_admin)
 */
const getRestaurantStats = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const orders = await Order.find({ 'restaurant.restaurantId': restaurantId });

    const totalOrders = orders.length;
    let totalRevenue = 0;
    let deliveredOrders = 0;
    let activeOrders = 0;
    let cancelledOrders = 0;

    const statusCounts = {
      Placed: 0,
      Accepted: 0,
      Preparing: 0,
      'Out for Delivery': 0,
      Delivered: 0,
      Cancelled: 0,
    };

    const dishSalesMap = {};

    orders.forEach(order => {
      if (order.orderStatus === 'Delivered') {
        deliveredOrders++;
        totalRevenue += order.pricing.total || 0;
      } else if (order.orderStatus === 'Cancelled') {
        cancelledOrders++;
      } else {
        activeOrders++;
      }

      if (statusCounts[order.orderStatus] !== undefined) {
        statusCounts[order.orderStatus]++;
      }

      // Track item volume
      order.items.forEach(item => {
        const name = item.name;
        if (!dishSalesMap[name]) {
          dishSalesMap[name] = { name, quantity: 0, revenue: 0 };
        }
        dishSalesMap[name].quantity += item.quantity;
        dishSalesMap[name].revenue += item.price * item.quantity;
      });
    });

    const topDishes = Object.values(dishSalesMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // Mock weekly revenue trend
    const recentRevenueTrend = [
      { day: 'Mon', revenue: Math.round(totalRevenue * 0.12 + 80) },
      { day: 'Tue', revenue: Math.round(totalRevenue * 0.14 + 110) },
      { day: 'Wed', revenue: Math.round(totalRevenue * 0.11 + 95) },
      { day: 'Thu', revenue: Math.round(totalRevenue * 0.16 + 140) },
      { day: 'Fri', revenue: Math.round(totalRevenue * 0.22 + 220) },
      { day: 'Sat', revenue: Math.round(totalRevenue * 0.25 + 280) },
      { day: 'Sun', revenue: Math.round(totalRevenue * 0.20 + 210) },
    ];

    res.json({
      success: true,
      data: {
        totalRevenue: Number(totalRevenue.toFixed(2)),
        totalOrders,
        activeOrders,
        deliveredOrders,
        cancelledOrders,
        averageOrderValue: totalOrders > 0 ? Number((totalRevenue / (deliveredOrders || 1)).toFixed(2)) : 0,
        statusCounts,
        topDishes,
        recentRevenueTrend,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getRestaurantStats,
};
