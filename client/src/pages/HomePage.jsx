/**
 * Homepage Component
 * Creative 3D Hero Section, Procedural 3D Showcase, Featured Restaurants,
 * Cuisine Carousel, and Interactive Discount Banners.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Compass,
  Bike,
  ShieldCheck,
  Zap,
  Star,
  Clock,
  Tag,
  Copy,
  Check,
} from 'lucide-react';
import Hero3DCanvas from '../components/3d/Hero3DCanvas';
import FoodItem3DPreview from '../components/3d/FoodItem3DPreview';
import RestaurantCard from '../components/restaurant/RestaurantCard';
import Loader from '../components/common/Loader';
import api from '../services/api';

export const HomePage = () => {
  const navigate = useNavigate();
  const [featuredRestaurants, setFeaturedRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active3DTab, setActive3DTab] = useState('burger');
  const [copiedCode, setCopiedCode] = useState(null);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const res = await api.get('/restaurants?featured=true');
        setFeaturedRestaurants(res.data.data.slice(0, 4));
      } catch (err) {
        console.error('Failed to load featured restaurants:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const handleCopyCode = code => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const cuisines = [
    { name: 'Burgers', icon: '🍔', tag: 'Smash & Crispy' },
    { name: 'Pizza', icon: '🍕', tag: 'Woodfired Crusts' },
    { name: 'Japanese', icon: '🍜', tag: 'Ramen & Sushi' },
    { name: 'Indian', icon: '🍛', tag: 'Dum Biryani & Curry' },
    { name: 'Healthy', icon: '🥗', tag: 'Poke & Acai Bowls' },
    { name: 'Mexican', icon: '🌮', tag: 'Birria Quesatacos' },
    { name: 'Desserts', icon: '🍩', tag: 'Gourmet Donuts' },
    { name: 'Cafe', icon: '☕', tag: 'Espresso & Bakes' },
  ];

  return (
    <div className="space-y-20 pb-20">
      {/* 1. Creative 3D Hero Section */}
      <section className="relative min-h-[640px] lg:min-h-[720px] flex items-center justify-center overflow-hidden pt-8">
        {/* Background glow orbs */}
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          {/* Left Hero Content */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-panel text-xs font-bold text-brand-400 border border-brand-500/30 shadow-glow-sm">
              <Sparkles className="w-4 h-4 text-brand-400 animate-spin-slow" />
              <span>Next-Gen 3D Food Experience</span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
              Crave It. <br />
              <span className="gradient-brand-text">Explore It in 3D.</span> <br />
              Track in Real-Time.
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl mx-auto lg:mx-0">
              Immerse yourself in artisanal gastronomy with interactive Three.js 3D dish previews, chef curated menus, and live GPS courier tracking straight to your door.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link to="/restaurants" className="btn-primary text-sm sm:text-base px-6 py-3.5 w-full sm:w-auto">
                <Compass className="w-5 h-5" />
                <span>Explore 8 Restaurants</span>
              </Link>
              <Link to="/orders" className="btn-secondary text-sm sm:text-base px-6 py-3.5 w-full sm:w-auto">
                <Bike className="w-5 h-5 text-brand-400" />
                <span>Live Order Demo</span>
              </Link>
            </div>

            {/* Quick Metrics Bar */}
            <div className="pt-6 grid grid-cols-3 gap-4 border-t border-white/10 max-w-lg mx-auto lg:mx-0">
              <div>
                <p className="font-display text-2xl font-black text-white">48+</p>
                <p className="text-xs text-slate-400">Gourmet Dishes</p>
              </div>
              <div>
                <p className="font-display text-2xl font-black text-brand-400">22 min</p>
                <p className="text-xs text-slate-400">Avg Delivery Speed</p>
              </div>
              <div>
                <p className="font-display text-2xl font-black text-amber-400">4.9 ★</p>
                <p className="text-xs text-slate-400">Customer Rating</p>
              </div>
            </div>
          </div>

          {/* Right Interactive 3D Canvas */}
          <div className="lg:col-span-6 h-[440px] sm:h-[520px] relative flex items-center justify-center">
            <Hero3DCanvas />
          </div>
        </div>
      </section>

      {/* 2. Cuisines Carousel Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display text-2xl font-bold text-white flex items-center gap-2">
              <span>Explore Top Cuisines</span>
              <span className="text-lg">🔥</span>
            </h2>
            <p className="text-xs text-slate-400">Handpicked culinary varieties across the galaxy</p>
          </div>
          <Link to="/restaurants" className="text-xs font-bold text-brand-400 hover:text-brand-300 flex items-center gap-1">
            See All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
          {cuisines.map((c, i) => (
            <div
              key={i}
              onClick={() => navigate(`/restaurants?cuisine=${c.name}`)}
              className="glass-card rounded-2xl p-4 text-center cursor-pointer hover:border-brand-500/50 hover:scale-105 transition-all group"
            >
              <div className="text-3xl mb-2 group-hover:scale-125 transition-transform duration-300">
                {c.icon}
              </div>
              <h4 className="font-bold text-xs text-white group-hover:text-brand-400 transition-colors">
                {c.name}
              </h4>
              <p className="text-[10px] text-slate-400 truncate mt-0.5">{c.tag}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Interactive 3D Food Showcase Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-white/10 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-6">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                3D Interactive Kitchen
              </span>
              <h2 className="font-display text-3xl font-bold text-white">
                Inspect Food From <br />
                <span className="gradient-brand-text">Every Single Angle</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Click a category below and rotate the 3D model in real time. We believe you should see the craftsmanship before taking your first bite.
              </p>

              {/* 3D Model Switcher Pills */}
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'burger', label: '🍔 Smash Burger' },
                  { id: 'pizza', label: '🍕 Woodfired Pizza' },
                  { id: 'drink', label: '🥤 Boba & Shakes' },
                  { id: 'donut', label: '🍩 Glazed Donut' },
                  { id: 'fries', label: '🍟 Truffle Fries' },
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActive3DTab(item.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                      active3DTab === item.id
                        ? 'bg-brand-500 text-white border-transparent shadow-glow-sm scale-105'
                        : 'glass-card text-slate-300 border-white/10 hover:border-brand-500/30'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 3D Display Box */}
            <div className="lg:col-span-7 h-72 sm:h-96 rounded-3xl bg-dark-950/80 border border-white/10 overflow-hidden relative flex items-center justify-center">
              <div className="absolute top-4 right-4 z-10 px-3 py-1 rounded-full text-[10px] font-bold bg-white/10 text-slate-300 backdrop-blur-md">
                🖱️ Drag with mouse to rotate
              </div>
              <FoodItem3DPreview type={active3DTab} height="100%" />
            </div>
          </div>
        </div>
      </section>

      {/* 4. Featured Restaurants Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display text-2xl font-bold text-white flex items-center gap-2">
              <span>Featured Culinary Hubs</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Top Rated
              </span>
            </h2>
            <p className="text-xs text-slate-400">Locally loved, expertly prepared, delivered fast</p>
          </div>
          <Link to="/restaurants" className="btn-secondary text-xs">
            View All 8 Restaurants
          </Link>
        </div>

        {loading ? (
          <Loader message="Loading top rated restaurants..." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredRestaurants.map(rest => (
              <RestaurantCard key={rest._id} restaurant={rest} />
            ))}
          </div>
        )}
      </section>

      {/* 5. Interactive Promo Coupons Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              code: 'FOODVERSE50',
              title: '50% OFF First Order',
              desc: 'Max discount $15 on orders above $20',
              color: 'from-brand-600 to-brand-500',
            },
            {
              code: 'TASTY30',
              title: '30% Midweek Craving',
              desc: 'Save up to $12 on burgers & pizzas',
              color: 'from-purple-600 to-indigo-600',
            },
            {
              code: 'FREESHIP',
              title: 'Free Express Courier',
              desc: 'Zero delivery fee on orders above $30',
              color: 'from-emerald-600 to-teal-600',
            },
          ].map((c, i) => (
            <div
              key={i}
              className="glass-card rounded-2xl p-5 border border-white/10 flex items-center justify-between gap-4"
            >
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                  Promo Discount
                </span>
                <h4 className="font-bold text-sm text-white mt-0.5">{c.title}</h4>
                <p className="text-xs text-slate-400 mt-1">{c.desc}</p>
              </div>

              <button
                onClick={() => handleCopyCode(c.code)}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-mono font-bold border border-white/10 flex items-center gap-1.5 shrink-0"
              >
                {copiedCode === c.code ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>{c.code}</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
