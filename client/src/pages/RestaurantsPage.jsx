/**
 * Restaurants Exploration Page
 * Comprehensive restaurant directory with multi-facet query filtering,
 * live search, sorting, and responsive 3D card layout.
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Compass, Sparkles, Frown } from 'lucide-react';
import FilterBar from '../components/restaurant/FilterBar';
import RestaurantCard from '../components/restaurant/RestaurantCard';
import Loader from '../components/common/Loader';
import api from '../services/api';

export const RestaurantsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [restaurants, setRestaurants] = useState([]);
  const [cuisines, setCuisines] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCuisine, setSelectedCuisine] = useState(searchParams.get('cuisine') || 'All');
  const [isVegOnly, setIsVegOnly] = useState(searchParams.get('isVegOnly') === 'true');
  const [minRating, setMinRating] = useState(
    searchParams.get('rating') ? Number(searchParams.get('rating')) : null
  );
  const [maxDeliveryTime, setMaxDeliveryTime] = useState(
    searchParams.get('maxTime') ? Number(searchParams.get('maxTime')) : null
  );
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'rating_desc');

  useEffect(() => {
    const fetchRestaurants = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (selectedCuisine && selectedCuisine !== 'All') params.append('cuisine', selectedCuisine);
        if (isVegOnly) params.append('isVegOnly', 'true');
        if (minRating) params.append('rating', minRating);
        if (maxDeliveryTime) params.append('maxDeliveryTime', maxDeliveryTime);
        if (sortBy) params.append('sortBy', sortBy);

        const res = await api.get(`/restaurants?${params.toString()}`);
        setRestaurants(res.data.data);
        if (res.data.cuisines) {
          setCuisines(res.data.cuisines);
        }
      } catch (err) {
        console.error('Failed to fetch restaurants:', err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchRestaurants, 200);
    return () => clearTimeout(timer);
  }, [search, selectedCuisine, isVegOnly, minRating, maxDeliveryTime, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* 1. Page Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-brand-500/20 text-brand-400 border border-brand-500/30">
          <Compass className="w-3.5 h-3.5" />
          <span>Curated FoodVerse Hubs</span>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-black text-white">
          Explore All Restaurants
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
          Discover {restaurants.length} artisanal culinary destinations delivering hot and fresh across the metro area.
        </p>
      </div>

      {/* 2. Filter & Search Toolbar */}
      <FilterBar
        search={search}
        setSearch={setSearch}
        selectedCuisine={selectedCuisine}
        setSelectedCuisine={setSelectedCuisine}
        isVegOnly={isVegOnly}
        setIsVegOnly={setIsVegOnly}
        minRating={minRating}
        setMinRating={setMinRating}
        maxDeliveryTime={maxDeliveryTime}
        setMaxDeliveryTime={setMaxDeliveryTime}
        sortBy={sortBy}
        setSortBy={setSortBy}
        cuisines={cuisines}
      />

      {/* 3. Restaurant Cards Grid */}
      {loading ? (
        <Loader message="Filtering culinary options..." />
      ) : restaurants.length === 0 ? (
        <div className="text-center py-16 glass-card rounded-3xl p-8 max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl mx-auto">
            🔍
          </div>
          <h3 className="font-bold text-lg text-white">No Restaurants Found</h3>
          <p className="text-xs text-slate-400">
            We couldn't find any restaurants matching your current filter criteria. Try clearing some filters.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedCuisine('All');
              setIsVegOnly(false);
              setMinRating(null);
              setMaxDeliveryTime(null);
            }}
            className="btn-primary text-xs"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {restaurants.map(restaurant => (
            <RestaurantCard key={restaurant._id} restaurant={restaurant} />
          ))}
        </div>
      )}
    </div>
  );
};

export default RestaurantsPage;
