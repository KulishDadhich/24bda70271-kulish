/**
 * Authentication Controller
 * Handles user registration, login, token issuance, demo logins, and profile management.
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper to generate JWT Token
const generateToken = id => {
  const secret = process.env.JWT_SECRET || 'foodverse_super_secret_jwt_key_2024_viva_ready_789';
  return jwt.sign({ id }, secret, {
    expiresIn: '30d',
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, phone, address } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email address',
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'customer',
      phone: phone || '+1 (555) 019-2834',
      address: address || {
        street: '452 Innovation Blvd, Apt 7B',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94107',
        lat: 37.7749,
        lng: -122.4194,
      },
    });

    if (user) {
      res.status(201).json({
        success: true,
        message: 'Account created successfully',
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          avatar: user.avatar,
          address: user.address,
          token: generateToken(user._id),
        },
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid user data received' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc    Login user & get JWT token
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
    }

    // Find user & include password field for comparison
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    res.json({
      success: true,
      message: 'Logged in successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        address: user.address,
        managedRestaurant: user.managedRestaurant,
        token: generateToken(user._id),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc    Get current logged in user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('managedRestaurant');
    res.json({
      success: true,
      data: user,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc    Update user profile & delivery address
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.phone = req.body.phone || user.phone;
      if (req.body.address) {
        user.address = { ...user.address.toObject(), ...req.body.address };
      }

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          phone: updatedUser.phone,
          avatar: updatedUser.avatar,
          address: updatedUser.address,
          token: generateToken(updatedUser._id),
        },
      });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc    Provide list of 1-Click Demo Accounts for easy Viva evaluation
 * @route   GET /api/auth/demo-accounts
 * @access  Public
 */
const getDemoAccounts = (req, res) => {
  res.json({
    success: true,
    data: [
      {
        role: 'customer',
        name: 'Alex Johnson (Customer)',
        email: 'customer@foodverse.com',
        password: 'password123',
        description: 'Browse menu, customize food items, add to cart, and track orders in 3D real-time map.',
      },
      {
        role: 'restaurant_admin',
        name: 'Chef Marco Bellini (Restaurant Admin)',
        email: 'restaurant@foodverse.com',
        password: 'password123',
        description: 'Accept/reject orders, advance kitchen status, manage menu items, and view sales stats.',
      },
      {
        role: 'delivery_partner',
        name: 'Sam Ryder (Delivery Partner)',
        email: 'delivery@foodverse.com',
        password: 'password123',
        description: 'View assigned delivery routes, pickup orders, and simulate live GPS transit.',
      },
    ],
  });
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  getDemoAccounts,
};
