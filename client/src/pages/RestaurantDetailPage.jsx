/**
 * Restaurant Detail & Menu Page
 * Displays restaurant header, sticky category navigation,
 * dish cards with 3D model previews, and cart conflict resolution modal.
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Star,
  Clock,
  MapPin,
  Sparkles,
  ShoppingBag,
  Leaf,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';
import DishCard from '../components/restaurant/DishCard';
import Loader from '../components/common/Loader';
import { useCartStore } from '../store/useCartStore';
import api from '../services/api';

export const RestaurantDetailPage = () => {
  const { idOrSlug } = useParams();
  const navigate = useNavigate();

  const [restaurantData, setRestaurantData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('');
  const [conflictData, setConflictData] = useState(null);

  const { items, clearCart, addItem, setIsCartOpen, getItemCount, getTotal } = useCartStore();
  const itemCount = getItemCount();
  const total = getTotal();

  useEffect(() => {
    const fetchRestaurantDetail = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/restaurants/${idOrSlug}`);
        setRestaurantData(res.data.data);
        if (res.data.data?.menuByCategory?.length > 0) {
          setActiveCategory(res.data.data.menuByCategory[0].categoryName);
        }
      } catch (err) {
        console.error('Error fetching restaurant details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurantDetail();
  }, [idOrSlug]);

  const handleConflictResolve = () => {
    if (!conflictData) return;
    clearCart();
    // Re-add target item
    addItem(conflictData.pendingDish, conflictData.newRestaurant, conflictData.pendingOptions || []);
    setConflictData(null);
  };

  if (loading) {
    return <Loader message="Loading restaurant menu & culinary creations..." />;
  }

  if (!restaurantData || !restaurantData.restaurant) {
    return (
      <div className="max-w-md mx-auto py-20 text-center glass-card rounded-3xl p-8 space-y-4">
        <h3 className="text-lg font-bold text-white">Restaurant Not Found</h3>
        <button onClick={() => navigate('/restaurants')} className="btn-primary text-xs">
          Back to Restaurants
        </button>
      </div>
    );
  }

  const { restaurant, menuByCategory } = restaurantData;

  return (
    <div className="space-y-10 pb-24">
      {/* 1. Hero Banner */}
      <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-dark-900">
        <img
          src={restaurant.banner || restaurant.image}
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/60 to-transparent" />

        {/* Restaurant Header Overlay */}
        <div className="absolute bottom-6 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-lg text-xs font-black uppercase tracking-wider bg-gradient-to-r from-brand-600 to-amber-500 text-white">
                {restaurant.discountBadge || '20% OFF'}
              </span>
              {restaurant.isVegOnly && (
                <span className="px-2 py-0.5 rounded-lg text-xs font-bold bg-emerald-950/90 text-emerald-400 border border-emerald-500/40">
                  Pure Veg
                </span>
              )}
            </div>

            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black text-white">
              {restaurant.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl line-clamp-1">
              {restaurant.tagline || restaurant.description}
            </p>
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-brand-400" />
              {restaurant.address?.street}, {restaurant.address?.city}
            </p>
          </div>

          {/* Key Metrics Badges */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Rating */}
            <div className="px-3.5 py-2 rounded-2xl glass-panel bg-emerald-500/10 border border-emerald-500/30 text-center">
              <div className="flex items-center justify-center gap-1 text-emerald-400 font-bold text-sm">
                <Star className="w-4 h-4 fill-emerald-400" />
                <span>{restaurant.rating?.toFixed(1) || '4.8'}</span>
              </div>
              <p className="text-[10px] text-slate-400">{restaurant.ratingCount || 150}+ ratings</p>
            </div>

            {/* Delivery Time */}
            <div className="px-3.5 py-2 rounded-2xl glass-panel bg-brand-500/10 border border-brand-500/30 text-center">
              <div className="flex items-center justify-center gap-1 text-brand-400 font-bold text-sm">
                <Clock className="w-4 h-4" />
                <span>{restaurant.deliveryTimeMinutes} mins</span>
              </div>
              <p className="text-[10px] text-slate-400">Express Delivery</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Sticky Category Navigation Bar */}
      <div className="sticky top-20 z-30 w-full glass-panel border-y border-white/10 py-3 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 overflow-x-auto scrollbar-none">
          {menuByCategory.map((cat, i) => (
            <a
              key={i}
              href={`#cat-${i}`}
              onClick={() => setActiveCategory(cat.categoryName)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border shrink-0 ${
                activeCategory === cat.categoryName
                  ? 'bg-brand-500 text-white border-transparent shadow-glow-sm scale-105'
                  : 'glass-card text-slate-300 border-white/10 hover:border-brand-500/30'
              }`}
            >
              {cat.categoryName} ({cat.items.length})
            </a>
          ))}
        </div>
      </div>

      {/* 3. Menu Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {menuByCategory.map((categorySection, catIdx) => (
          <div key={catIdx} id={`cat-${catIdx}`} className="space-y-4 pt-4">
            <div className="flex items-center gap-3 border-b border-white/10 pb-3">
              <h2 className="font-display text-xl sm:text-2xl font-bold text-white">
                {categorySection.categoryName}
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-slate-400 font-semibold">
                {categorySection.items.length} items
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categorySection.items.map(dish => (
                <DishCard
                  key={dish._id}
                  dish={dish}
                  restaurant={restaurant}
                  onConflict={conflict =>
                    setConflictData({
                      ...conflict,
                      pendingDish: dish,
                    })
                  }
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 4. Floating Cart Pill (Mobile / Quick Trigger) */}
      {itemCount > 0 && (
        <div className="fixed bottom-6 left-4 right-4 sm:left-auto sm:right-8 z-40">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl btn-primary text-sm font-bold shadow-glow-lg flex items-center justify-between sm:justify-start gap-4"
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              <span>
                {itemCount} {itemCount === 1 ? 'Item' : 'Items'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-black text-base">${total.toFixed(2)}</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      )}

      {/* 5. Cross-Restaurant Conflict Dialog */}
      {conflictData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-panel max-w-sm w-full rounded-3xl p-6 border border-white/20 text-center space-y-4 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h3 className="font-display font-bold text-lg text-white">Replace Cart Items?</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your cart currently contains dishes from <strong>{conflictData.currentRestaurant?.name}</strong>. Do you want to reset your cart and order from <strong>{conflictData.newRestaurant?.name}</strong> instead?
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setConflictData(null)}
                className="flex-1 py-2.5 rounded-xl glass-card text-xs font-semibold text-slate-300 hover:text-white"
              >
                Keep Current
              </button>
              <button
                onClick={handleConflictResolve}
                className="flex-1 py-2.5 rounded-xl btn-primary text-xs font-bold"
              >
                Reset & Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantDetailPage;
