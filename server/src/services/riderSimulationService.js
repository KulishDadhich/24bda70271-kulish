/**
 * Real-Time Rider Simulation Engine
 * 
 * Features:
 * 1. Generates interpolated geographic route waypoints between Restaurant and Customer coordinates.
 * 2. Emits GPS coordinate updates, heading/bearing angle, and dynamic ETA via Socket.IO every 2 seconds.
 * 3. Automatically transitions the order from "Out for Delivery" to "Delivered" upon reaching the destination.
 * 4. Maintains active simulation timers in memory so orders can be tracked smoothly across browser sessions.
 */

const Order = require('../models/Order');

// Map of active interval timers: orderId -> Interval ID
const activeSimulations = new Map();

/**
 * Generate synthetic realistic city street waypoints between start and end coordinates
 */
const generateRouteWaypoints = (startLat, startLng, endLat, endLng, numSteps = 24) => {
  const points = [];
  
  // Add intermediate subtle curve offsets to simulate city grid roads
  const midLat = (startLat + endLat) / 2;
  const midLng = (startLng + endLng) / 2;
  
  // 1st control waypoint (turning a corner)
  const waypoint1 = {
    lat: startLat + (midLat - startLat) * 0.8 + 0.0015,
    lng: startLng + (midLng - startLng) * 0.2 - 0.0012,
  };

  // 2nd control waypoint
  const waypoint2 = {
    lat: midLat + (endLat - midLat) * 0.4 - 0.001,
    lng: midLng + (endLng - midLng) * 0.9 + 0.0015,
  };

  // Interpolate 4 segments: start -> wp1 -> mid -> wp2 -> end
  const keyNodes = [
    { lat: startLat, lng: startLng },
    { lat: waypoint1.lat, lng: waypoint1.lng },
    { lat: midLat, lng: midLng },
    { lat: waypoint2.lat, lng: waypoint2.lng },
    { lat: endLat, lng: endLng },
  ];

  const stepsPerSegment = Math.floor(numSteps / (keyNodes.length - 1));

  for (let s = 0; s < keyNodes.length - 1; s++) {
    const from = keyNodes[s];
    const to = keyNodes[s + 1];
    
    for (let i = 0; i < stepsPerSegment; i++) {
      const t = i / stepsPerSegment;
      points.push({
        lat: Number((from.lat + (to.lat - from.lat) * t).toFixed(6)),
        lng: Number((from.lng + (to.lng - from.lng) * t).toFixed(6)),
      });
    }
  }

  // Ensure exact destination is the last point
  points.push({ lat: Number(endLat.toFixed(6)), lng: Number(endLng.toFixed(6)) });
  return points;
};

/**
 * Calculate compass bearing angle in degrees between two GPS coordinates
 */
const calculateBearing = (lat1, lon1, lat2, lon2) => {
  const toRad = deg => (deg * Math.PI) / 180;
  const toDeg = rad => (rad * 180) / Math.PI;

  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δλ = toRad(lon2 - lon1);

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) -
    Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

  let brng = toDeg(Math.atan2(y, x));
  return (brng + 360) % 360;
};

/**
 * Start or resume live rider tracking simulation for an order
 */
