/**
 * Restaurant Card Component
 * Wrapped in interactive 3D Tilt with rating badges, delivery times, and discount overlays.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Clock, DollarSign, Sparkles, Leaf } from 'lucide-react';
import Card3DTilt from '../common/Card3DTilt';

export const RestaurantCard = ({ restaurant }) => {
  const navigate = useNavigate();

  return (
    <Card3DTilt
      onClick={() => navigate(`/restaurant/${restaurant.slug || restaurant._id}`)}
      className="glass-card rounded-2xl overflow-hidden group flex flex-col h-full border border-white/10 hover:border-brand-500/40 transition-all shadow-lg"
    >
      {/* 1. Restaurant Image & Badges */}
      <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-dark-900">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-950/90 via-dark-950/20 to-transparent" />

        {/* Promo Discount Tag */}
        {restaurant.discountBadge && (
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider bg-gradient-to-r from-brand-600 to-amber-500 text-white shadow-md flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            {restaurant.discountBadge}
          </div>
        )}

        {/* Veg Only Tag */}
        {restaurant.isVegOnly && (
          <div className="absolute top-3 right-3 px-2 py-1 rounded-lg text-xs font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 backdrop-blur-md flex items-center gap-1">
            <Leaf className="w-3 h-3" />
            Pure Veg
          </div>
        )}

        {/* Bottom Time & Price Badges on Image */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white font-semibold">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10">
            <Clock className="w-3.5 h-3.5 text-brand-400" />
            <span>{restaurant.deliveryTimeMinutes} mins</span>
          </div>

          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-amber-300">
            <span className="font-bold">{restaurant.priceTier || '$$'}</span>
            <span className="text-[10px] text-slate-300">• ${restaurant.priceForTwo} for two</span>
          </div>
        </div>
      </div>

      {/* 2. Restaurant Content & Details */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display text-lg font-bold text-white group-hover:text-brand-400 transition-colors line-clamp-1">
              {restaurant.name}
            </h3>

            {/* Rating Pill */}
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold shrink-0">
              <Star className="w-3 h-3 fill-emerald-400" />
              <span>{restaurant.rating?.toFixed(1) || '4.8'}</span>
            </div>
          </div>

          {/* Tagline */}
          <p className="text-xs text-slate-400 line-clamp-1 mt-1">
            {restaurant.tagline || restaurant.description}
          </p>
        </div>

        {/* Cuisines & Tags */}
        <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2 text-xs">
          <p className="text-slate-400 truncate text-[11px]">
            {restaurant.cuisines?.join(' • ')}
          </p>

          <span className="text-[11px] font-semibold text-brand-400 shrink-0 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
            View Menu →
          </span>
        </div>
      </div>
    </Card3DTilt>
  );
};

export default RestaurantCard;
