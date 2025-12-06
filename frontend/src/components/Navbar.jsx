import React, { useContext, useRef, useEffect } from 'react';
import { assets } from '../assets/assets.js';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext.jsx';

const Navbar = () => {
  const {
    setSearch,
    search,
    getCartCount,
    token,
    setToken,
    setCartItems,
    wishlistItems,
  } = useContext(ShopContext);

  const inputRef = useRef();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (search.trim() !== '' && location.pathname !== '/collection') {
      navigate('/collection');
    }
  }, [search, location.pathname, navigate]);

  const logout = () => {
    navigate('/login');
    localStorage.removeItem('token');
    setToken('');
    setCartItems({});
  };

  return (
    <header className="w-full px-4 md:px-8 py-4 font-medium bg-white relative">
      <nav className="flex items-center justify-between w-full gap-4 flex-nowrap">
        {/* Logo */}
        <Link
          to="/"
          className="flex-shrink-0 group transition-transform duration-300 ease-in-out hover:scale-105 hover:-rotate-5"
        >
          <img
            src={assets.logo}
            alt="Logo"
            className="h-10 md:h-12 lg:h-14 object-contain transition-all duration-500 group-hover:drop-shadow-xl group-hover:contrast-125 group-hover:rotate-1"
          />
        </Link>

        {/* Search Bar */}
        <div className="md:w-auto flex-1 flex justify-center min-w-0 px-2 sm:px-4">
          <div className="flex items-center w-full max-w-[1100px] bg-white border border-gray-200 rounded-full shadow-sm px-4 py-2 sm:px-6 sm:py-2 md:py-3">
            <img
              src={assets.search_icon}
              alt="Search Icon"
              className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-4"
            />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="flex-1 min-w-0 bg-transparent text-sm sm:text-base text-gray-800 placeholder-gray-400 focus:outline-none"
              aria-label="Search"
            />
          </div>
        </div>

        {/* Icons */}
        <div className="flex items-center gap-4 sm:gap-5 md:gap-6 flex-shrink-0">
          {/* Collection */}
          <Link to="/collection" className="relative group transition-transform duration-300 hover:scale-110">
            <img
              src={assets.collection_icon}
              className="w-5 sm:w-6 transition-all duration-300 group-hover:drop-shadow-md group-hover:brightness-110"
              alt="Collection Icon"
            />
          </Link>

          {/* Profile */}
          <div className="relative group transition-transform duration-300 hover:scale-110">
            <img
              onClick={() => {
                if (token) {
                  navigate('/profile');
                } else {
                  navigate('/login');
                }
              }}
              src={assets.profile_icon}
              className="w-5 sm:w-6 cursor-pointer transition-all duration-300 group-hover:drop-shadow-md group-hover:brightness-110"
              alt="Profile Icon"
            />
          </div>

          {/* Wishlist */}
          <Link to="/wishlist" className="relative group transition-transform duration-300 hover:scale-110">
            <img
              src={assets.wishlist_icon}
              className="w-5 sm:w-6 cursor-pointer transition-all duration-300 group-hover:drop-shadow-md group-hover:brightness-110"
              alt="Wishlist Icon"
            />
            {wishlistItems?.length > 0 && (
              <span className="absolute right-[-5px] bottom-[-5px] w-4 text-center leading-4 bg-black text-white aspect-square rounded-full text-[8px]">
                {wishlistItems.length}
              </span>
            )}
          </Link>

          {/* Cart */}
          <Link to="/cart" className="relative group transition-transform duration-300 hover:scale-110">
            <img
              src={assets.cart_icon}
              className="w-5 sm:w-6 cursor-pointer transition-all duration-300 group-hover:drop-shadow-md group-hover:brightness-110"
              alt="Cart Icon"
            />
            <span className="absolute right-[-5px] bottom-[-5px] w-4 text-center leading-4 bg-black text-white aspect-square rounded-full text-[8px]">
              {getCartCount()}
            </span>
          </Link>
        </div>

      </nav>
    </header>
  );
};

export default Navbar;
