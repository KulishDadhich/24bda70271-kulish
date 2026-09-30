/**
 * Delivery Partner Console
 * Dedicated dashboard for delivery riders to accept assigned orders,
 * navigate to restaurant/customer, and mark orders delivered.
 */

import React, { useState, useEffect } from 'react';
import { Bike, MapPin, Clock, CheckCircle2, ArrowRight, ShieldCheck, Eye } from 'lucide-react';
import Loader from '../components/common/Loader';
import api from '../services/api';

export const DeliveryDashboardPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await api.get('/orders/delivery/jobs');
        setJobs(res.data.data);
      } catch (err) {
        console.error('Failed to load delivery jobs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const handleUpdateStatus = async (orderId, status) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status });
      setJobs(prev =>
        prev
          .map(j => (j._id === orderId ? { ...j, orderStatus: status } : j))
          .filter(j => j.orderStatus !== 'Delivered')
      );
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  if (loading) {
    return <Loader message="Accessing Delivery Partner Fleet Console..." />;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mb-2">
          <Bike className="w-3.5 h-3.5" />
          <span>Active Courier Console</span>
        </div>
        <h1 className="font-display text-3xl font-black text-white">Rider Dispatch Center</h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Pick up prepared meals and broadcast real-time GPS telemetry to customers.
        </p>
      </div>

      {/* 2. Active Jobs */}
      {jobs.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center text-slate-400 space-y-2">
          <Bike className="w-12 h-12 mx-auto text-emerald-400" />
          <h3 className="font-bold text-white text-base">No active delivery assignments</h3>
          <p className="text-xs">You're currently all caught up! New orders ready for pickup will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map(job => (
            <div
              key={job._id}
              className="glass-card rounded-3xl p-6 border border-white/10 hover:border-emerald-500/40 transition-all shadow-xl space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
                <div>
                  <h3 className="font-bold text-base text-white">
                    Delivery for Order #{job.orderNumber}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Customer: <strong className="text-slate-200">{job.customer?.name}</strong> •{' '}
                    {job.customer?.phone}
                  </p>
                </div>

                <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-500/20 text-brand-400 border border-brand-500/30 animate-pulse self-start sm:self-center">
                  ● {job.orderStatus}
                </span>
              </div>

              {/* Route Waypoints Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-2xl bg-dark-950/60 border border-white/5 space-y-1">
                  <p className="font-bold text-brand-400 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    Pickup From:
                  </p>
                  <p className="font-bold text-white">{job.restaurant?.name}</p>
                  <p className="text-slate-400">{job.restaurant?.address}</p>
                </div>

                <div className="p-3 rounded-2xl bg-dark-950/60 border border-white/5 space-y-1">
                  <p className="font-bold text-emerald-400 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    Deliver To:
                  </p>
                  <p className="font-bold text-white">{job.deliveryAddress?.street}</p>
                  <p className="text-slate-400">
                    {job.deliveryAddress?.city}, {job.deliveryAddress?.zipCode}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs">
                <span className="text-slate-400">
                  {job.items?.length} items • Payout: <strong className="text-emerald-400">$6.50</strong>
                </span>

                <div className="flex items-center gap-2">
                  {job.orderStatus === 'Preparing' && (
                    <button
                      onClick={() => handleUpdateStatus(job._id, 'Out for Delivery')}
                      className="btn-primary text-xs"
                    >
                      Pick Up & Start Live GPS
                    </button>
                  )}

                  {job.orderStatus === 'Out for Delivery' && (
                    <button
                      onClick={() => handleUpdateStatus(job._id, 'Delivered')}
                      className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-glow-sm flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Mark Delivered
                    </button>
                  )}

                  <a
                    href={`/track/${job._id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-2 rounded-xl glass-card text-slate-300 hover:text-white font-semibold flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Customer View
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DeliveryDashboardPage;
