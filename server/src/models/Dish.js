/**
 * Dish Model
 * Represents an individual menu item belonging to a restaurant.
 * Includes dietary tags, pricing, customizable add-on options, and 3D preview model hints.
 */

const mongoose = require('mongoose');

const dishOptionChoiceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, default: 0 },
});

const dishOptionSchema = new mongoose.Schema({
  title: { type: String, required: true }, // e.g., "Choose Size", "Extra Toppings"
  required: { type: Boolean, default: false },
  maxSelect: { type: Number, default: 1 },
  choices: [dishOptionChoiceSchema],
});

const dishSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Dish name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Dish description is required'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    originalPrice: {
      type: Number,
      default: null,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    image: {
      type: String,
      required: true,
    },
    isVeg: {
      type: Boolean,
      default: false,
    },
    isBestseller: {
      type: Boolean,
      default: false,
    },
    isSpicy: {
      type: Boolean,
      default: false,
    },
    spiceLevel: {
      type: Number,
      min: 0,
      max: 3,
      default: 0,
    },
    calories: {
      type: Number,
      default: 450,
    },
    prepTimeMinutes: {
      type: Number,
      default: 15,
    },
    rating: {
      type: Number,
      default: 4.6,
      min: 1,
      max: 5,
    },
    ratingCount: {
      type: Number,
      default: 54,
    },
    model3dType: {
      type: String,
      enum: ['burger', 'pizza', 'drink', 'donut', 'fries', 'taco', 'sushi', 'bowl', 'default'],
      default: 'default',
    },
    options: [dishOptionSchema],
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Dish = mongoose.model('Dish', dishSchema);
const { createModelAdapter } = require('./modelAdapter');
module.exports = createModelAdapter('dishes', Dish);
