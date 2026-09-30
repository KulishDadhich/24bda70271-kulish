/**
 * Restaurant Search & Filter Toolbar
 * Includes full-text search, cuisine category pills, veg toggle, rating filter, and sorting.
 */

import React from 'react';
import { Search, X, SlidersHorizontal, Star, Zap, Leaf, ArrowUpDown } from 'lucide-react';

export const FilterBar = ({
  search,
  setSearch,
  selectedCuisine,
  setSelectedCuisine,
  isVegOnly,
  setIsVegOnly,
  minRating,
  setMinRating,
  maxDeliveryTime,
  setMaxDeliveryTime,
  sortBy,
  setSortBy,
  cuisines = [],
}) => {
  const cuisineList = ['All', ...cuisines];

  return (
    <div className="space-y-4 w-full">
      {/* 1. Search Bar + Sort Dropdown */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Search Input */}
        <div className="relative w-full flex-1">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search restaurants, cuisines, or dishes (e.g. Truffle burger, Dum Biryani)..."
            className="w-full pl-12 pr-10 py-3 rounded-2xl glass-input text-sm font-medium placeholder:text-slate-500"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort By Dropdown */}
        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <div className="relative w-full sm:w-52">
            <ArrowUpDown className="w-4 h-4 text-brand-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              aria-label="Sort restaurants"
              className="w-full pl-10 pr-8 py-3 rounded-2xl glass-input text-xs font-semibold text-slate-200 cursor-pointer appearance-none"
            >
              <option value="rating_desc" className="bg-dark-900 text-white">Rating (High to Low)</option>
              <option value="time_asc" className="bg-dark-900 text-white">Delivery Time (Fastest)</option>
              <option value="price_asc" className="bg-dark-900 text-white">Cost: Low to High</option>
              <option value="price_desc" className="bg-dark-900 text-white">Cost: High to Low</option>
              <option value="popular" className="bg-dark-900 text-white">Most Popular</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. Quick Filter Chips & Toggles */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        {/* Pure Veg Toggle */}
        <button
          onClick={() => setIsVegOnly(!isVegOnly)}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
            isVegOnly
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-glow-sm'
              : 'glass-card text-slate-300 border-white/10 hover:border-emerald-500/30'
          }`}
        >
          <Leaf className={`w-3.5 h-3.5 ${isVegOnly ? 'text-emerald-400 fill-emerald-400' : 'text-slate-400'}`} />
          Pure Veg Only
        </button>

        {/* 4.5+ Rating Filter */}
        <button
          onClick={() => setMinRating(minRating === 4.5 ? null : 4.5)}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
            minRating === 4.5
              ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-glow-sm'
              : 'glass-card text-slate-300 border-white/10 hover:border-amber-500/30'
          }`}
        >
          <Star className={`w-3.5 h-3.5 ${minRating === 4.5 ? 'text-amber-400 fill-amber-400' : 'text-slate-400'}`} />
          Rating 4.5+
        </button>

        {/* Fast Delivery (< 25 min) */}
        <button
          onClick={() => setMaxDeliveryTime(maxDeliveryTime === 25 ? null : 25)}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
            maxDeliveryTime === 25
              ? 'bg-brand-500/20 text-brand-400 border-brand-500/40 shadow-glow-sm'
              : 'glass-card text-slate-300 border-white/10 hover:border-brand-500/30'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-brand-400" />
          Fast Delivery (&lt;25m)
        </button>
      </div>

      {/* 3. Horizontal Scrollable Cuisine Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-1">
        {cuisineList.map((c, i) => (
          <button
            key={i}
            onClick={() => setSelectedCuisine(c)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border shrink-0 ${
              selectedCuisine === c
                ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white border-transparent shadow-glow-sm scale-105'
                : 'glass-card text-slate-300 border-white/10 hover:border-brand-500/30'
            }`}
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FilterBar;
