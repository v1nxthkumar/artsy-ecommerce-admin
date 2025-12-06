import React, { useContext, useEffect, useRef, useState } from 'react';
import { ShopContext } from '../context/ShopContext.jsx';
import { Link, useNavigate } from 'react-router-dom';
import { assets } from '../assets/assets.js';
import { motion } from 'framer-motion';

const ProductItem = ({
  id,
  image = [],
  name,
  price,
  subCategory,
}) => {
  const {
    currency,
    wishlistItems,
    wishlistLoaded,
    addToWishlist,
    removeFromWishlist,
    isAuthenticated,
  } = useContext(ShopContext);

  const navigate = useNavigate();

  const [index, setIndex] = useState(0);
  const intervalRef = useRef(null);
  const containerRef = useRef(null);

  const displayedImages = image.slice(0, 4);

  const isWishlisted = wishlistItems.some(item =>
    typeof item === 'string'
      ? item === id
      : item?._id === id || item?.productId === id
  );

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent triggering the Link

    if (!isAuthenticated) {
      navigate('/login'); // Redirect if not logged in
      return;
    }

    isWishlisted ? removeFromWishlist(id) : addToWishlist(id);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container || displayedImages.length < 2) return;

    const start = () => {
      intervalRef.current = setInterval(() => {
        setIndex(prev => (prev + 1) % displayedImages.length);
      }, 1000);
    };

    const stop = () => {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      setIndex(0);
    };

    container.addEventListener('mouseenter', start);
    container.addEventListener('mouseleave', stop);

    return () => {
      container.removeEventListener('mouseenter', start);
      container.removeEventListener('mouseleave', stop);
      clearInterval(intervalRef.current);
    };
  }, [displayedImages.length]);

  return (
    <>
      <Link to={`/product/${id}`} className="block group">
        <div className="relative transition duration-200 max-w-sm text-gray-900 text-sm tracking-wide overflow-hidden group">
          
          {/* Wishlist Icon */}
          <motion.button
            onClick={handleWishlistToggle}
            className="absolute top-3 right-3 z-10 
            w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 
            flex items-center justify-center p-0 bg-transparent border-none"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <div className={`absolute inset-0 rounded-full ${isWishlisted ? 'bg-gradient-to-br from-red-100/70 to-red-200/70' : 'bg-gray-100/50'}`} />
            <motion.div className="relative z-10">
              <motion.svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className={`w-4 h-4 sm:w-5 sm:h-5 ${isWishlisted ? 'text-red-500' : 'text-gray-500'}`}
                animate={isWishlisted ? {
                  scale: [1, 1.15, 1],
                  rotate: [0, -3, 3, 0]
                } : {}}
                transition={{
                  duration: 1.5,
                  repeat: isWishlisted ? Infinity : 0,
                  ease: "easeInOut"
                }}
              >
                <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
              </motion.svg>
            </motion.div>
          </motion.button>

          {/* Product Images */}
          <div
            ref={containerRef}
            className="relative w-full aspect-[3.5/4] overflow-hidden bg-gray-50"
          >
            {displayedImages.map((img, idx) => (
              <img
                key={idx}
                src={img || assets.placeholder}
                alt={`${name} ${idx}`}
                className={`absolute inset-0 w-full h-full object-cover object-top transition duration-700 ${idx === index ? 'opacity-100 scale-105' : 'opacity-0 scale-100'}`}
              />
            ))}
          </div>

          {/* Product Info */}
          <div className="pt-2 pd-2">
            <h3 className="text-md sm:text-md font-medium line-clamp-1 leading-tight decoration-gray-400">
              {name}
            </h3>

            <div className="flex items-center gap-1 text-xs text-gray-500">
              <span className="line-clamp-1">{subCategory}</span>
            </div>

            <div className="flex items-center justify-between mt-1">
              <div>
                <p className="text-md font-semibold">{currency}   {price}</p>
              </div>
            </div>
          </div>
        </div>
      </Link>

      <style>{`
        @keyframes fade-in {
          0% { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.25s ease-out forwards;
        }
      `}</style>
    </>
  );
};

export default ProductItem;
