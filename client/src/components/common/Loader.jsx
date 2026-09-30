/**
 * Creative 3D-Style Loader Animation
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Utensils, Sparkles } from 'lucide-react';

export const Loader = ({ message = 'Preparing FoodVerse culinary universe...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 min-h-[220px]">
      <div className="relative flex items-center justify-center">
        {/* Outer glowing pulsing ring */}
        <motion.div
          animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0.8, 0.3], rotate: 360 }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="w-20 h-20 rounded-full border-2 border-dashed border-brand-500 absolute"
        />

        {/* Inner rotating gradient circle */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-brand-600 via-brand-400 to-amber-400 p-[2px]"
        >
          <div className="w-full h-full bg-dark-900 rounded-full flex items-center justify-center">
            <motion.span
              animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.15, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-2xl"
            >
              🍔
            </motion.span>
          </div>
        </motion.div>
      </div>

      <motion.p
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 1.8, repeat: Infinity }}
        className="mt-5 text-sm font-medium text-slate-300 tracking-wide flex items-center gap-2"
      >
        <Sparkles className="w-4 h-4 text-brand-400 animate-spin-slow" />
        {message}
      </motion.p>
    </div>
  );
};

export default Loader;
