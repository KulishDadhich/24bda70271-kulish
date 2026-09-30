/**
 * Cart Store (Zustand)
 * Manages shopping cart items, cross-restaurant cart conflict validation,
 * discount coupon calculations, and checkout price breakdown.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      restaurant: null,
      coupon: null,
      isCartOpen: false,

      // Add item to cart
      addItem: (dish, restaurant, selectedOptions = []) => {
        const state = get();

        // If cart has items from another restaurant, return conflict indicator
        if (state.restaurant && state.restaurant._id !== restaurant._id && state.items.length > 0) {
          return {
            conflict: true,
            currentRestaurant: state.restaurant,
            newRestaurant: restaurant,
          };
        }

        // Calculate item unit price with option addons
        let unitPrice = dish.price;
        if (selectedOptions && selectedOptions.length > 0) {
          selectedOptions.forEach(opt => {
            if (opt.price) unitPrice += Number(opt.price);
          });
        }

        // Check if identical item + option configuration is already in cart
        const existingIndex = state.items.findIndex(
          item =>
            item.dishId === dish._id &&
            JSON.stringify(item.selectedOptions || []) === JSON.stringify(selectedOptions || [])
        );

        let newItems;
        if (existingIndex > -1) {
          newItems = [...state.items];
          newItems[existingIndex].quantity += 1;
        } else {
          newItems = [
            ...state.items,
            {
              dishId: dish._id,
              name: dish.name,
              price: Number(unitPrice.toFixed(2)),
              basePrice: dish.price,
              quantity: 1,
              isVeg: dish.isVeg,
              image: dish.image,
              model3dType: dish.model3dType || 'default',
              category: dish.category,
              selectedOptions,
            },
          ];
        }

        set({
          items: newItems,
          restaurant: {
            _id: restaurant._id,
            name: restaurant.name,
            image: restaurant.image,
            deliveryFee: restaurant.deliveryFee ?? 2.99,
            deliveryTimeMinutes: restaurant.deliveryTimeMinutes ?? 25,
            address: restaurant.address,
            location: restaurant.location,
          },
        });

        return { success: true };
      },

      // Update quantity
      updateQuantity: (dishId, quantity, selectedOptions = []) => {
        const state = get();
        if (quantity <= 0) {
          get().removeItem(dishId, selectedOptions);
          return;
        }

        const newItems = state.items.map(item => {
          if (
            item.dishId === dishId &&
            JSON.stringify(item.selectedOptions || []) === JSON.stringify(selectedOptions || [])
          ) {
            return { ...item, quantity };
          }
          return item;
        });

        set({ items: newItems });
      },

      // Remove single item from cart
      removeItem: (dishId, selectedOptions = []) => {
        const state = get();
        const newItems = state.items.filter(
          item =>
            !(
              item.dishId === dishId &&
              JSON.stringify(item.selectedOptions || []) === JSON.stringify(selectedOptions || [])
            )
        );

        set({
          items: newItems,
          restaurant: newItems.length === 0 ? null : state.restaurant,
          coupon: newItems.length === 0 ? null : state.coupon,
        });
      },

      // Apply coupon code
      applyCoupon: couponData => {
        set({ coupon: couponData });
      },

      // Remove applied coupon
      removeCoupon: () => {
        set({ coupon: null });
      },

      // Clear entire cart
      clearCart: () => {
        set({
          items: [],
          restaurant: null,
          coupon: null,
        });
      },

      // Toggle slide-in cart drawer
      setIsCartOpen: isOpen => set({ isCartOpen: isOpen }),
      toggleCart: () => set(state => ({ isCartOpen: !state.isCartOpen })),

      // Pricing Calculations
      getSubtotal: () => {
        const items = get().items;
        return Number(items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2));
      },

      getTax: () => {
        const subtotal = get().getSubtotal();
        return Number((subtotal * 0.08).toFixed(2)); // 8% GST/Tax
      },

      getDeliveryFee: () => {
        const subtotal = get().getSubtotal();
        const restaurant = get().restaurant;
        if (subtotal === 0) return 0;
        if (subtotal > 40) return 0; // Free delivery over $40
        return restaurant?.deliveryFee ?? 2.99;
      },

      getDiscount: () => {
        const subtotal = get().getSubtotal();
        const coupon = get().coupon;
        if (!coupon || subtotal === 0) return 0;

        let discount = (subtotal * coupon.discountPercent) / 100;
        if (coupon.maxDiscount && discount > coupon.maxDiscount) {
          discount = coupon.maxDiscount;
        }
        return Number(discount.toFixed(2));
      },

      getTotal: () => {
        const subtotal = get().getSubtotal();
        if (subtotal === 0) return 0;
        const tax = get().getTax();
        const deliveryFee = get().getDeliveryFee();
        const discount = get().getDiscount();
        return Number((subtotal + tax + deliveryFee - discount).toFixed(2));
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: 'foodverse_cart',
    }
  )
);
