import React from 'react';
import { motion } from 'framer-motion';
import { assets } from '../assets/assets';

const EmptyCart = () => {
  return (
    <div className="flex flex-col items-center justify-center p-6">
      {/* Animated Cart Circle */}
      <motion.div
        className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-gray-100 to-gray-300 p-4 flex items-center justify-center shadow-lg mb-6"
        animate={{
          boxShadow: [
            "0 4px 8px rgba(0, 0, 0, 0.1)",
            "0 4px 20px rgba(0, 0, 0, 0.3)",
            "0 4px 8px rgba(0, 0, 0, 0.1)"
          ]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, -5, 5, 0]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <img 
            src={assets.cart_icon} 
            alt="Shopping cart icon"
            className="w-12 h-12 sm:w-16 sm:h-16 filter grayscale"
          />
        </motion.div>
      </motion.div>

      {/* Motivational Quote */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-center max-w-md"
      >
        <p className="text-gray-700 italic mb-2 text-sm sm:text-base">
          "Your cart is empty, but your style journey awaits."
        </p>
        <p className="text-xs sm:text-sm text-gray-500">
          Discover curated pieces to complete your look.
        </p>
      </motion.div>
    </div>
  );
};

export default EmptyCart;
