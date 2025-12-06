import React from 'react';
import { motion } from 'framer-motion';
import { assets } from '../assets/assets';

const Spinner = ({
  src = assets.logo,
  alt = 'Loading',
  size = 'w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24',
  className = '',
}) => {
  return (
    <div
      role="status"
      aria-label={alt}
      className="flex items-center justify-center"
    >
      <motion.img
        src={src}
        alt={alt}
        className={`${size} object-contain drop-shadow-md ${className}`}
        animate={{ rotate: 360 }}
        transition={{
          repeat: Infinity,
          duration: 2,
          ease: 'linear',
        }}
      />
    </div>
  );
};

export default Spinner;
