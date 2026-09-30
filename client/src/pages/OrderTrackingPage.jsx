/**
 * Real-Time Order Tracking Page
 * 
 * Features:
 * 1. Socket.IO connection to order room for live GPS updates and status changes.
 * 2. 3D Animated Delivery Scooter Canvas with active transit effects.
 * 3. Live Leaflet OpenStreetMap with real-time interpolated courier position.
 * 4. Step Progress Timeline with status indicators.
 * 5. Rider Details, direct call modal, and Viva 1-click status advance controls.
 * 6. Post-delivery rating & review submission.
 */

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Sparkles,
  MapPin,
  Clock,
  ShieldCheck,
  Star,
  CheckCircle,
  ArrowLeft,
  Bike,
  Store,
  Package,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import LiveTrackingMap from '../components/tracking/LiveTrackingMap';
import OrderTimeline from '../components/tracking/OrderTimeline';
import RiderCard from '../components/tracking/RiderCard';
import Scooter3DCanvas from '../components/3d/Scooter3DCanvas';
import Loader from '../components/common/Loader';
import { getSocket, joinOrderRoom, leaveOrderRoom } from '../services/socket';
import api from '../services/api';

export const OrderTrackingPage = () => {
  const { orderId } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [riderLocation, setRiderLocation] = useState(null);
  const [riderHeading, setRiderHeading] = useState(0);
  const [etaMinutes, setEtaMinutes] = useState(25);
  const [currentStatus, setCurrentStatus] = useState('Placed');
  const [statusTimeline, setStatusTimeline] = useState([]);

  // Post-delivery Review Form
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  useEffect(() => {
    // 1. Initial REST fetch for Order
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/${orderId}`);
        const data = res.data.data;
        setOrder(data);
        setCurrentStatus(data.orderStatus);
        setStatusTimeline(data.statusTimeline || []);
        setEtaMinutes(data.estimatedDeliveryMinutes || 25);
        if (data.liveLocation) {
          setRiderLocation({
            lat: data.liveLocation.lat,
            lng: data.liveLocation.lng,
            speedKmh: data.liveLocation.speedKmh,
          });
          setRiderHeading(data.liveLocation.heading || 0);
        }
      } catch (err) {
        console.error('Failed to load order:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();

    // 2. Socket.IO Real-Time Room Subscription
    const socket = getSocket();
    joinOrderRoom(orderId);

    // Handle high-frequency live GPS updates from backend simulation service
    socket.on('order:locationUpdate', payload => {
      if (payload.liveLocation) {
        setRiderLocation({
          lat: payload.liveLocation.lat,
          lng: payload.liveLocation.lng,
          speedKmh: payload.liveLocation.speedKmh,
        });
        setRiderHeading(payload.liveLocation.heading || 0);
      }
      if (payload.estimatedDeliveryMinutes !== undefined) {
        setEtaMinutes(payload.estimatedDeliveryMinutes);
      }
    });

    // Handle order stage transitions (Placed -> Accepted -> Preparing -> Out for Delivery -> Delivered)
    socket.on('order:statusUpdate', payload => {
      setCurrentStatus(payload.orderStatus);
      setStatusTimeline(prev => [
        ...prev,
        {
          status: payload.orderStatus,
          timestamp: payload.timestamp || new Date(),
          note: payload.note || `Order status updated to ${payload.orderStatus}`,
        },
      ]);

      if (payload.orderStatus === 'Delivered') {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#ff416c', '#00f0ff', '#ffb703', '#55a630'],
        });
      }
    });

    return () => {
      leaveOrderRoom(orderId);
      socket.off('order:locationUpdate');
      socket.off('order:statusUpdate');
    };
  }, [orderId]);

  const handleReviewSubmit = async e => {
    e.preventDefault();
    try {
      await api.post(`/orders/${orderId}/review`, {
        rating: reviewRating,
        comment: reviewComment,
      });
      setReviewSubmitted(true);
      setTimeout(() => setShowReviewModal(false), 2000);
    } catch (err) {
      console.error('Review submission error:', err);
    }
  };

  if (loading) {
    return <Loader message="Connecting to FoodVerse Live GPS Tracking Network..." />;
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto py-20 text-center glass-card rounded-3xl p-8 space-y-4">
        <h3 className="text-lg font-bold text-white">Order Not Found</h3>
        <p className="text-xs text-slate-400">We could not locate this order in the tracking room.</p>
        <Link to="/orders" className="btn-primary text-xs">
          View My Orders
        </Link>
      </div>
    );
  }

  const restaurantPos = order.restaurant?.location || { lat: 37.7871, lng: -122.4116 };
  const customerPos = {
    lat: order.deliveryAddress?.lat || 37.7865,
    lng: order.deliveryAddress?.lng || -122.4042,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. Top Header & Reference */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            to="/orders"
            className="text-xs font-semibold text-slate-400 hover:text-brand-400 flex items-center gap-1.5 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Orders
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl sm:text-3xl font-black text-white">
              Tracking Order <span className="text-brand-400 font-mono">#{order.orderNumber}</span>
            </h1>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border ${
                currentStatus === 'Delivered'
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : 'bg-brand-500/20 text-brand-400 border-brand-500/30 animate-pulse'
              }`}
            >
              ● {currentStatus}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            From <strong className="text-slate-200">{order.restaurant?.name}</strong> • Placed on{' '}
            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        {/* Post-Delivery Rate Button */}
        {currentStatus === 'Delivered' && (
          <button
            onClick={() => setShowReviewModal(true)}
            className="btn-primary text-xs flex items-center gap-2"
          >
            <Star className="w-4 h-4 fill-white" />
            <span>{reviewSubmitted ? 'Review Submitted ★' : 'Rate Your Experience'}</span>
          </button>
        )}
      </div>

      {/* 2. 3D Delivery Animation Banner */}
      <div className="glass-panel rounded-3xl p-6 border border-white/10 relative overflow-hidden shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-5 space-y-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-500/20 text-brand-400 border border-brand-500/30 inline-flex items-center gap-1.5">
              <Bike className="w-3.5 h-3.5" />
              Live 3D Transit Simulator
            </span>
            <h3 className="font-display text-2xl font-bold text-white">
              {currentStatus === 'Delivered'
                ? 'Delivered to Your Doorstep!'
                : currentStatus === 'Out for Delivery'
                ? 'Rider is Speeding to You'
                : 'Preparing Fresh at Kitchen'}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Interactive 3D electric courier with active wheel physics and real-time Socket.IO synchronization.
            </p>
          </div>

          {/* 3D Scooter Canvas */}
          <div className="lg:col-span-7 h-48 sm:h-56 rounded-2xl bg-dark-950/60 border border-white/5 overflow-hidden flex items-center justify-center relative">
            <Scooter3DCanvas
              isMoving={currentStatus === 'Out for Delivery' || currentStatus === 'Preparing'}
              height="100%"
            />
          </div>
        </div>
      </div>

      {/* 3. Main Dashboard: Live Map (Left) + Timeline & Rider (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Leaflet OpenStreetMap */}
        <div className="lg:col-span-7 space-y-6">
          <LiveTrackingMap
            restaurantPos={restaurantPos}
            customerPos={customerPos}
            riderPos={riderLocation || restaurantPos}
            routePolyline={order.routePolyline || []}
            restaurantName={order.restaurant?.name}
            customerAddress={order.deliveryAddress?.street}
            riderName={order.deliveryPartner?.name || 'Alex "Swift" Morgan'}
            riderHeading={riderHeading}
            orderStatus={currentStatus}
          />

          {/* Order Items Receipt Card */}
          <div className="glass-card rounded-3xl p-6 border border-white/10 shadow-xl space-y-4">
            <h3 className="font-display text-base font-bold text-white flex items-center gap-2">
              <Package className="w-4 h-4 text-brand-400" />
              Ordered Items ({order.items?.length})
            </h3>

            <div className="divide-y divide-white/5 space-y-2">
              {order.items?.map((item, idx) => (
                <div key={idx} className="pt-2 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-10 h-10 rounded-lg object-cover bg-dark-950"
                    />
                    <div>
                      <p className="font-bold text-white">{item.name}</p>
                      <p className="text-slate-400">Qty: {item.quantity} × ${item.price.toFixed(2)}</p>
                    </div>
                  </div>
                  <span className="font-bold text-slate-200">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Total Pricing Row */}
            <div className="pt-4 border-t border-white/10 flex justify-between items-center text-sm">
              <span className="text-slate-400">Total Paid ({order.paymentMethod?.toUpperCase()})</span>
              <span className="font-bold text-brand-400 text-base">
                ${order.pricing?.total?.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Timeline & Rider Info */}
        <div className="lg:col-span-5 space-y-6">
          <RiderCard
            orderId={order._id}
            rider={order.deliveryPartner}
            estimatedDeliveryMinutes={etaMinutes}
            orderStatus={currentStatus}
            onStatusAdvanced={updatedOrder => {
              setCurrentStatus(updatedOrder.orderStatus);
              setStatusTimeline(updatedOrder.statusTimeline);
            }}
          />

          <OrderTimeline currentStatus={currentStatus} statusTimeline={statusTimeline} />
        </div>
      </div>

      {/* Rating & Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-panel max-w-md w-full rounded-3xl p-6 border border-white/20 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto">
              <Star className="w-8 h-8 fill-amber-400" />
            </div>

            <div>
              <h3 className="font-display text-xl font-bold text-white">Rate Your Experience</h3>
              <p className="text-xs text-slate-400 mt-1">How was the food from {order.restaurant?.name}?</p>
            </div>

            {reviewSubmitted ? (
              <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Thank you! Your review has been recorded.
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                {/* Star Rating Select */}
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-1.5 focus:outline-none"
                    >
                      <Star
                        className={`w-7 h-7 transition-transform hover:scale-125 ${
                          star <= reviewRating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-600 fill-slate-800'
                        }`}
                      />
                    </button>
                  ))}
                </div>

                <textarea
                  rows="3"
                  value={reviewComment}
                  onChange={e => setReviewComment(e.target.value)}
                  placeholder="Share feedback on taste, presentation and delivery speed..."
                  className="w-full px-4 py-3 rounded-2xl glass-input text-xs"
                />

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowReviewModal(false)}
                    className="flex-1 py-2.5 rounded-xl glass-card text-xs font-semibold text-slate-400 hover:text-white"
                  >
                    Skip
                  </button>
                  <button type="submit" className="flex-1 py-2.5 rounded-xl btn-primary text-xs font-bold">
                    Submit Review
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTrackingPage;
