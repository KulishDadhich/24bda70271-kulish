/**
 * Order Status Timeline Component
 * Visual step tracker with glowing indicators, status icons, and timestamps.
 */

import React from 'react';
import { Check, Clock, Utensils, Bike, PackageCheck, AlertCircle } from 'lucide-react';

const STAGES = [
  { key: 'Placed', label: 'Order Placed', desc: 'Received & awaiting kitchen confirm', icon: Clock },
  { key: 'Accepted', label: 'Accepted', desc: 'Restaurant confirmed your order', icon: Utensils },
  { key: 'Preparing', label: 'Preparing Food', desc: 'Master chef is cooking your dishes', icon: Utensils },
  { key: 'Out for Delivery', label: 'On the Way', desc: 'Rider is cruising to your address', icon: Bike },
  { key: 'Delivered', label: 'Delivered', desc: 'Enjoy your delicious feast!', icon: PackageCheck },
];

export const OrderTimeline = ({ currentStatus = 'Placed', statusTimeline = [] }) => {
  const currentIndex = STAGES.findIndex(s => s.key === currentStatus);
  const activeIndex = currentIndex === -1 ? 0 : currentIndex;

  const getTimelineTime = stageKey => {
    const entry = statusTimeline.find(t => t.status === stageKey);
    if (!entry) return null;
    const d = new Date(entry.timestamp);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 shadow-xl">
      <h3 className="font-display text-lg font-bold text-white mb-6 flex items-center justify-between">
        <span>Order Progress</span>
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-brand-500/20 text-brand-400 border border-brand-500/30">
          ● {currentStatus}
        </span>
      </h3>

      <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-white/10">
        {STAGES.map((stage, idx) => {
          const isCompleted = idx < activeIndex;
          const isCurrent = idx === activeIndex;
          const Icon = stage.icon;
          const timeString = getTimelineTime(stage.key);

          return (
            <div key={stage.key} className="relative flex items-start justify-between group">
              {/* Step Marker Node */}
              <div
                className={`absolute -left-6 sm:-left-8 w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                  isCompleted
                    ? 'bg-emerald-500 border-emerald-400 text-white shadow-glow-sm'
                    : isCurrent
                    ? 'bg-brand-500 border-white text-white shadow-glow-md animate-pulse'
                    : 'bg-dark-900 border-white/20 text-slate-500'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                ) : (
                  <Icon className="w-3.5 h-3.5" />
                )}
              </div>

              {/* Stage Text Details */}
              <div className="pl-3 sm:pl-4 flex-1">
                <div className="flex items-center justify-between">
                  <h4
                    className={`text-sm font-bold transition-colors ${
                      isCurrent ? 'text-brand-400' : isCompleted ? 'text-white' : 'text-slate-500'
                    }`}
                  >
                    {stage.label}
                  </h4>
                  {timeString && (
                    <span className="text-[11px] font-semibold text-slate-400">{timeString}</span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{stage.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderTimeline;
