import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext.jsx';
import Title from '../components/Title.jsx';
import EmptyWishlist from '../components/EmptyWishlist.jsx';
import ProductItem from '../components/ProductItem.jsx'; // ✅ Make sure path is correct
import Spinner from '../components/Spinner.jsx';
import { motion } from 'framer-motion';

const Wishlist = () => {
  const {
    products,
    currency,
    wishlistItems,
    getUserWishlist,
    token,
  } = useContext(ShopContext);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (token && wishlistItems.length === 0) {
      getUserWishlist(token);
    }
  }, [token, wishlistItems.length]);

  const wishlistData = useMemo(() => {
    if (!Array.isArray(wishlistItems) || products.length === 0) return [];

    return wishlistItems
      .map((item) => {
        if (typeof item === 'string') return products.find((p) => p._id === item);
        if (item?.productId) return products.find((p) => p._id === item.productId);
        if (item?._id) return item;
        return null;
      })
      .filter(Boolean)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [wishlistItems, products]);

  useEffect(() => {
    const handleLoad = () => setLoading(false);

    if (document.readyState === 'complete') {
      // If already loaded
      handleLoad();
    } else {
      // Wait for the page to fully load
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 from-gray-50">
      <div className="text-2xl font-semibold">
        <Title
          lead="Handpicked with Intention"
          headline="Your Wishlist"
          subline="A Glimpse of What Could Be"
        />
      </div>

      {wishlistData.length === 0 ? (
        <EmptyWishlist />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {wishlistData.map((item) => (
            <ProductItem
              key={item._id}
              id={item._id}
              image={item.image}
              name={item.name}
              price={item.price}
              rating={item.rating}
              isBestSeller={item.bestseller}
              category={item.category}
              subCategory={item.subCategory}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
