/**
 * Signup Page
 * New user registration with role choice (Customer, Restaurant Admin, Delivery Partner).
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Phone, MapPin, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export const SignupPage = () => {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuthStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [phone, setPhone] = useState('+1 (555) 019-2834');
  const [street, setStreet] = useState('452 Innovation Blvd, Apt 7B');
  const [city, setCity] = useState('San Francisco');

  const handleSubmit = async e => {
    e.preventDefault();
    clearError();
    const result = await register({
      name,
      email,
      password,
      role,
      phone,
      address: {
        street,
        city,
        state: 'CA',
        zipCode: '94107',
      },
    });

    if (result.success) {
      if (role === 'restaurant_admin') navigate('/dashboard/restaurant');
      else if (role === 'delivery_partner') navigate('/dashboard/delivery');
      else navigate('/restaurants');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="glass-panel max-w-md w-full rounded-3xl p-6 sm:p-8 border border-white/20 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
            Create FoodVerse Account
          </h2>
          <p className="text-xs text-slate-400">Join the next-generation culinary delivery cosmos</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Alex Johnson"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl glass-input"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="alex@example.com"
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
                placeholder="Min 6 characters"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl glass-input"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">I am signing up as:</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'customer', label: 'Customer' },
                { id: 'restaurant_admin', label: 'Rest. Admin' },
                { id: 'delivery_partner', label: 'Delivery Rider' },
              ].map(r => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id)}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    role === r.id
                      ? 'bg-brand-500/20 border-brand-500 text-brand-300'
                      : 'glass-card border-white/10 text-slate-400'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-2xl btn-primary text-sm font-bold shadow-glow-md flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            <span>{isLoading ? 'Creating Account...' : 'Sign Up'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-400 font-bold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
