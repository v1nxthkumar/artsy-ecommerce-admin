import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext.jsx';
import { assets } from '../assets/assets.js';
import CartTotal from '../components/CartTotal.jsx';
import { Link } from 'react-router-dom';
import Title from '../components/Title.jsx';
import Spinner from '../components/Spinner.jsx';
import EmptyCart from '../components/EmptyCart.jsx'; // Import the EmptyCart component
import { Trash2 } from 'lucide-react';

const Cart = () => {
  const { products, currency, cartItems, updateQuantity, removeFromCart, navigate, isAuthenticated } = useContext(ShopContext);
  const [cartData, setCartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (products.length > 0) {
      const tempData = [];
      for (const productId in cartItems) {
        for (const size in cartItems[productId]) {
          if (cartItems[productId][size] > 0) {
            tempData.push({
              _id: productId,
              size,
              quantity: cartItems[productId][size],
            });
          }
        }
      }
      setCartData(tempData);
    }
  }, [cartItems, products]);

  useEffect(() => {
    const handleLoad = () => setLoading(false);
    if (document.readyState === 'complete') {
      handleLoad();
    } else {
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
      <div className="text-center">
        <Title
          lead="Exclusively Chosen"
          headline="Your Cart"
          subline="Ready to Elevate Your Wardrobe"
        />
      </div>

      {cartData.length === 0 ? (
        <EmptyCart /> // Use the EmptyCart component here
      ) : (
        <div className="flex flex-col xl:flex-row gap-8">
          {/* Cart Items */}
          <div className="xl:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-6">
            {cartData.map((item, index) => {
              const product = products.find((p) => p._id === item._id);
              if (!product) return null;

              return (
                <div
                  key={index}
                  className="group relative bg-white border mb-4 border-gray-200 hover:shadow-md transition-transform transform hover:-translate-y-1"
                >
                  <div className="flex flex-col sm:flex-row p-5 gap-6">
                    {/* Product Image */}
                    <div className="relative w-full sm:w-40 h-40 sm:h-48 overflow-hidden">
                      <img
                        src={product.image?.[0] || assets.placeholder}
                        alt={product.name}
                        className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-grow flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-md font-medium uppercase text-gray-900 mb-1">
                            {product.name}
                          </h3>

                          {product.isBestSeller && (
                            <span className="text-[10px] font-semibold uppercase border px-2 py-[2px] text-gray-300">
                              Best Seller
                            </span>
                          )}

                          <div className="flex items-center gap-4 mt-3">
                            <div>
                              <p className="text-lg font-semibold text-gray-900">
                                {currency}{(product.price * item.quantity).toFixed(2)}
                              </p>
                              <p className="text-xs line-through text-gray-400">
                                {currency}{(product.price * 2 * item.quantity).toFixed(2)}
                              </p>
                            </div>
                            <span className="text-xs px-3 py-1 bg-gray-100 text-gray-600">
                              Size: {item.size}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Quantity Controls & Delete */}
                      <div className="mt-5 border-t border-gray-100 pt-4 flex items-center justify-between">
                        {/* Quantity Controls */}
                        <div className="flex items-center border bg-white">
                          <button
                            onClick={() => updateQuantity(item._id, item.size, Math.max(1, item.quantity - 1))}
                            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700"
                          >
                            −
                          </button>
                          <input
                            type="text"
                            value={item.quantity}
                            onChange={(e) =>
                              e.target.value === '' || e.target.value === '0'
                                ? null
                                : updateQuantity(item._id, item.size, Number(e.target.value))
                            }
                            className="w-12 text-center border-x text-gray-700"
                          />
                          <button
                            onClick={() => updateQuantity(item._id, item.size, item.quantity + 1)}
                            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700"
                          >
                            +
                          </button>
                        </div>

                        {/* Delete Button with new icon */}
                        <button
                          onClick={() => removeFromCart(item._id, item.size)}
                          className="text-gray-500 hover:text-red-500 transition ml-4"
                          title="Remove Item"
                        >
                          {/* Trash Icon */}
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary Sidebar */}
          <div className="xl:w-1/3">
            <div className="sticky top-6">
              <div className="bg-white border border-gray-200 p-8 shadow-sm">
                <CartTotal />
                <div className="mt-7 pt-5">
                  <button
                    onClick={() => {
                      if (isAuthenticated) {
                        navigate('/place-order');
                      } else {
                        navigate('/login');
                      }
                    }}
                    className="w-full bg-black hover:bg-gray-800 text-white py-3 uppercase tracking-wide text-sm font-medium transition-transform hover:scale-[1.01]"
                  >
                    Checkout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
