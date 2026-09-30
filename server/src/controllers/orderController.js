/**
 * Order Controller
 * Manages full order lifecycle state machine, real-time Socket.IO notifications,
 * pricing recalculation, and automatic GPS rider tracking initialization.
 */

const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const Dish = require('../models/Dish');
const Coupon = require('../models/Coupon');
const { getIO } = require('../config/socket');
const { startRiderSimulation, stopRiderSimulation, generateRouteWaypoints } = require('../services/riderSimulationService');

/**
 * @desc    Create new order & initialize tracking route
 * @route   POST /api/orders
 * @access  Private (customer)
 */
const createOrder = async (req, res) => {
  try {
    const {
      restaurantId,
      items,
      deliveryAddress,
      paymentMethod,
      couponCode,
      deliveryNotes,
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart items cannot be empty' });
    }

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    // Recalculate and verify pricing on the server to prevent tamper
    let subtotal = 0;
    const formattedItems = [];

    for (const item of items) {
      const dishDoc = await Dish.findById(item.dishId || item.dish || item._id);
      if (!dishDoc) {
        return res.status(404).json({ success: false, message: `Dish ${item.name || item.dishId} not found` });
      }

      let itemPrice = dishDoc.price;
      // Add optional extra customization pricing
      if (item.selectedOptions && Array.isArray(item.selectedOptions)) {
        for (const opt of item.selectedOptions) {
          if (opt.price) itemPrice += Number(opt.price);
        }
      }

      const qty = Number(item.quantity) || 1;
      subtotal += itemPrice * qty;

      formattedItems.push({
        dish: dishDoc._id,
        name: dishDoc.name,
        price: itemPrice,
        quantity: qty,
        isVeg: dishDoc.isVeg,
        image: dishDoc.image,
        model3dType: dishDoc.model3dType || 'default',
        selectedOptions: item.selectedOptions || [],
      });
    }

    // Apply Coupon Discount if provided
    let discount = 0;
    let appliedCoupon = null;
    if (couponCode) {
      const couponDoc = await Coupon.findOne({
        code: couponCode.toUpperCase().trim(),
        isActive: true,
        expiryDate: { $gte: new Date() },
      });

      if (couponDoc && subtotal >= couponDoc.minOrderAmount) {
        discount = (subtotal * couponDoc.discountPercent) / 100;
        if (discount > couponDoc.maxDiscount) {
          discount = couponDoc.maxDiscount;
        }
        appliedCoupon = {
          code: couponDoc.code,
          discount: Number(discount.toFixed(2)),
        };
      }
    }

    const tax = Number((subtotal * 0.08).toFixed(2)); // 8% standard tax
    const deliveryFee = subtotal > 40 ? 0 : restaurant.deliveryFee || 2.99;
    const total = Number((subtotal + tax + deliveryFee - discount).toFixed(2));

    // Generate unique order reference number (e.g. FV-89241)
    const randomDigits = Math.floor(10000 + Math.random() * 90000);
    const orderNumber = `FV-${randomDigits}`;

    // Geolocation coordinates for Leaflet route
    const startLat = restaurant.location?.lat || 37.7833;
    const startLng = restaurant.location?.lng || -122.4167;
    const destLat = deliveryAddress?.lat || 37.7749;
    const destLng = deliveryAddress?.lng || -122.4194;

    const routePolyline = generateRouteWaypoints(startLat, startLng, destLat, destLng, 25);

    const order = await Order.create({
      orderNumber,
      customer: {
        user: req.user._id,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone || '+1 (555) 019-2834',
      },
      restaurant: {
        restaurantId: restaurant._id,
        name: restaurant.name,
        image: restaurant.image,
        address: `${restaurant.address.street}, ${restaurant.address.city}`,
        location: { lat: startLat, lng: startLng },
      },
      deliveryPartner: {
        name: 'Alex "Swift" Morgan',
        phone: '+1 (555) 432-8765',
        vehicleNumber: 'SF-E-BIKE-904',
        vehicleType: 'Electric High-Speed Scooter',
        rating: 4.9,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
      },
      items: formattedItems,
      pricing: {
        subtotal: Number(subtotal.toFixed(2)),
        tax,
        deliveryFee,
        discount: Number(discount.toFixed(2)),
        total,
      },
      coupon: appliedCoupon || { code: null, discount: 0 },
      paymentMethod: paymentMethod || 'card',
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
      orderStatus: 'Placed',
      deliveryAddress: {
        street: deliveryAddress?.street || '452 Innovation Blvd, Apt 7B',
        city: deliveryAddress?.city || 'San Francisco',
        state: deliveryAddress?.state || 'CA',
        zipCode: deliveryAddress?.zipCode || '94107',
        lat: destLat,
        lng: destLng,
        deliveryNotes: deliveryNotes || '',
      },
      liveLocation: {
        lat: startLat,
        lng: startLng,
        heading: 0,
        speedKmh: 28,
        currentStepIndex: 0,
        totalSteps: routePolyline.length,
      },
      routePolyline,
      statusTimeline: [
        {
          status: 'Placed',
          timestamp: new Date(),
          note: 'Order successfully placed. Waiting for restaurant confirmation.',
        },
      ],
      estimatedDeliveryMinutes: restaurant.deliveryTimeMinutes || 25,
      estimatedDeliveryTime: new Date(Date.now() + (restaurant.deliveryTimeMinutes || 25) * 60000),
    });

    // Notify Restaurant Admin via Socket.IO
    try {
      const io = getIO();
      io.to(`restaurant:${restaurant._id}`).emit('restaurant:newOrder', {
        orderId: order._id,
        orderNumber: order.orderNumber,
        customerName: order.customer.name,
        total: order.pricing.total,
        itemCount: order.items.length,
        order,
      });
    } catch (socketErr) {
      console.warn('Socket emit notice (non-fatal):', socketErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Order placed successfully! Real-time tracking enabled.',
      data: order,
    });
  } catch (err) {
    console.error('Order creation error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc    Get order details by ID
 * @route   GET /api/orders/:id
 * @access  Private
 */
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc    Get all orders of logged-in customer
 * @route   GET /api/orders/customer/my-orders
 * @access  Private (customer)
 */
const getCustomerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ 'customer.user': req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc    Get all orders for a restaurant (for Restaurant Admin Dashboard)
 * @route   GET /api/orders/restaurant/:restaurantId
 * @access  Private (restaurant_admin)
 */
const getRestaurantOrders = async (req, res) => {
  try {
    const orders = await Order.find({ 'restaurant.restaurantId': req.params.restaurantId }).sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc    Get active delivery jobs for delivery partner
 * @route   GET /api/orders/delivery/jobs
 * @access  Private (delivery_partner)
 */
const getDeliveryPartnerOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      orderStatus: { $in: ['Preparing', 'Out for Delivery'] },
    }).sort({ createdAt: -1 });

    res.json({ success: true, count: orders.length, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc    Update order status in lifecycle (Placed -> Accepted -> Preparing -> Out for Delivery -> Delivered)
 * @route   PATCH /api/orders/:id/status
 * @access  Private
 */
const updateOrderStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const validStatuses = ['Placed', 'Accepted', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status: ${status}` });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.orderStatus = status;
    order.statusTimeline.push({
      status,
      timestamp: new Date(),
      note: note || `Order marked as ${status}`,
    });

    if (status === 'Delivered') {
      order.deliveredAt = new Date();
      stopRiderSimulation(order._id);
    } else if (status === 'Cancelled') {
      stopRiderSimulation(order._id);
    }

    await order.save();

    // Trigger Socket.IO Real-time Broadcast
    try {
      const io = getIO();

      // Emit status update to the order tracking room
      io.to(`order:${order._id}`).emit('order:statusUpdate', {
        orderId: order._id,
        orderNumber: order.orderNumber,
        orderStatus: status,
        timestamp: new Date(),
        note: note || `Order updated to ${status}`,
        order,
      });

      // Also emit to restaurant room
      io.to(`restaurant:${order.restaurant.restaurantId}`).emit('order:statusUpdate', {
        orderId: order._id,
        orderStatus: status,
      });

      // If status changed to "Out for Delivery", kick off live GPS Simulation!
      if (status === 'Out for Delivery') {
        startRiderSimulation(order._id, io);
      }
    } catch (socketErr) {
      console.warn('Socket broadcast warning:', socketErr.message);
    }

    res.json({
      success: true,
      message: `Order status updated to ${status}`,
      data: order,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc    Simulate fast-forwarding or advancing the order status (Instant Viva Demo helper)
 * @route   POST /api/orders/:id/advance-status
 * @access  Public / Private
 */
const advanceOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const stages = ['Placed', 'Accepted', 'Preparing', 'Out for Delivery', 'Delivered'];
    const currentIndex = stages.indexOf(order.orderStatus);

    if (currentIndex === -1 || currentIndex >= stages.length - 1) {
      return res.json({
        success: true,
        message: 'Order is already in its final state',
        data: order,
      });
    }

    const nextStatus = stages[currentIndex + 1];
    order.orderStatus = nextStatus;
    order.statusTimeline.push({
      status: nextStatus,
      timestamp: new Date(),
      note: `Advanced to ${nextStatus}`,
    });

    if (nextStatus === 'Delivered') {
      order.deliveredAt = new Date();
      stopRiderSimulation(order._id);
    }

    await order.save();

    try {
      const io = getIO();
      io.to(`order:${order._id}`).emit('order:statusUpdate', {
        orderId: order._id,
        orderNumber: order.orderNumber,
        orderStatus: nextStatus,
        timestamp: new Date(),
        note: `Order advanced to ${nextStatus}`,
        order,
      });

      if (nextStatus === 'Out for Delivery') {
        startRiderSimulation(order._id, io);
      }
    } catch (socketErr) {
      console.warn('Socket notice:', socketErr.message);
    }

    res.json({
      success: true,
      message: `Order advanced to ${nextStatus}`,
      data: order,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc    Add review/rating for a delivered order
 * @route   POST /api/orders/:id/review
 * @access  Private (customer)
 */
const addOrderReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.review = {
      rating: Number(rating),
      comment: comment || '',
      createdAt: new Date(),
    };

    await order.save();

    // Update restaurant rating stats
    const restaurant = await Restaurant.findById(order.restaurant.restaurantId);
    if (restaurant) {
      const newRatingCount = (restaurant.ratingCount || 0) + 1;
      const newRating = (
        ((restaurant.rating || 4.5) * (restaurant.ratingCount || 100) + Number(rating)) /
        newRatingCount
      ).toFixed(1);

      restaurant.rating = Number(newRating);
      restaurant.ratingCount = newRatingCount;
      await restaurant.save();
    }

    res.json({
      success: true,
      message: 'Thank you for your review!',
      data: order,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createOrder,
  getOrderById,
  getCustomerOrders,
  getRestaurantOrders,
  getDeliveryPartnerOrders,
  updateOrderStatus,
  advanceOrderStatus,
  addOrderReview,
};
