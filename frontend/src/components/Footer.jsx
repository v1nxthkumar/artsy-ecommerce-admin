import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import {
  FaInstagram,
  FaPinterestP,
  FaTiktok,
  FaBox,
} from 'react-icons/fa';
import { SiRazorpay, SiStripe } from 'react-icons/si';
import { FiArrowUpRight } from 'react-icons/fi';
import { ShopContext } from '../context/ShopContext';
import { useNavigate } from 'react-router-dom';
import { assets } from '../assets/assets';

const Footer = () => {
  const { products } = useContext(ShopContext);
  const navigate = useNavigate();

  // Get top 4 best sellers
  const bestSellers = products
    .filter(item => item.bestseller)
    .slice(0, 4);

  // Get latest 4 products (assuming products are ordered by date)
  const latestProducts = products.slice(0, 4);

  const stores = [
    { city: 'INDIA', address: '22 MG Road' },
    { city: 'NYC', address: '54 Bond St' },
    { city: 'ROME', address: '5 Via Veneto' },
    { city: 'LONDON', address: '7 Kingly St' },
    { city: 'PARIS', address: '8 Rue du Mail' },
    { city: 'TOKYO', address: '2-11 Jingumae' },
  ];

  const payments = [
    { icon: <SiStripe size={24} />, name: 'Stripe' },
    { icon: <SiRazorpay size={20} />, name: 'Razorpay' },
    { icon: <FaBox size={24} />, name: 'COD' },
  ];

  const socials = [
    { icon: <FaInstagram size={25} />, name: 'Instagram' },
    { icon: <FaTiktok size={23} />, name: 'TikTok' },
    { icon: <FaPinterestP size={25} />, name: 'Pinterest' },
  ];

  const footerLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' }
  ];

  const quickLinks = [
    {
      path: '/cart',
      icon: <img src={assets.cart_icon} alt="Cart" className="h-6 w-6 brightness-0 invert" />
    },
    {
      path: '/wishlist',
      icon: <img src={assets.wishlist_icon} alt="Wishlist" className="h-6 w-6 brightness-0 invert" />
    },
    {
      path: '/collection',
      icon: <img src={assets.collection_icon} alt="Collection" className="h-6 w-6 brightness-0 invert" />
    }
  ];

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handleAuthClick = (link) => {
    if (link.handler) {
      link.handler();
    } else {
      navigate(link.path);
    }
  };

  return (
    <footer className="relative bg-[#050505] text-[#f0f0f0] overflow-hidden mt-10 border-t border-gold-400/20 w-full py-10">
      {/* Background floating sparkles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(60)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, Math.random() * 40 - 20],
              x: [0, Math.random() * 20 - 10],
              rotate: [0, 180]
            }}
            transition={{
              duration: Math.random() * 10 + 5,
              repeat: Infinity,
              repeatType: 'reverse'
            }}
            className="absolute text-gold-400"
            style={{
              fontSize: `${Math.random() * 12 + 6}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.3 + 0.2
            }}
          >
            {['✦', '✧', '◆', '♠'][Math.floor(Math.random() * 4)]}
          </motion.div>
        ))}
      </div>

      <div className="relative mx-auto  px-6 z-10">
        {/* Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Best Sellers Section */}
          <section className="border-gold-400/20 pt-5">
            <h3 className="text-2xl tracking-wider text-gold-400 mb-6 kaushan-script-regular text-center">Luxury & Classic</h3>
            <ul className="space-y-6">
              {bestSellers.map((product, i) => (
                <motion.li
                  key={i}
                  whileHover={{ x: 10 }}
                  onClick={() => handleProductClick(product._id)}
                  className="cursor-pointer"
                >
                  <div className="flex justify-between group text-[#ccc] hover:text-gold-400 transition-colors">
                    <div>
                      <p className="text-md font-medium group-hover:italic">
                        {product.name}
                        {product.new && (
                          <span className="ml-2 text-xs bg-gold-400 text-black px-2 py-0.5 rounded">
                            NEW
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-[#666] mt-1 italic">
                        {product.subCategory}
                      </p>
                    </div>
                    <FiArrowUpRight className="text-[#666] group-hover:text-gold-400 mt-1" />
                  </div>
                </motion.li>
              ))}
            </ul>
          </section>

          {/* Latest Collection Section */}
          <section className="border-gold-400/20 pt-5">
            <h3 className="text-2xl tracking-wider text-gold-400 mb-6 kaushan-script-regular text-center">Fresh & Exclusive</h3>
            <ul className="space-y-5">
              {latestProducts.map((product, i) => (
                <motion.li
                  key={i}
                  whileHover={{ x: 10 }}
                  onClick={() => handleProductClick(product._id)}
                  className="cursor-pointer"
                >
                  <div className="flex justify-between group text-[#ccc] hover:text-gold-400 transition-colors">
                    <div>
                      <p className="text-md font-medium group-hover:italic">
                        {product.name}
                        {product.new && (
                          <span className="ml-2 text-xs bg-gold-400 text-black px-2 py-0.5 rounded">
                            NEW
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-[#666] mt-1 italic">
                        {product.subCategory}
                      </p>
                    </div>
                    <FiArrowUpRight className="text-[#666] group-hover:text-gold-400 mt-1" />
                  </div>
                </motion.li>
              ))}
            </ul>
          </section>

          {/* Store Locations */}
          <section className="border-gold-400/20 pt-5">
            <h3 className="text-2xl tracking-wider text-gold-400 mb-6 kaushan-script-regular text-center">Craft & Couture</h3>
            <div className="grid grid-cols-2 gap-4">
              {stores.map((store, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -5 }}
                  className="p-4 hover:border-gold-400/50 transition-colors flex justify-between items-center"
                >
                  <div>
                    <p className="text-sm text-gold-400 font-medium">{store.city}</p>
                    <p className="text-xs text-[#666] mt-1">{store.address}</p>
                  </div>
                  <FiArrowUpRight className="text-[#666] hover:text-gold-400" />
                </motion.div>
              ))}
            </div>
          </section>

          {/* Payments, Social & Quick Links */}
          <section className="border-gold-400/20 pt-5 space-y-10 p-10">
            <div>
              <h3 className="text-2xl tracking-wider text-gold-400 mb-6 kaushan-script-regular text-center">Luxe & Legacy</h3>
              <div className="flex flex-wrap gap-4 justify-between">
                {payments.map((pay, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ y: -5, color: '#D4AF37' }}
                    className="py-4 hover:border-gold-400/50"
                    aria-label={pay.name}
                  >
                    {pay.icon}
                  </motion.div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex flex-wrap gap-3 justify-between">
                {socials.map((s, i) => (
                  <motion.a
                    key={i}
                    href="#"
                    whileHover={{ y: -5, color: '#D4AF37' }}
                    whileTap={{ scale: 0.9 }}
                    className="py-4 hover:border-gold-400/50"
                    aria-label={s.name}
                  >
                    {s.icon}
                  </motion.a>
                ))}
              </div>
            </div>

            <div>
              <div className="flex flex-wrap gap-3 justify-between">
                {quickLinks.map((link, i) => (
                  <motion.a
                    key={i}
                    href={link.path}
                    whileHover={{ y: -5, color: '#D4AF37' }}
                    className="py-4 hover:border-gold-400/50"
                  >
                    {link.icon}
                  </motion.a>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* Footer Bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center border-t-1 border-gold-400/20 mt-10 pt-6 text-xs text-[#666] uppercase tracking-widest">
          <div className="flex gap-6 mb-4 md:mb-0">
            {footerLinks.map((link, i) => (
              <motion.a
                key={i}
                href={link.path}
                whileHover={{ color: '#D4AF37' }}
                className="transition-colors"
              >
                {link.name}
              </motion.a>
            ))}
          </div>
          <p>© {new Date().getFullYear()} Art'sy. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
