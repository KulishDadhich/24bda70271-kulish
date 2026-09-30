/**
 * Coupon Controller
 * Handles coupon validation and active promo code listings.
 */

const Coupon = require('../models/Coupon');

/**
 * @desc    Validate a promo code
 * @route   POST /api/coupons/validate
 * @access  Public
 */
const validateCoupon = async (req, res) => {
  try {
    const { code, orderAmount } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, message: 'Please enter a coupon code' });
    }

    const coupon = await Coupon.findOne({
      code: code.toUpperCase().trim(),
      isActive: true,
      expiryDate: { $gte: new Date() },
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired promo code',
      });
    }

    const subtotal = Number(orderAmount) || 0;
    if (subtotal < coupon.minOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `This coupon requires a minimum order of $${coupon.minOrderAmount}`,
      });
    }

    let discount = (subtotal * coupon.discountPercent) / 100;
    if (discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }

    res.json({
      success: true,
      message: `Coupon '${coupon.code}' applied! You save $${discount.toFixed(2)}`,
      data: {
        code: coupon.code,
        title: coupon.title,
        description: coupon.description,
        discountPercent: coupon.discountPercent,
        discountAmount: Number(discount.toFixed(2)),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @desc    Get all active public coupons
 * @route   GET /api/coupons
 * @access  Public
 */
const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({
      isActive: true,
      expiryDate: { $gte: new Date() },
    }).select('-__v');

    res.json({ success: true, count: coupons.length, data: coupons });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  validateCoupon,
  getAllCoupons,
};
