/**
 * Rider Details & ETA Card
 * Displays delivery partner information, contact triggers, live ETA timer,
 * and viva test fast-forward controls.
 */

import React, { useState } from 'react';
import { Phone, Star, Bike, Clock, ShieldCheck, Zap, FastForward, CheckCircle } from 'lucide-react';
import api from '../../services/api';

export const RiderCard = ({
  orderId,
  rider = {},
  estimatedDeliveryMinutes = 20,
  orderStatus = 'Out for Delivery',
  onStatusAdvanced,
}) => {
  const [isCalling, setIsCalling] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);

  const handleAdvanceStatus = async () => {
    if (!orderId) return;
    setIsAdvancing(true);
    try {
      const res = await api.post(`/orders/${orderId}/advance-status`);
      if (onStatusAdvanced) onStatusAdvanced(res.data.data);
    } catch (err) {
      console.error('Failed to advance order status:', err);
    } finally {
      setIsAdvancing(false);
    }
  };

  return (
    <div className="glass-card rounded-3xl p-6 sm:p-7 border border-white/10 shadow-xl space-y-6">
      {/* 1. Live ETA Countdown Box */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-brand-600/20 via-brand-500/10 to-amber-500/20 border border-brand-500/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-brand-500 text-white flex items-center justify-center shadow-glow-sm">
            <Clock className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-brand-400">Estimated Delivery</p>
            <h3 className="font-display text-2xl font-black text-white">
              {orderStatus === 'Delivered'
                ? 'Delivered!'
                : `${estimatedDeliveryMinutes} Minutes`}
            </h3>
          </div>
        </div>

        {orderStatus !== 'Delivered' && (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse">
            ● On Time
          </span>
        )}
      </div>

      {/* 2. Rider Details */}
      <div className="flex items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <img
              src={
                rider.avatar ||
                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'
              }
              alt={rider.name || 'Delivery Partner'}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-brand-500/40 shadow-md"
            />
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-dark-900" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-white text-base">{rider.name || 'Alex Morgan'}</h4>
              <span className="flex items-center gap-1 text-xs font-bold text-amber-400">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                {rider.rating || '4.9'}
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
              <Bike className="w-3.5 h-3.5 text-brand-400" />
              {rider.vehicleNumber || 'SF-E-BIKE-904'} • {rider.vehicleType || 'Electric Scooter'}
            </p>
          </div>
        </div>

        {/* Call Rider Button */}
        <button
          onClick={() => setIsCalling(true)}
          className="p-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-brand-400 hover:text-white border border-white/10 transition-all shadow-md"
          title="Call Courier"
        >
          <Phone className="w-5 h-5" />
        </button>
      </div>

      {/* 3. Viva Demo Controls: Fast-Forward Order Lifecycle */}
      <div className="pt-4 border-t border-white/10 space-y-2">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="font-bold text-amber-400 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5" />
            Viva / Demo Controls
          </span>
          <span>Fast-forward lifecycle</span>
        </div>

        <button
          onClick={handleAdvanceStatus}
          disabled={isAdvancing || orderStatus === 'Delivered'}
          className="w-full py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs border border-amber-500/40 transition-all flex items-center justify-center gap-2 disabled:opacity-40"
        >
          <FastForward className="w-4 h-4" />
          {isAdvancing
            ? 'Advancing Status...'
            : orderStatus === 'Delivered'
            ? 'Order Complete (Delivered)'
            : 'Advance to Next Stage (1-Click)'}
        </button>
      </div>

      {/* Simulated Call Modal */}
      {isCalling && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-panel max-w-xs w-full rounded-3xl p-6 border border-white/20 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 mx-auto flex items-center justify-center animate-bounce">
              <Phone className="w-8 h-8" />
            </div>
            <div>
              <h4 className="font-bold text-white text-base">Calling Courier...</h4>
              <p className="text-xs text-slate-400 mt-1">{rider.name || 'Alex Morgan'} ({rider.phone || '+1 (555) 432-8765'})</p>
            </div>
            <p className="text-[11px] text-slate-500">
              "Hi, I'm currently picking up your hot meal and will arrive in approx {estimatedDeliveryMinutes} mins!"
            </p>
            <button
              onClick={() => setIsCalling(false)}
              className="w-full py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-xs"
            >
              End Call
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiderCard;