const startRiderSimulation = async (orderId, io) => {
  // If already running, prevent duplicate intervals
  if (activeSimulations.has(orderId.toString())) {
    return;
  }

  try {
    const order = await Order.findById(orderId);
    if (!order || order.orderStatus === 'Delivered' || order.orderStatus === 'Cancelled') {
      return;
    }

    // Default start coords from restaurant or default city center
    const startLat = order.restaurant?.location?.lat || 37.7833;
    const startLng = order.restaurant?.location?.lng || -122.4167;
    
    // Destination coords from delivery address
    const endLat = order.deliveryAddress?.lat || 37.7749;
    const endLng = order.deliveryAddress?.lng || -122.4194;

    // Generate or fetch route waypoints
    let route = order.routePolyline;
    if (!route || route.length === 0) {
      route = generateRouteWaypoints(startLat, startLng, endLat, endLng, 30);
      order.routePolyline = route;
      order.liveLocation = {
        lat: route[0].lat,
        lng: route[0].lng,
        heading: 0,
        speedKmh: 28,
        currentStepIndex: 0,
        totalSteps: route.length,
      };
      await order.save();
    }

    let currentIndex = order.liveLocation?.currentStepIndex || 0;
    const totalSteps = route.length;

    console.log(`🛵 [Rider Simulation] Started live rider GPS emitter for Order #${order.orderNumber} (Total steps: ${totalSteps}, Starting step: ${currentIndex})`);

    // Emit initial state immediately
    if (io) {
      io.to(`order:${orderId}`).emit('order:locationUpdate', {
        orderId: order._id,
        orderNumber: order.orderNumber,
        liveLocation: order.liveLocation,
        routePolyline: route,
        estimatedDeliveryMinutes: Math.max(1, Math.ceil(((totalSteps - currentIndex) / totalSteps) * (order.estimatedDeliveryMinutes || 25))),
        orderStatus: order.orderStatus,
      });
    }

    // Interval ticker every 2000 ms (2 seconds)
    const intervalId = setInterval(async () => {
      currentIndex++;

      if (currentIndex >= totalSteps) {
        // Rider reached the destination!
        clearInterval(intervalId);
        activeSimulations.delete(orderId.toString());

        const finalPoint = route[route.length - 1];
        
        try {
          const finishedOrder = await Order.findById(orderId);
          if (finishedOrder && finishedOrder.orderStatus !== 'Delivered') {
            finishedOrder.orderStatus = 'Delivered';
            finishedOrder.deliveredAt = new Date();
            finishedOrder.liveLocation = {
              lat: finalPoint.lat,
              lng: finalPoint.lng,
              heading: 0,
              speedKmh: 0,
              currentStepIndex: totalSteps - 1,
              totalSteps,
            };
            finishedOrder.statusTimeline.push({
              status: 'Delivered',
              timestamp: new Date(),
              note: 'Order successfully delivered by rider.',
            });
            await finishedOrder.save();

            console.log(`🎉 [Rider Simulation] Order #${finishedOrder.orderNumber} has arrived and is marked DELIVERED!`);

            if (io) {
              io.to(`order:${orderId}`).emit('order:statusUpdate', {
                orderId: finishedOrder._id,
                orderNumber: finishedOrder.orderNumber,
                orderStatus: 'Delivered',
                timestamp: new Date(),
                note: 'Your food has arrived! Enjoy your meal 😋',
                order: finishedOrder,
              });

              io.to(`order:${orderId}`).emit('order:locationUpdate', {
                orderId: finishedOrder._id,
                orderNumber: finishedOrder.orderNumber,
                liveLocation: finishedOrder.liveLocation,
                routePolyline: route,
                estimatedDeliveryMinutes: 0,
                orderStatus: 'Delivered',
              });
            }
          }
        } catch (saveErr) {
          console.error('Error saving delivered order state:', saveErr);
        }
        return;
      }

      // Compute current step and heading
      const currentPoint = route[currentIndex];
      const prevPoint = route[currentIndex - 1] || currentPoint;
      const heading = calculateBearing(prevPoint.lat, prevPoint.lng, currentPoint.lat, currentPoint.lng);
      const remainingMinutes = Math.max(1, Math.ceil(((totalSteps - currentIndex) / totalSteps) * (order.estimatedDeliveryMinutes || 25)));

      const liveLocation = {
        lat: currentPoint.lat,
        lng: currentPoint.lng,
        heading: Math.round(heading),
        speedKmh: Math.floor(25 + Math.random() * 8),
        currentStepIndex: currentIndex,
        totalSteps,
      };

      // Periodically persist to DB every 3 ticks
      if (currentIndex % 3 === 0) {
        Order.findByIdAndUpdate(orderId, { liveLocation }).catch(err =>
          console.error('DB update error in simulation:', err.message)
        );
      }

      // Emit live coordinate update through Socket.IO
      if (io) {
        io.to(`order:${orderId}`).emit('order:locationUpdate', {
          orderId: order._id,
          orderNumber: order.orderNumber,
          liveLocation,
          routePolyline: route,
          estimatedDeliveryMinutes: remainingMinutes,
          orderStatus: 'Out for Delivery',
        });
      }
    }, 2000);

    activeSimulations.set(orderId.toString(), intervalId);
  } catch (err) {
    console.error(`❌ Error starting rider simulation for ${orderId}:`, err);
  }
};

/**
 * Stop active simulation if order is cancelled or completed
 */
const stopRiderSimulation = orderId => {
  if (activeSimulations.has(orderId.toString())) {
    clearInterval(activeSimulations.get(orderId.toString()));
    activeSimulations.delete(orderId.toString());
    console.log(`⏹️ Stopped simulation for Order ${orderId}`);
  }
};

module.exports = {
  startRiderSimulation,
  stopRiderSimulation,
  generateRouteWaypoints,
  calculateBearing,
};
