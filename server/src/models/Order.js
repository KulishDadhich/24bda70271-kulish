/**
 * Order Model
 * Central entity for the FoodVerse order lifecycle and real-time GPS tracking engine.
 * Stores route waypoints, dynamic rider coordinates, status history, and payment state.
 */

const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  dish: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dish',
    required: true,
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  isVeg: { type: Boolean, default: false },
  image: { type: String },
  model3dType: { type: String, default: 'default' },
  selectedOptions: [
    {
      title: String,
      choice: String,
      price: Number,
    },
  ],
});

const statusTimelineSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['Placed', 'Accepted', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'],
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  note: {
    type: String,
    default: '',
  },
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      required: true,
    },
    customer: {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
    },
    restaurant: {
      restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true,
      },
      name: { type: String, required: true },
      image: { type: String },
      address: { type: String },
      location: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
      },
    },
    deliveryPartner: {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      name: { type: String, default: 'Alex Morgan' },
      phone: { type: String, default: '+1 (555) 432-8765' },
      vehicleNumber: { type: String, default: 'SF-E-BIKE-904' },
      vehicleType: { type: String, default: 'Electric Eco-Scooter' },
      rating: { type: Number, default: 4.9 },
      avatar: {
        type: String,
        default: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
      },
    },
    items: [orderItemSchema],
    pricing: {
      subtotal: { type: Number, required: true },
      tax: { type: Number, required: true }, // e.g. 8%
      deliveryFee: { type: Number, required: true },
      discount: { type: Number, default: 0 },
      total: { type: Number, required: true },
    },
    coupon: {
      code: { type: String, default: null },
      discount: { type: Number, default: 0 },
    },
    paymentMethod: {
      type: String,
      enum: ['cod', 'card', 'upi'],
      default: 'card',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'paid',
    },
    orderStatus: {
      type: String,
      enum: ['Placed', 'Accepted', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'],
      default: 'Placed',
      index: true,
    },
    deliveryAddress: {
      street: { type: String, required: true },
      city: { type: String, default: 'San Francisco' },
      state: { type: String, default: 'CA' },
      zipCode: { type: String, default: '94107' },
      lat: { type: Number, default: 37.7749 },
      lng: { type: Number, default: -122.4194 },
      deliveryNotes: { type: String, default: '' },
    },
    // Real-Time GPS simulation coordinates
    liveLocation: {
      lat: { type: Number },
      lng: { type: Number },
      heading: { type: Number, default: 0 },
      speedKmh: { type: Number, default: 28 },
      currentStepIndex: { type: Number, default: 0 },
      totalSteps: { type: Number, default: 0 },
    },
    // Polyline coordinates array [ [lat, lng], [lat, lng], ... ]
    routePolyline: [
      {
        lat: { type: Number },
        lng: { type: Number },
      },
    ],
    statusTimeline: [statusTimelineSchema],
    estimatedDeliveryMinutes: {
      type: Number,
      default: 25,
    },
    estimatedDeliveryTime: {
      type: Date,
    },
    deliveredAt: {
      type: Date,
    },
    review: {
      rating: { type: Number, min: 1, max: 5 },
      comment: { type: String },
      createdAt: { type: Date },
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model('Order', orderSchema);
const { createModelAdapter } = require('./modelAdapter');
module.exports = createModelAdapter('orders', Order);
