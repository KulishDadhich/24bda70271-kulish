/**
 * Checkout Modal & Payment Simulation
 * Collects delivery address, mocks Payment Gateway (Card / UPI / COD),
 * triggers celebratory confetti, and launches live real-time GPS tracking.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  CreditCard,
  QrCode,
  Banknote,
  MapPin,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCartStore } from '../../store/useCartStore';
import { useAuthStore } from '../../store/useAuthStore';
import api from '../../services/api';

export const CheckoutModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    items,
    restaurant,
    coupon,
    getSubtotal,
    getTax,
    getDeliveryFee,
    getDiscount,
    getTotal,
    clearCart,
    setIsCartOpen,
  } = useCartStore();

  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Address fields
  const [street, setStreet] = useState(user?.address?.street || '452 Innovation Blvd, Apt 7B');
  const [city, setCity] = useState(user?.address?.city || 'San Francisco');
  const [state, setState] = useState(user?.address?.state || 'CA');
  const [zipCode, setZipCode] = useState(user?.address?.zipCode || '94107');
  const [deliveryNotes, setDeliveryNotes] = useState('Please leave near front door.');

  // Mock Card Details
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExp, setCardExp] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('890');

  if (!isOpen || items.length === 0 || !restaurant) return null;

  const total = getTotal();

  const handlePlaceOrder = async e => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const orderPayload = {
        restaurantId: restaurant._id,
        items: items.map(item => ({
          dishId: item.dishId,
          quantity: item.quantity,
          selectedOptions: item.selectedOptions || [],
        })),
        deliveryAddress: {
          street,
          city,
          state,
          zipCode,
          lat: user?.address?.lat || 37.7749,
          lng: user?.address?.lng || -122.4194,
          deliveryNotes,
        },
        paymentMethod,
        couponCode: coupon?.code || null,
        deliveryNotes,
      };

      const res = await api.post('/orders', orderPayload);
      const createdOrder = res.data.data;

      // 🎆 Trigger Celebratory Confetti Blast
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ff416c', '#ff4b2b', '#ffa500', '#00f0ff'],
      });

      // Clear cart & state
      clearCart();
      setIsCartOpen(false);
      onClose();

      // Navigate to Live Order Tracking Page
      navigate(`/track/${createdOrder._id}`);
    } catch (err) {
      console.error('Order placement failed:', err);
      setError(err.response?.data?.message || 'Failed to place order. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="glass-panel max-w-xl w-full rounded-3xl p-6 sm:p-8 border border-white/20 shadow-2xl relative my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/10 text-slate-300 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-500/20 text-brand-400 border border-brand-500/30 inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Final Step
          </span>
          <h2 className="font-display text-2xl font-bold text-white mt-2">Delivery & Payment</h2>
          <p className="text-xs text-slate-400">Ordering from {restaurant.name} • Total ${total.toFixed(2)}</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handlePlaceOrder} className="space-y-6">
          {/* 1. Delivery Address */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-brand-400" />
              Delivery Location
            </h3>

            <div className="space-y-2">
              <input
                type="text"
                required
                value={street}
                onChange={e => setStreet(e.target.value)}
                placeholder="Street Address, Apt / Suite"
                className="w-full px-4 py-2.5 rounded-xl glass-input text-xs"
              />

              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  required
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder="City"
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs"
                />
                <input
                  type="text"
                  required
                  value={state}
                  onChange={e => setState(e.target.value)}
                  placeholder="State"
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs"
                />
                <input
                  type="text"
                  required
                  value={zipCode}
                  onChange={e => setZipCode(e.target.value)}
                  placeholder="Zip Code"
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs"
                />
              </div>

              <input
                type="text"
                value={deliveryNotes}
                onChange={e => setDeliveryNotes(e.target.value)}
                placeholder="Delivery instructions (e.g. Ring bell, gate code #402)"
                className="w-full px-4 py-2 rounded-xl glass-input text-xs"
              />
            </div>
          </div>

          {/* 2. Payment Method Selector */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Payment Method (Simulated Gateway)
            </h3>

            <div className="grid grid-cols-3 gap-3">
              {/* Option 1: Card */}
              <div
                onClick={() => setPaymentMethod('card')}
                className={`p-3 rounded-2xl border cursor-pointer flex flex-col items-center justify-center text-center gap-2 transition-all ${
                  paymentMethod === 'card'
                    ? 'bg-brand-500/20 border-brand-500 text-white shadow-glow-sm'
                    : 'glass-card border-white/10 text-slate-400 hover:border-brand-500/30'
                }`}
              >
                <CreditCard className="w-5 h-5 text-brand-400" />
                <span className="text-xs font-bold">Card</span>
              </div>

              {/* Option 2: UPI / QR */}
              <div
                onClick={() => setPaymentMethod('upi')}
                className={`p-3 rounded-2xl border cursor-pointer flex flex-col items-center justify-center text-center gap-2 transition-all ${
                  paymentMethod === 'upi'
                    ? 'bg-brand-500/20 border-brand-500 text-white shadow-glow-sm'
                    : 'glass-card border-white/10 text-slate-400 hover:border-brand-500/30'
                }`}
              >
                <QrCode className="w-5 h-5 text-cyan-400" />
                <span className="text-xs font-bold">UPI / QR</span>
              </div>

              {/* Option 3: COD */}
              <div
                onClick={() => setPaymentMethod('cod')}
                className={`p-3 rounded-2xl border cursor-pointer flex flex-col items-center justify-center text-center gap-2 transition-all ${
                  paymentMethod === 'cod'
                    ? 'bg-brand-500/20 border-brand-500 text-white shadow-glow-sm'
                    : 'glass-card border-white/10 text-slate-400 hover:border-brand-500/30'
                }`}
              >
                <Banknote className="w-5 h-5 text-emerald-400" />
                <span className="text-xs font-bold">Cash on Delivery</span>
              </div>
            </div>

            {/* Simulated Card Sub-form */}
            {paymentMethod === 'card' && (
              <div className="p-4 rounded-2xl bg-dark-950/70 border border-white/10 space-y-2.5">
                <p className="text-[11px] text-slate-400 font-semibold">Simulated Stripe / Razorpay Card</p>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={e => setCardNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={cardExp}
                    onChange={e => setCardExp(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono"
                  />
                  <input
                    type="password"
                    value={cardCvv}
                    onChange={e => setCardCvv(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs font-mono"
                  />
                </div>
              </div>
            )}

            {/* Simulated UPI QR Graphic */}
            {paymentMethod === 'upi' && (
              <div className="p-4 rounded-2xl bg-dark-950/70 border border-white/10 flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-white p-2 flex items-center justify-center shrink-0">
                  <QrCode className="w-full h-full text-dark-950" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Instant UPI Auto-Debit</p>
                  <p className="text-[11px] text-slate-400">Scan via GPay, PhonePe, or Paytm at doorstep.</p>
                </div>
              </div>
            )}
          </div>

          {/* 3. Submit Order Button */}
          <div className="pt-4 border-t border-white/10">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl btn-primary text-sm font-bold shadow-glow-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Authorizing & Routing Order...</span>
              ) : (
                <>
                  <span>Pay & Launch Live Tracking (${total.toFixed(2)})</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
            <p className="text-center text-[11px] text-slate-500 mt-2">
              🔒 256-bit Encrypted Simulated Transaction • Zero Fees
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutModal;
