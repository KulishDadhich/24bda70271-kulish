/**
 * Footer Component
 * Tech stack showcase, quick links, and culinary branding.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Heart, Code2, Layers, Cpu } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="w-full glass-panel border-t border-white/10 mt-20 pt-14 pb-10 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          {/* Col 1: Brand & Tagline */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-amber-400 p-[2px] shadow-glow-sm">
                <div className="w-full h-full bg-dark-900 rounded-[10px] flex items-center justify-center text-lg">
                  🍔
                </div>
              </div>
              <span className="font-display text-xl font-bold tracking-tight text-white">
                Food<span className="text-brand-500">Verse</span>
              </span>
            </Link>
            <p className="text-xs leading-relaxed text-slate-400">
              A creative next-generation 3D food delivery ecosystem featuring real-time GPS rider simulation, procedural Three.js renders, and high-speed ordering.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-brand-500/10 text-brand-400 border border-brand-500/20">
                Viva Ready
              </span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Zero-Key Maps
              </span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-brand-400" />
              Navigation
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/restaurants" className="hover:text-brand-400 transition-colors">
                  Browse Restaurants
                </Link>
              </li>
              <li>
                <Link to="/orders" className="hover:text-brand-400 transition-colors">
                  Live Order Tracker
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-brand-400 transition-colors">
                  1-Click Role Switcher
                </Link>
              </li>
              <li>
                <Link to="/dashboard/restaurant" className="hover:text-brand-400 transition-colors">
                  Restaurant Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Tech Stack Highlights */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-amber-400" />
              Architecture
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span>
                <span>React 18 + Vite + Tailwind CSS</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                <span>React Three Fiber & Drei 3D</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Node.js + Express + Mongoose</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                <span>Socket.IO Real-Time GPS Emitter</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
                <span>Leaflet + OpenStreetMap</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Cuisines */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-400" />
              Popular Flavors
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {['Smash Burgers', 'Woodfired Pizza', 'Cyber Ramen', 'Dum Biryani', 'Acai Bowls', 'Birria Tacos', 'Glazed Donuts', 'Specialty Cafe'].map((c, i) => (
                <span
                  key={i}
                  className="px-2 py-1 rounded-lg text-[11px] bg-white/5 border border-white/5 hover:border-brand-500/30 transition-colors"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} FoodVerse Inc. Crafted for Culinary Excellence.</p>
          <p className="flex items-center gap-1.5">
            Built with <Heart className="w-3.5 h-3.5 text-brand-500 fill-brand-500" /> for Pair Programming Demonstration
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
