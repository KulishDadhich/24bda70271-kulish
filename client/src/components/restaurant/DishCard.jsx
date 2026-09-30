/**
 * Dish Card Component
 * Menu item presentation with dietary indicators, spice levels,
 * 3D model preview trigger, addon modal, and cart quantity controls.
 */

import React, { useState } from 'react';
import { Plus, Minus, Star, Flame, Box, Check, Sparkles, X } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import FoodItem3DPreview from '../3d/FoodItem3DPreview';

export const DishCard = ({ dish, restaurant, onConflict }) => {
  const [show3DModal, setShow3DModal] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState([]);

  const { items, addItem, updateQuantity, removeItem } = useCartStore();

  // Check if this dish is in cart
  const cartItem = items.find(item => item.dishId === dish._id);
  const currentQuantity = cartItem?.quantity || 0;

  const handleAddClick = () => {
    if (dish.options && dish.options.length > 0) {
      setShowOptionsModal(true);
      return;
    }

    const result = addItem(dish, restaurant, []);
    if (result.conflict) {
      onConflict(result);
    }
  };

  const handleConfirmCustomization = () => {
    const result = addItem(dish, restaurant, selectedOptions);
    setShowOptionsModal(false);
    if (result.conflict) {
      onConflict(result);
    }
  };

  const handleOptionSelect = (optionTitle, choice) => {
    // Replace or add
    const filtered = selectedOptions.filter(opt => opt.title !== optionTitle);
    setSelectedOptions([...filtered, { title: optionTitle, choice: choice.name, price: choice.price }]);
  };

  return (
    <>
      <div className="glass-card rounded-2xl p-4 sm:p-5 border border-white/10 hover:border-brand-500/40 transition-all flex flex-col sm:flex-row justify-between gap-4 group">
        {/* 1. Left Dish Details */}
        <div className="flex-1 space-y-2">
          {/* Top Badges */}
          <div className="flex items-center gap-2">
            {/* Veg / Non-Veg Icon */}
            <div
              className={`w-4 h-4 border flex items-center justify-center rounded-sm ${
                dish.isVeg ? 'border-emerald-500' : 'border-red-500'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${dish.isVeg ? 'bg-emerald-500' : 'bg-red-500'}`} />
            </div>

            {/* Bestseller Badge */}
            {dish.isBestseller && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                Bestseller
              </span>
            )}

            {/* Spice Meter */}
            {dish.isSpicy && (
              <span className="text-xs flex items-center gap-0.5 text-red-400" title={`Spice Level: ${dish.spiceLevel || 1}`}>
                {'🌶️'.repeat(dish.spiceLevel || 1)}
              </span>
            )}

            {/* 3D Preview Available Pill */}
            {dish.model3dType && dish.model3dType !== 'default' && (
              <button
                onClick={() => setShow3DModal(true)}
                className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30 flex items-center gap-1 transition-colors"
              >
                <Box className="w-3 h-3 text-purple-400" />
                3D View
              </button>
            )}
          </div>

          {/* Dish Name */}
          <h4 className="font-display font-bold text-base sm:text-lg text-white group-hover:text-brand-400 transition-colors">
            {dish.name}
          </h4>

          {/* Pricing */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-100 text-base sm:text-lg">${dish.price.toFixed(2)}</span>
            {dish.originalPrice && (
              <span className="text-xs text-slate-500 line-through">${dish.originalPrice.toFixed(2)}</span>
            )}
          </div>

          {/* Description */}
          <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{dish.description}</p>

          {/* Calories & Rating */}
          <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-400">
            {dish.calories && <span>⚡ {dish.calories} kcal</span>}
            {dish.rating && (
              <span className="flex items-center gap-1 text-amber-400">
                <Star className="w-3 h-3 fill-amber-400" />
                {dish.rating.toFixed(1)} ({dish.ratingCount || 40})
              </span>
            )}
          </div>
        </div>

        {/* 2. Right Dish Image & Add Button */}
        <div className="relative flex flex-col items-center sm:items-end justify-center shrink-0">
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-dark-900 border border-white/10">
            <img
              src={dish.image}
              alt={dish.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </div>

          {/* Quantity Controls / Add Button */}
          <div className="mt-[-16px] z-10">
            {currentQuantity > 0 ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-dark-900/90 border border-brand-500/40 text-brand-400 font-bold text-xs shadow-lg backdrop-blur-md">
                <button
                  onClick={() => updateQuantity(dish._id, currentQuantity - 1, cartItem?.selectedOptions)}
                  className="hover:text-white p-0.5"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-4 text-center text-white">{currentQuantity}</span>
                <button
                  onClick={() => updateQuantity(dish._id, currentQuantity + 1, cartItem?.selectedOptions)}
                  className="hover:text-white p-0.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleAddClick}
                className="px-4 py-1.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-glow-sm hover:shadow-glow-md transition-all flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3D Model Modal */}
      {show3DModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="glass-panel max-w-md w-full rounded-3xl p-6 border border-white/20 shadow-2xl relative">
            <button
              onClick={() => setShow3DModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-slate-300 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-4">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Interactive 3D Preview
              </span>
              <h3 className="font-display text-xl font-bold text-white mt-2">{dish.name}</h3>
              <p className="text-xs text-slate-400">Drag to rotate in 3D space</p>
            </div>

            <div className="h-64 rounded-2xl bg-dark-950/60 border border-white/5 overflow-hidden flex items-center justify-center">
              <FoodItem3DPreview type={dish.model3dType || 'burger'} height="240px" />
            </div>

            <div className="mt-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Price</p>
                <p className="text-xl font-bold text-white">${dish.price.toFixed(2)}</p>
              </div>

              <button
                onClick={() => {
                  setShow3DModal(false);
                  handleAddClick();
                }}
                className="btn-primary"
              >
                <Plus className="w-4 h-4" />
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customization Addon Options Modal */}
      {showOptionsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="glass-panel max-w-lg w-full rounded-3xl p-6 border border-white/20 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowOptionsModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-slate-300 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-display text-xl font-bold text-white mb-1">Customize Your Dish</h3>
            <p className="text-xs text-slate-400 mb-6">{dish.name}</p>

            <div className="space-y-6">
              {dish.options.map((option, optIdx) => (
                <div key={optIdx} className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">{option.title}</h4>
                  <div className="space-y-2">
                    {option.choices.map((choice, choiceIdx) => {
                      const isSelected = selectedOptions.some(
                        opt => opt.title === option.title && opt.choice === choice.name
                      );

                      return (
                        <div
                          key={choiceIdx}
                          onClick={() => handleOptionSelect(option.title, choice)}
                          className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-brand-500/20 border-brand-500 text-white'
                              : 'glass-card border-white/10 text-slate-300 hover:border-brand-500/30'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                isSelected ? 'border-brand-500 bg-brand-500' : 'border-slate-500'
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <span className="text-xs font-medium">{choice.name}</span>
                          </div>
                          {choice.price > 0 && (
                            <span className="text-xs font-bold text-amber-400">+${choice.price.toFixed(2)}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between">
              <button
                onClick={() => setShowOptionsModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>

              <button onClick={handleConfirmCustomization} className="btn-primary">
                Add with Customizations
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DishCard;
