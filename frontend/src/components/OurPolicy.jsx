import React from 'react';
import { motion } from 'framer-motion';
import { assets } from '../assets/assets';
import Title from './Title';

const OurPolicy = () => {
  return (
    <div className="bg-white py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Classic Section Header */}
        <div className="text-center">
          <Title
            lead="One World"
            headline="One Standard"
            subline="Wherever you go, we’ve got you"
          />
        </div>

        {/* Policy Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            {
              icon: assets.exchange_icon,
              title: "Hassle-Free Exchange",
              description: "Our straightforward exchange process ensures your complete satisfaction",
              duration: "7 days"
            },
            {
              icon: assets.quality_icon,
              title: "Guaranteed Returns",
              description: "Full refunds with no restocking fees when requested within policy period",
              duration: "15 days"
            },
            {
              icon: assets.support_img,
              title: "Concierge Support",
              description: "Dedicated assistance from our team of product specialists",
              duration: "24/7"
            }
          ].map((policy, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -5 }}
              transition={{ type: 'tween', ease: 'easeOut' }}
              className="relative"
            >
              {/* Classic Card Border */}
              <div className="absolute inset-0 border border-gray-200 rounded-sm pointer-events-none"></div>

              {/* Card Content */}
              <div className="relative h-full p-10 bg-white">
                {/* Icon with classic framing */}
                <div className="relative w-16 h-16 mb-8 mx-auto">
                  <div className="absolute inset-0 border border-gray-200 rounded-sm transform rotate-45"></div>
                  <div className="absolute inset-2 flex items-center justify-center">
                    <img
                      src={policy.icon}
                      alt={policy.title}
                      className="w-8 h-8 object-contain grayscale opacity-90"
                    />
                  </div>
                </div>

                {/* Policy Title */}
                <h3 className="text-xl font-serif font-normal text-gray-900 text-center mb-4">
                  {policy.title}
                </h3>

                {/* Description */}
                <p className="text-gray-500 text-center mb-6 leading-relaxed">
                  {policy.description}
                </p>

                {/* Classic Duration Badge */}
                <div className="text-center">
                  <span className="inline-block px-4 py-1 text-xs tracking-wider text-gray-500 border border-gray-300 rounded-full">
                    {policy.duration}
                  </span>
                </div>

                {/* Hover Indicator */}
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-px bg-gray-900 origin-left"
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OurPolicy;
