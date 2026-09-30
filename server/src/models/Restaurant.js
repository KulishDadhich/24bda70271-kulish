/**
 * Restaurant Model
 * Stores restaurant profile, geolocation coordinates (used in Leaflet map route calculations),
 * cuisine tags, price tier, delivery speed, and rating statistics.
 */

const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Restaurant name is required'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    tagline: {
      type: String,
      default: 'Delicious crafted culinary experience',
    },
    description: {
      type: String,
      required: [true, 'Restaurant description is required'],
    },
    cuisines: {
      type: [String],
      required: true,
      validate: [v => v.length > 0, 'At least one cuisine is required'],
    },
    rating: {
      type: Number,
      default: 4.5,
      min: 1.0,
      max: 5.0,
    },
    ratingCount: {
      type: Number,
      default: 120,
    },
    deliveryTimeMinutes: {
      type: Number,
      default: 30, // e.g. 25-35 mins
    },
    deliveryFee: {
      type: Number,
      default: 2.99,
    },
    priceForTwo: {
      type: Number,
      default: 30,
    },
    priceTier: {
      type: String,
      enum: ['$', '$$', '$$$', '$$$$'],
      default: '$$',
    },
    isVegOnly: {
      type: Boolean,
      default: false,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isOpen: {
      type: Boolean,
      default: true,
    },
    discountBadge: {
      type: String,
      default: '20% OFF UPTO $10',
    },
    tags: [String],
    image: {
      type: String,
      required: true,
    },
    banner: {
      type: String,
      required: true,
    },
    address: {
      street: { type: String, required: true },
      city: { type: String, default: 'San Francisco' },
      state: { type: String, default: 'CA' },
      zipCode: { type: String, default: '94103' },
    },
    // Geolocation coordinates for Leaflet real-time routing
    location: {
      lat: {
        type: Number,
        required: true,
        default: 37.7833,
      },
      lng: {
        type: Number,
        required: true,
        default: -122.4167,
      },
    },
    menuCategories: {
      type: [String],
      default: ['Recommended', 'Starters', 'Main Course', 'Beverages', 'Desserts'],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Auto slug generation before validation
restaurantSchema.pre('validate', function (next) {
  if (this.name && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
  }
  next();
});

const Restaurant = mongoose.model('Restaurant', restaurantSchema);
const { createModelAdapter } = require('./modelAdapter');
module.exports = createModelAdapter('restaurants', Restaurant);
