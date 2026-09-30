/**
 * User Model
 * Defines authentication credentials, role-based authorization (customer, restaurant_admin, delivery_partner),
 * profile information, and default delivery address.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [50, 'Name cannot be more than 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Do not return password by default in queries
    },
    role: {
      type: String,
      enum: ['customer', 'restaurant_admin', 'delivery_partner'],
      default: 'customer',
    },
    phone: {
      type: String,
      default: '+1 (555) 019-2834',
    },
    avatar: {
      type: String,
      default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    },
    address: {
      street: { type: String, default: '452 Innovation Blvd, Apt 7B' },
      city: { type: String, default: 'San Francisco' },
      state: { type: String, default: 'CA' },
      zipCode: { type: String, default: '94107' },
      lat: { type: Number, default: 37.7749 },
      lng: { type: Number, default: -122.4194 },
    },
    managedRestaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Encrypt password using bcrypt before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered password with hashed password in DB
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
const { createModelAdapter } = require('./modelAdapter');
module.exports = createModelAdapter('users', User);
