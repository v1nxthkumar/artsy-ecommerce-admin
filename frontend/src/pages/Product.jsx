import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext.jsx';
import RelatedProducts from '../components/RelatedProducts.jsx';
import BestSeller from '../components/BestSeller.jsx';
import LatestCollection from '../components/LatestCollection.jsx';
import { assets } from '../assets/assets.js';
import { motion } from 'framer-motion';
import {
  FaTruck,
  FaUndo,
  FaShieldAlt,
  FaPhoneAlt,
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import SpecialForYou from '../components/SpecialForYou.jsx';
import NewsLetterBox from '../components/NewsLetterBox.jsx';

const Product = () => {
  const { productId } = useParams();
  const {
    products,
    currency,
    addToCart,
    wishlistItems,
    wishlistLoaded,
    addToWishlist,
    removeFromWishlist,
    isAuthenticated,
  } = useContext(ShopContext);

  const [productData, setProductData] = useState(null);
  const [image, setImage] = useState('');
  const [size, setSize] = useState('');
  const [addedToCart, setAddedToCart] = useState(false);
  const navigate = useNavigate();
  const orderedSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  useEffect(() => {
    const item = products.find((item) => item._id === productId);
    if (item) {
      setProductData(item);
      setImage(item.image?.[0] || '');
    }
  }, [productId, products]);

  const handleAddToCart = () => {
    if (!size) return;

    if (!isAuthenticated) {
      navigate('/login'); // ✅ redirect to login
      return;
    }

    addToCart(productData._id, size);
    setAddedToCart(true);

    toast.success(`${productData.name} added to cart!`, {
      position: 'top-center',
      style: {
        background: '#000',
        color: '#fff',
        fontSize: '14px',
      },
    });
  };

  const isWishlisted = wishlistItems.some(item =>
    typeof item === 'string'
      ? item === productId
      : item?._id === productId || item?.productId === productId
  );

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    isWishlisted ? removeFromWishlist(productId) : addToWishlist(productId);
  };

  useEffect(() => {
    setAddedToCart(false);
  }, [productId, size]);

  if (!productData) return <div className="opacity-0">Loading...</div>;

  const { name, category, subCategory, collection, reviews } = productData;

  return (
    <>
      <div className="bg-white px-4 sm:px-6 lg:px-8 min-h-screen">
        {/* Breadcrumbs */}
        <div className="text-sm text-gray-500 mb-6">
          <span className="ml-1 capitalize">{collection}</span>
          <span className="ml-1 capitalize">{category}</span> /
          <span className="ml-1 capitalize">{subCategory}</span> /
          <span className="text-gray-700 ml-1">{name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Left: Product Images */}
          <div className="flex flex-col-reverse sm:flex-row gap-4">
            {/* Side thumbnails */}
            <div className="flex sm:flex-col gap-2 sm:w-[18%] sm:max-h-[calc(100vh-100px)] overflow-x-auto sm:overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
              {productData.image.map((item, index) => (
                <img
                  key={index}
                  src={item}
                  alt={`Thumbnail ${index}`}
                  onClick={() => setImage(item)}
                  className={`cursor-pointer object-cover transition-transform duration-300 hover:scale-105 ${image === item ? "" : ""
                    } w-20 h-20 sm:w-full sm:h-auto`}
                />
              ))}
            </div>

            {/* Main image */}
            <div className="flex-1 bg-gray-100 flex items-center justify-center h-[calc(100vh-100px)] overflow-hidden">
              <motion.img
                src={image}
                alt="Main Product"
                className="w-full h-full object-cover object-top transition-all duration-300"
                whileHover={{ scale: 1.05 }}
              />
            </div>
          </div>

          {/* Right: Details */}
          <div className="flex flex-col gap-6 lg:sticky top-20">
            <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
              {productData.name}
              {productData.bestseller && (
                <span className="text-[10px] font-semibold uppercase px-4 py-2 bg-gradient-to-r from-gray-900 to-gray-700 text-white rounded-full">
                  Bestseller
                </span>
              )}
            </h1>

            <p className="text-gray-700 leading-relaxed text-lg">
              {productData.description}
            </p>

            <p className="text-3xl font-semibold text-gray-900">
              {currency}{productData.price}
            </p>

            {/* Size Selector */}
            <div className="w-full">
              <p className="text-sm font-medium mb-2 text-gray-800">Select Size</p>

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 w-full">
                {orderedSizes.map((sizeLabel) => {
                  const isAvailable = productData.sizes.includes(sizeLabel);
                  return (
                    <div key={sizeLabel} className="flex flex-col items-center w-full">
                      <button
                        disabled={!isAvailable}
                        onClick={() => isAvailable && setSize(sizeLabel)}
                        className={`w-full py-3 text-sm font-medium border transition-all ${sizeLabel === size
                          ? 'bg-black text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-100'
                          } ${!isAvailable ? 'cursor-not-allowed opacity-50' : ''}`}
                      >
                        {sizeLabel}
                      </button>
                      {!isAvailable && (
                        <span className="text-xs text-red-500 mt-1">Out of Stock</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Cart + Wishlist */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    navigate('/login'); // ✅ redirect if not logged in
                    return;
                  }

                  if (addedToCart) {
                    navigate('/cart');
                  } else {
                    handleAddToCart();
                  }
                }}
                disabled={!size}
                className={`w-full py-4 text-sm font-semibold transition-all ${size
                  ? addedToCart
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-black text-white hover:bg-gray-900'
                  : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                  }`}>

                {addedToCart ? 'GO TO CART' : size ? 'ADD TO CART' : 'SELECT SIZE'}
              </button>

              <button
                onClick={(e) => {
                  if (!isAuthenticated) {
                    navigate('/login');
                    return;
                  }
                  handleWishlistToggle(e);
                }}
                className={`w-full py-4 text-sm font-semibold border transition-all duration-200 ${isWishlisted
                    ? 'bg-red-500 text-white hover:bg-red-600 border-transparent'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border-gray-300'
                  }`}
              >
                {isWishlisted ? 'WISHLISTED' : 'ADD TO WISHLIST'}
              </button>
            </div>

            {/* Enhanced Policy Section - Clean, Compact Fit */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-3">
              {[
                {
                  icon: assets.exchange_icon,
                  title: "Instant Refunds",
                  description: "Refunds processed quickly—simple, smooth, and no delays.",
                  duration: "7 Days",
                },
                {
                  icon: assets.quality_icon,
                  title: "Secure Payments",
                  description: "Protected checkout with trusted gateways and encrypted data.",
                  duration: "Instant",
                },
                {
                  icon: assets.support_img,
                  title: "One Tap Away",
                  description: "24/7 access to real humans—quick answers, anytime you ask.",
                  duration: "24/7",
                },
              ].map((policy, index) => (
                <motion.div
                  key={index}
                  whileHover={{ y: -4 }}
                  transition={{ type: "tween", ease: "easeOut" }}
                  className="relative bg-white p-6 border border-gray-200"
                >
                  <div className="relative w-12 h-12 mb-4 mx-auto">
                    <div className="absolute inset-0 border border-gray-200 rounded-sm transform rotate-45"></div>
                    <div className="absolute inset-2 flex items-center justify-center">
                      <img
                        src={policy.icon}
                        alt={policy.title}
                        className="w-6 h-6 object-contain grayscale opacity-90"
                      />
                    </div>
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 text-center mb-2">
                    {policy.title}
                  </h3>
                  <p className="text-sm text-gray-600 text-center mb-3 leading-relaxed">
                    {policy.description}
                  </p>
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-px bg-gray-900 origin-left"
                    initial={{ scaleX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.4 }}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div >

      {/* Related Products, Bestsellers, Collections */}
      < RelatedProducts category={productData.category} />
      <BestSeller />
      <LatestCollection />
      <SpecialForYou />
      <NewsLetterBox />
    </>
  );
};

export default Product;
