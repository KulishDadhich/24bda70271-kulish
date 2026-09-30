/**
 * Order History Page
 * Displays customer previous orders, tracking links, re-order buttons, and review triggers.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Clock,
  MapPin,
  ArrowRight,
  RotateCcw,
  Star,
  CheckCircle2,
  Package,
  Bike,
} from 'lucide-react';
import Loader from '../components/common/Loader';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import api from '../services/api';

export const OrderHistoryPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { addItem, clearCart, setIsCartOpen } = useCartStore();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders/customer/my-orders');
        setOrders(res.data.data);
      } catch (err) {
        console.error('Failed to load orders:', err);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const handleReorder = order => {
    clearCart();
    order.items.forEach(item => {
      addItem(
        {
          _id: item.dish,
          name: item.name,
          price: item.price,
          isVeg: item.isVeg,
          image: item.image,
          model3dType: item.model3dType,
        },
        {
          _id: order.restaurant.restaurantId,
          name: order.restaurant.name,
          image: order.restaurant.image,
          deliveryFee: order.pricing.deliveryFee,
          deliveryTimeMinutes: 25,
        },
        item.selectedOptions || []
      );
    });
    setIsCartOpen(true);
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-20 text-center glass-card rounded-3xl p-8 space-y-4">
        <h3 className="text-lg font-bold text-white">Sign In to View Orders</h3>
        <p className="text-xs text-slate-400">Please sign in or use a 1-click Demo Account to access your order history.</p>
        <Link to="/login" className="btn-primary text-xs">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* 1. Header */}
      <div>
        <h1 className="font-display text-3xl font-black text-white">Your Orders</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Review previous culinary journeys, track active deliveries, and reorder your favorite meals.
        </p>
      </div>

      {/* 2. Order List */}
      {loading ? (
        <Loader message="Loading your order history..." />
      ) : orders.length === 0 ? (
        <div className="text-center py-16 glass-card rounded-3xl p-8 space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl mx-auto">
            📦
          </div>
          <h3 className="font-bold text-white text-base">No orders placed yet</h3>
          <p className="text-xs text-slate-400">Your next mouthwatering feast is just a tap away!</p>
          <Link to="/restaurants" className="btn-primary text-xs">
            Explore Restaurants
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => {
            const isActive = order.orderStatus !== 'Delivered' && order.orderStatus !== 'Cancelled';

            return (
              <div
                key={order._id}
                className="glass-card rounded-3xl p-6 border border-white/10 hover:border-brand-500/40 transition-all shadow-xl space-y-4"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <img
                      src={order.restaurant?.image}
                      alt={order.restaurant?.name}
                      className="w-12 h-12 rounded-xl object-cover bg-dark-950 border border-white/10"
                    />
                    <div>
                      <h3 className="font-display font-bold text-base text-white">
                        {order.restaurant?.name}
                      </h3>
                      <p className="text-xs text-slate-400">
                        Order #{order.orderNumber} •{' '}
                        {new Date(order.createdAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Status badge */}
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border self-start sm:self-center ${
                      order.orderStatus === 'Delivered'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : order.orderStatus === 'Cancelled'
                        ? 'bg-red-500/20 text-red-400 border-red-500/30'
                        : 'bg-brand-500/20 text-brand-400 border-brand-500/30 animate-pulse'
                    }`}
                  >
                    ● {order.orderStatus}
                  </span>
                </div>

                {/* Items summary */}
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {order.items.map((item, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-white/5 text-xs text-slate-300 border border-white/5"
                      >
                        {item.quantity}× {item.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer Action Row */}
                <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                  <div>
                    <span className="text-slate-400">Total Paid: </span>
                    <span className="font-bold text-brand-400 text-sm">
                      ${order.pricing?.total?.toFixed(2)}
                    </span>
                    <span className="text-slate-500 text-[11px] ml-1">
                      ({order.paymentMethod?.toUpperCase()})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Reorder Button */}
                    <button
                      onClick={() => handleReorder(order)}
                      className="px-3.5 py-2 rounded-xl glass-card hover:bg-white/10 text-slate-200 font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-brand-400" />
                      <span>Reorder</span>
                    </button>

                    {/* Live Track Button */}
                    <button
                      onClick={() => navigate(`/track/${order._id}`)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                        isActive ? 'btn-primary' : 'btn-secondary'
                      }`}
                    >
                      <Bike className="w-3.5 h-3.5" />
                      <span>{isActive ? 'Track Live Map' : 'View Tracking Receipt'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrderHistoryPage;
