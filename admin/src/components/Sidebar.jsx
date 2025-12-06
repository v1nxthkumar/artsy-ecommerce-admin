import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { assets } from '../assets/assets';
import {
  Home,
  PlusSquare,
  List,
  ShoppingCart,
  Menu,
  ChevronRight,
  User,
  Settings,
  LogOut,
  Bell,
  HelpCircle,
  PieChart
} from 'lucide-react';

const Sidebar = ({ setToken }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) setIsOpen(false);
    };

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const navItems = [
    { to: '/', icon: <Home size={20} />, label: 'Dashboard' },
    { to: '/analytics', icon: <PieChart size={20} />, label: 'Analytics' },
    { to: '/add', icon: <PlusSquare size={20} />, label: 'Create New' },
    { to: '/list', icon: <List size={20} />, label: 'Inventory' },
    { to: '/orders', icon: <ShoppingCart size={20} />, label: 'Orders' },
    { to: '/customers', icon: <User size={20} />, label: 'Customers' },
  ];

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
    if (isMobile) document.body.style.overflow = isOpen ? 'auto' : 'hidden';
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/70 z-30 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 h-screen z-30 bg-white
          border-r border-gray-300 flex flex-col overflow-y-auto
          ${isScrolled ? 'shadow-2xl' : 'shadow-lg'}
          transition-none
          ${isOpen ? 'w-64' : 'w-20'}
        `}
        style={{
          height: isMobile ? '100dvh' : '100vh',
          scrollbarWidth: 'none'
        }}
      >
        {/* Sidebar Header */}
        <div className={`sticky top-0 z-10 px-4 py-5 bg-white ${isOpen ? 'border-b border-gray-300' : ''}`}>
          <div className="flex justify-between items-center">
            {isOpen && (
              <div className="flex items-center gap-3">
                <img className='w-10' src={assets.logo} alt="logo" />
                <span className="text-xl font-bold text-black">
                  Artsy
                </span>
              </div>
            )}
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-black"
              aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              {isOpen ? <ChevronRight size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 pt-2 px-2 pb-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.to);
            const showNotification = item.notification && (isOpen || isActive);

            return (
              <div
                key={item.label}
                onMouseEnter={() => !isOpen && setHoveredItem(item.label)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <NavLink
                  to={item.to}
                  className={({ isActive }) => `
                    group flex items-center gap-3 px-3 py-3 rounded-xl mb-1 transition-all
                    ${isActive ? 'bg-gray-200 text-black' : 'text-gray-600 hover:bg-gray-100 hover:text-black'}
                  `}
                >
                  <div className={`relative flex items-center justify-center w-8 h-8 rounded-lg ${isActive ? 'bg-gray-300 text-black' :
                    'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                    }`}>
                    {React.cloneElement(item.icon, {
                      size: 18,
                      className: `transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110'}`
                    })}
                  </div>

                  {isOpen && (
                    <div className="flex items-center flex-1 min-w-0">
                      <span className={`text-sm font-medium truncate ${isActive ? 'text-black' : 'group-hover:text-black'}`}>
                        {item.label}
                      </span>
                      {showNotification && (
                        <span className="ml-auto px-2 py-0.5 text-xs font-medium rounded-full bg-indigo-600 text-white">
                          {item.notification}
                        </span>
                      )}
                    </div>
                  )}
                </NavLink>
              </div>
            );
          })}
        </nav>

        {/* User Profile & Footer */}
        <div className="sticky bottom-0 pt-4 px-3 pb-6 bg-white">
          <div className="border-t border-gray-300 pt-4">
            <button
              onClick={() => setToken('')}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm
                group bg-gray-200 hover:bg-gray-300 text-black 
              `}
            >
              <div className="p-1.5 rounded-lg bg-gray-300 group-hover:bg-rose-500/20">
                <LogOut size={18} className="text-black group-hover:text-rose-300" />
              </div>
              {isOpen && (
                <span className="text-sm">Sign Out</span>
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
