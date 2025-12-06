import React from 'react';
import { motion } from 'framer-motion';

const EmptyWishlist = () => {
  return (
    <div className="flex flex-col items-center justify-center p-6">
      {/* Red Animated Heart Circle */}
      <motion.div
        className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-red-100 to-red-300 p-4 flex items-center justify-center shadow-lg mb-6"
        animate={{
          boxShadow: [
            "0 4px 8px rgba(239, 68, 68, 0.1)",
            "0 4px 20px rgba(239, 68, 68, 0.3)",
            "0 4px 8px rgba(239, 68, 68, 0.1)"
          ]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <motion.svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-12 h-12 sm:w-16 sm:h-16 text-red-500"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, -5, 5, 0]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
        </motion.svg>
      </motion.div>

      {/* Attractive Quote */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-center max-w-md"
      >
        <p className="text-gray-700 italic mb-2 text-sm sm:text-base">
          "Each piece you choose tells a story of refinement."
        </p>
        <p className="text-xs sm:text-sm text-gray-500">
          Start writing yours.
        </p>
      </motion.div>
    </div>
  );
};

export default EmptyWishlist;
