/**
 * Slide-In Cart Drawer
 * Manages item quantities, promo code verification, and real-time price calculations.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ShoppingBag, Plus, Minus, Trash2, Tag, ArrowRight, Sparkles, Check, AlertCircle } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { useAuthStore } from '../../store/useAuthStore';
import api from '../../services/api';

export const CartDrawer = ({ onOpenCheckout }) => {
  const navigate = useNavigate();
  const {
    items,
    restaurant,
    coupon,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeItem,
    clearCart,
    applyCoupon,
    removeCoupon,
    getSubtotal,
    getTax,
    getDeliveryFee,
    getDiscount,
    getTotal,
  } = useCartStore();

  const { isAuthenticated } = useAuthStore();

  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');

  if (!isCartOpen) return null;

  const subtotal = getSubtotal();
  const tax = getTax();
  const deliveryFee = getDeliveryFee();
  const discount = getDiscount();
  const total = getTotal();

  const handleApplyCoupon = async e => {
    e.preventDefault();
    if (!promoCodeInput.trim()) return;

    setPromoLoading(true);
    setPromoError('');
    setPromoSuccess('');

    try {
      const res = await api.post('/coupons/validate', {
        code: promoCodeInput.trim(),
        orderAmount: subtotal,
      });

      applyCoupon({
        code: res.data.data.code,
        title: res.data.data.title,
        discountPercent: res.data.data.discountPercent,
        discountAmount: res.data.data.discountAmount,
      });

      setPromoSuccess(res.data.message);
      setPromoCodeInput('');
    } catch (err) {
      setPromoError(err.response?.data?.message || 'Invalid or expired promo code');
    } finally {
      setPromoLoading(false);
    }
  };

  const handleProceed = () => {
    if (!isAuthenticated) {
      setIsCartOpen(false);
      navigate('/login?redirect=checkout');
      return;
    }
    onOpenCheckout();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md glass-panel bg-dark-900/95 border-l border-white/10 shadow-2xl flex flex-col">
          {/* 1. Header */}
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-500/20 text-brand-400 border border-brand-500/30 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-white">Your Food Cart</h3>
                {restaurant && (
                  <p className="text-xs text-brand-400 truncate max-w-[220px]">
                    from {restaurant.name}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {items.length > 0 && (
                <button
                  onClick={clearCart}
                  className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-white/5 transition-colors"
                  title="Clear Cart"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 2. Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-4xl">
                  🥣
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">Your cart is empty</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Explore our cosmic restaurants and add your favorite dishes!
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('/restaurants');
                  }}
                  className="btn-primary text-xs"
                >
                  Browse Menu
                </button>
              </div>
            ) : (
              items.map((item, idx) => (
                <div
                  key={idx}
                  className="glass-card rounded-2xl p-3.5 border border-white/5 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-14 h-14 rounded-xl object-cover bg-dark-950"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <div
                          className={`w-3 h-3 border flex items-center justify-center rounded-sm shrink-0 ${
                            item.isVeg ? 'border-emerald-500' : 'border-red-500'
                          }`}
                        >
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${
                              item.isVeg ? 'bg-emerald-500' : 'bg-red-500'
                            }`}
                          />
                        </div>
                        <h4 className="font-bold text-xs text-white line-clamp-1">{item.name}</h4>
                      </div>

                      <p className="text-xs font-bold text-slate-300 mt-1">
                        ${(item.price * item.quantity).toFixed(2)}
                        {item.quantity > 1 && (
                          <span className="text-[10px] text-slate-500 font-normal">
                            {' '}
                            (${item.price} each)
                          </span>
                        )}
                      </p>

                      {/* Customization choices */}
                      {item.selectedOptions && item.selectedOptions.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.selectedOptions.map((opt, i) => (
                            <span
                              key={i}
                              className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-slate-400"
                            >
                              {opt.choice}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-dark-950 border border-white/10 text-xs">
                    <button
                      onClick={() =>
                        updateQuantity(item.dishId, item.quantity - 1, item.selectedOptions)
                      }
                      className="text-slate-400 hover:text-white p-0.5"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-4 text-center font-bold text-white">{item.quantity}</span>
                    <button
                      onClick={() =>
                        updateQuantity(item.dishId, item.quantity + 1, item.selectedOptions)
                      }
                      className="text-slate-400 hover:text-white p-0.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 3. Promo Code & Checkout Section (Only if items exist) */}
          {items.length > 0 && (
            <div className="p-5 border-t border-white/10 bg-dark-950/60 space-y-4">
              {/* Promo Code Input */}
              <div>
                {coupon ? (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-emerald-400" />
                      <div>
                        <span className="font-bold">{coupon.code}</span> Applied! (Saved ${discount.toFixed(2)})
                      </div>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-emerald-400 hover:text-emerald-200 font-bold text-xs"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={promoCodeInput}
                          onChange={e => setPromoCodeInput(e.target.value.toUpperCase())}
                          placeholder="Try FOODVERSE50 or TASTY30"
                          className="w-full pl-9 pr-3 py-2 rounded-xl glass-input text-xs uppercase font-semibold"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={promoLoading || !promoCodeInput.trim()}
                        className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/10 disabled:opacity-50"
                      >
                        {promoLoading ? '...' : 'Apply'}
                      </button>
                    </div>
                    {promoError && (
                      <p className="text-[11px] text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {promoError}
                      </p>
                    )}
                    {promoSuccess && (
                      <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                        <Check className="w-3 h-3" /> {promoSuccess}
                      </p>
                    )}
                  </form>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-slate-400 pt-2 border-t border-white/5">
                <div className="flex justify-between">
                  <span>Item Subtotal</span>
                  <span className="text-slate-200">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST & Restaurant Taxes (8%)</span>
                  <span className="text-slate-200">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span className={deliveryFee === 0 ? 'text-emerald-400 font-bold' : 'text-slate-200'}>
                    {deliveryFee === 0 ? 'FREE' : `$${deliveryFee.toFixed(2)}`}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-bold">
                    <span>Coupon Discount</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-white/10">
                  <span>Grand Total</span>
                  <span className="text-brand-400 text-base">${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleProceed}
                className="w-full py-3 rounded-2xl btn-primary text-sm font-bold shadow-glow-md flex items-center justify-center gap-2"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;
