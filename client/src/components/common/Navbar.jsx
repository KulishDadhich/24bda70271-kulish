/**
 * Top Navigation Bar
 * Glassmorphic sticky header with role switcher, real-time cart badge,
 * theme toggle, and mobile menu drawer.
 */

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingBag,
  Sparkles,
  User,
  LogOut,
  MapPin,
  Compass,
  Store,
  Bike,
  Menu,
  X,
  Sun,
  Moon,
  ChevronDown,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useCartStore } from '../../store/useCartStore';
import { useThemeStore } from '../../store/useThemeStore';

export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);

  const { user, isAuthenticated, logout, demoLogin } = useAuthStore();
  const { getItemCount, getTotal, toggleCart } = useCartStore();
  const { theme, toggleTheme } = useThemeStore();

  const itemCount = getItemCount();
  const total = getTotal();

  const handleRoleSwitch = async role => {
    await demoLogin(role);
    setIsRoleMenuOpen(false);
    if (role === 'restaurant_admin') navigate('/dashboard/restaurant');
    else if (role === 'delivery_partner') navigate('/dashboard/delivery');
    else navigate('/restaurants');
  };

  const roleColors = {
    customer: 'bg-brand-500/20 text-brand-400 border-brand-500/30',
    restaurant_admin: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    delivery_partner: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  };

  const roleLabels = {
    customer: 'Customer',
    restaurant_admin: 'Restaurant Admin',
    delivery_partner: 'Delivery Rider',
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* 1. Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 to-amber-400 p-[2px] shadow-glow-sm group-hover:shadow-glow-md transition-all">
              <div className="w-full h-full bg-dark-900 rounded-[14px] flex items-center justify-center">
                <span className="text-2xl group-hover:scale-110 transition-transform">🍔</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display text-2xl font-bold tracking-tight text-white group-hover:text-brand-400 transition-colors">
                  Food<span className="text-brand-500">Verse</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-400 border border-brand-500/30">
                  3D Live
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Future of Culinary Delivery</p>
            </div>
          </Link>

          {/* 2. Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <Link
              to="/restaurants"
              className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                location.pathname === '/restaurants'
                  ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Compass className="w-4 h-4 text-brand-400" />
              Explore Food
            </Link>

            {isAuthenticated && user?.role === 'restaurant_admin' && (
              <Link
                to="/dashboard/restaurant"
                className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                  location.pathname.startsWith('/dashboard/restaurant')
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Store className="w-4 h-4 text-amber-400" />
                Kitchen Manager
              </Link>
            )}

            {isAuthenticated && user?.role === 'delivery_partner' && (
              <Link
                to="/dashboard/delivery"
                className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                  location.pathname.startsWith('/dashboard/delivery')
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Bike className="w-4 h-4 text-emerald-400" />
                Rider Console
              </Link>
            )}

            {isAuthenticated && (
              <Link
                to="/orders"
                className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                  location.pathname === '/orders'
                    ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <MapPin className="w-4 h-4 text-brand-400" />
                My Orders
              </Link>
            )}
          </nav>

          {/* 3. Action Buttons & Role Switcher */}
          <div className="flex items-center gap-3">
            {/* 1-Click Role Switcher Pill (Great for Viva / Grading) */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-1.5 transition-all ${
                  user ? roleColors[user.role] : 'bg-slate-800/60 text-slate-300 border-white/10'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                Role: {user ? roleLabels[user.role] : 'Demo Switch'}
                <ChevronDown className="w-3 h-3" />
              </button>

              {isRoleMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 glass-card rounded-2xl p-2 border border-white/10 shadow-2xl z-50">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                    Instant Demo Roles (Viva Ready)
                  </p>
                  <button
                    onClick={() => handleRoleSwitch('customer')}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-slate-200 hover:bg-brand-500/20 hover:text-brand-300 flex items-center gap-2 transition-all"
                  >
                    <User className="w-3.5 h-3.5 text-brand-400" />
                    Customer (Alex)
                  </button>
                  <button
                    onClick={() => handleRoleSwitch('restaurant_admin')}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-slate-200 hover:bg-amber-500/20 hover:text-amber-300 flex items-center gap-2 transition-all"
                  >
                    <Store className="w-3.5 h-3.5 text-amber-400" />
                    Restaurant Admin (Chef Marco)
                  </button>
                  <button
                    onClick={() => handleRoleSwitch('delivery_partner')}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-slate-200 hover:bg-emerald-500/20 hover:text-emerald-300 flex items-center gap-2 transition-all"
                  >
                    <Bike className="w-3.5 h-3.5 text-emerald-400" />
                    Delivery Rider (Sam Ryder)
                  </button>
                </div>
              )}
            </div>

            {/* Dark / Light Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-200" />}
            </button>

            {/* Cart Button */}
            <button
              onClick={toggleCart}
              className="relative p-2.5 sm:px-4 sm:py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 text-white font-semibold text-sm shadow-glow-sm hover:shadow-glow-md transition-all flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Cart</span>
              {itemCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-white text-brand-600 text-xs font-black">
                  {itemCount}
                </span>
              )}
              {total > 0 && <span className="hidden lg:inline text-xs opacity-90">${total}</span>}
            </button>

            {/* User Profile / Auth */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                >
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                    alt={user.name}
                    className="w-8 h-8 rounded-lg object-cover"
                  />
                  <span className="text-xs font-semibold text-slate-200 hidden md:inline max-w-[100px] truncate">
                    {user.name.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {isUserDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 glass-card rounded-2xl p-2 border border-white/10 shadow-2xl z-50">
                    <div className="px-3 py-2 border-b border-white/10 mb-1">
                      <p className="text-xs font-bold text-white truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                    </div>
                    <Link
                      to="/orders"
                      onClick={() => setIsUserDropdownOpen(false)}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-slate-200 hover:bg-white/10 flex items-center gap-2"
                    >
                      <MapPin className="w-3.5 h-3.5 text-brand-400" />
                      Order History
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setIsUserDropdownOpen(false);
                        navigate('/');
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-red-400 hover:bg-red-500/20 flex items-center gap-2 transition-colors mt-1"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 rounded-xl text-sm font-semibold text-slate-200 hover:text-white hover:bg-white/5 transition-all"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="hidden sm:inline-flex px-3.5 py-2 rounded-xl text-sm font-semibold btn-primary"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2.5 rounded-xl bg-white/5 text-slate-300 hover:text-white"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden glass-panel border-b border-white/10 px-4 pt-2 pb-6 space-y-2">
          <Link
            to="/restaurants"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-medium text-slate-200 hover:bg-brand-500/20"
          >
            Explore Restaurants
          </Link>
          <Link
            to="/orders"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-medium text-slate-200 hover:bg-brand-500/20"
          >
            My Orders
          </Link>
          {user?.role === 'restaurant_admin' && (
            <Link
              to="/dashboard/restaurant"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-sm font-medium text-amber-400 hover:bg-amber-500/20"
            >
              Kitchen Dashboard
            </Link>
          )}
          {user?.role === 'delivery_partner' && (
            <Link
              to="/dashboard/delivery"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-sm font-medium text-emerald-400 hover:bg-emerald-500/20"
            >
              Rider Console
            </Link>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
