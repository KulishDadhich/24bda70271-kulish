/**
 * Login Page
 * Glassmorphic authentication with 1-Click Demo Badges for all 3 roles.
 */

import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Sparkles, Mail, Lock, ArrowRight, Store, Bike, User, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { login, demoLogin, isLoading, error, clearError } = useAuthStore();

  const handleSubmit = async e => {
    e.preventDefault();
    clearError();
    const result = await login(email, password);
    if (result.success) {
      navigate(redirectUrl);
    }
  };

  const handleDemo = async role => {
    clearError();
    const result = await demoLogin(role);
    if (result.success) {
      if (role === 'restaurant_admin') navigate('/dashboard/restaurant');
      else if (role === 'delivery_partner') navigate('/dashboard/delivery');
      else navigate(redirectUrl);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="glass-panel max-w-md w-full rounded-3xl p-6 sm:p-8 border border-white/20 shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-amber-400 p-[2px] shadow-glow-sm mx-auto flex items-center justify-center">
            <span className="text-2xl">🍔</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">Welcome Back</h2>
          <p className="text-xs text-slate-400">Sign in to your FoodVerse account to continue</p>
        </div>

        {/* 1-Click Demo Role Badges (Great for Viva testing!) */}
        <div className="space-y-2 p-3 rounded-2xl bg-dark-950/70 border border-white/10">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">
            ⚡ 1-Click Instant Demo Logins (Viva Ready)
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleDemo('customer')}
              className="p-2 rounded-xl bg-brand-500/15 hover:bg-brand-500/25 border border-brand-500/30 text-brand-300 text-[11px] font-bold flex flex-col items-center gap-1 transition-all"
            >
              <User className="w-4 h-4 text-brand-400" />
              <span>Customer</span>
            </button>

            <button
              onClick={() => handleDemo('restaurant_admin')}
              className="p-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-[11px] font-bold flex flex-col items-center gap-1 transition-all"
            >
              <Store className="w-4 h-4 text-amber-400" />
              <span>Rest. Admin</span>
            </button>

            <button
              onClick={() => handleDemo('delivery_partner')}
              className="p-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold flex flex-col items-center gap-1 transition-all"
            >
              <Bike className="w-4 h-4 text-emerald-400" />
              <span>Rider</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs">
            {error}
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl glass-input"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl glass-input"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-2xl btn-primary text-sm font-bold shadow-glow-md flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            <span>{isLoading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-slate-400">
          Don't have an account?{' '}
          <Link to="/signup" className="text-brand-400 font-bold hover:underline">
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
