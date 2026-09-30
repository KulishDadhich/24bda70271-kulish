/**
 * FoodVerse Main React Application Component
 * 
 * Configures React Router, global Zustand stores (Cart, Auth, Theme),
 * Top Navbar, Footer, and global Checkout modals.
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import CartDrawer from './components/cart/CartDrawer';
import CheckoutModal from './components/cart/CheckoutModal';

// Pages
import HomePage from './pages/HomePage';
import RestaurantsPage from './pages/RestaurantsPage';
import RestaurantDetailPage from './pages/RestaurantDetailPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import RestaurantDashboardPage from './pages/RestaurantDashboardPage';
import DeliveryDashboardPage from './pages/DeliveryDashboardPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

import { useThemeStore } from './store/useThemeStore';
import { useAuthStore } from './store/useAuthStore';

// Protected Route Wrapper for Admin / Delivery roles
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export const App = () => {
  const { theme } = useThemeStore();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  useEffect(() => {
    // Sync theme on startup
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-[#07090E] text-slate-100 selection:bg-brand-500 selection:text-white">
        {/* Top Navbar */}
        <Navbar />

        {/* Main Content Viewport */}
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/restaurants" element={<RestaurantsPage />} />
            <Route path="/restaurant/:idOrSlug" element={<RestaurantDetailPage />} />
            <Route path="/track/:orderId" element={<OrderTrackingPage />} />
            <Route path="/orders" element={<OrderHistoryPage />} />

            {/* Role-Specific Dashboards */}
            <Route
              path="/dashboard/restaurant"
              element={
                <ProtectedRoute allowedRoles={['restaurant_admin']}>
                  <RestaurantDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/delivery"
              element={
                <ProtectedRoute allowedRoles={['delivery_partner', 'restaurant_admin']}>
                  <DeliveryDashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* Fallback 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Global Cart Slide Drawer */}
        <CartDrawer onOpenCheckout={() => setIsCheckoutOpen(true)} />

        {/* Global Checkout Modal */}
        <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} />

        {/* Global Footer */}
        <Footer />
      </div>
    </Router>
  );
};

export default App;
