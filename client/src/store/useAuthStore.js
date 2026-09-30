/**
 * Authentication Store (Zustand)
 * Manages user credentials, JWT token persistence in localStorage,
 * and 1-click Demo accounts for instant role switching.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Login with Email & Password
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const res = await api.post('/auth/login', { email, password });
          const { token, ...userData } = res.data.data;
          set({
            user: userData,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
          return { success: true };
        } catch (err) {
          const message = err.response?.data?.message || 'Login failed. Please check your credentials.';
          set({ error: message, isLoading: false });
          return { success: false, message };
        }
      },

      // Register New Account
      register: async formData => {
        set({ isLoading: true, error: null });
        try {
          const res = await api.post('/auth/register', formData);
          const { token, ...userData } = res.data.data;
          set({
            user: userData,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
          return { success: true };
        } catch (err) {
          const message = err.response?.data?.message || 'Registration failed.';
          set({ error: message, isLoading: false });
          return { success: false, message };
        }
      },

      // Instant 1-Click Demo Login for Viva / Presentation
      demoLogin: async role => {
        const demoEmails = {
          customer: 'customer@foodverse.com',
          restaurant_admin: 'restaurant@foodverse.com',
          delivery_partner: 'delivery@foodverse.com',
        };

        const email = demoEmails[role] || demoEmails.customer;
        return await get().login(email, 'password123');
      },

      // Update Profile Details
      updateProfile: async profileData => {
        set({ isLoading: true, error: null });
        try {
          const res = await api.put('/auth/profile', profileData);
          const updated = res.data.data;
          set(state => ({
            user: { ...state.user, ...updated },
            isLoading: false,
          }));
          return { success: true };
        } catch (err) {
          const message = err.response?.data?.message || 'Update profile failed';
          set({ error: message, isLoading: false });
          return { success: false, message };
        }
      },

      // Logout
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
        localStorage.removeItem('foodverse_auth');
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'foodverse_auth',
    }
  )
);
