import React, { useEffect, useState, useRef } from "react";
import { backendUrl } from "../App.jsx";
import { FaShoppingCart, FaHeart } from "react-icons/fa";
import { AiOutlineSearch } from "react-icons/ai";
import { IoClose } from "react-icons/io5";
import Skeleton from "react-loading-skeleton";
import { motion, AnimatePresence } from "framer-motion";
import "react-loading-skeleton/dist/skeleton.css";

const ProductCard = ({ product }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const intervalRef = useRef(null);
  const images = product.image || ["https://placehold.co/300x300?text=No+Image"];

  const startSlideshow = () => {
    if (images.length <= 1) return;
    intervalRef.current = setInterval(() => {
      setCurrentImageIndex(prev => (prev + 1) % images.length);
    }, 2000);
  };

  const stopSlideshow = () => {
    clearInterval(intervalRef.current);
    setCurrentImageIndex(0);
  };

  return (
    <div 
      className="relative bg-white rounded-lg shadow-md overflow-hidden group"
      onMouseEnter={startSlideshow}
      onMouseLeave={stopSlideshow}
    >
      <div className="relative h-68 overflow-hidden">
        <img
          src={images[currentImageIndex]}
          alt={product.name}
          className="w-full h-full object-cover object-top transition-opacity duration-500"
          onError={(e) => e.target.src = "https://placehold.co/300x300?text=Image+Error"}
        />
      </div>
      <div className="p-3">
        <h4 className="font-medium text-gray-800 truncate">{product.name}</h4>
        <div className="flex justify-between items-center mt-1">
          <span className="text-sm font-semibold text-gray-900">
            ${product.price?.toFixed(2) || "N/A"}
          </span>
          <span className="text-xs text-gray-500">{product.category}</span>
        </div>
        <p className="text-xs text-gray-500">{product.subcategory}</p>
      </div>
    </div>
  );
};

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchUsers = async () => {
      if (!token) {
        setError("Not authorized. Please log in.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${backendUrl}/api/user/admin/users`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const text = await res.text();
        const data = JSON.parse(text);
        if (!res.ok || !data.success) throw new Error(data.message || `Error ${res.status}`);
        setUsers(data.users || []);
      } catch (err) {
        setError(err.message || "Failed to fetch users.");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [token]);

  useEffect(() => {
    const esc = (e) => e.key === "Escape" && setSelectedUser(null);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, []);

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderProductList = (products = []) => {
    if (!products.length) {
      return <p className="text-gray-400 italic p-4">No products</p>;
    }

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-2">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6 md:p-10">
      <div>
        <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">Customer Management</h2>
        <p className="text-gray-500 mt-1 mb-8">Manage and track your customers</p>
      </div>

      <div className="flex items-center mb-6 max-w-md">
        <AiOutlineSearch className="text-gray-500 mr-2" />
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-gray-300 p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
        />
      </div>

      {loading && <Skeleton count={5} height={100} />}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredUsers.map((user) => (
            <div
              key={user._id}
              className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition cursor-pointer p-4 flex flex-col items-center text-center"
              onClick={() => setSelectedUser(user)}
            >
              {user.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={user.name}
                  className="w-16 h-16 rounded-full object-cover mb-2"
                  onError={(e) => (e.target.style.display = "none")}
                />
              ) : (
                <div className="w-16 h-16 bg-gray-100 text-gray-700 rounded-full flex items-center justify-center font-semibold text-lg uppercase mb-2">
                  {user.name?.[0] || "U"}
                </div>
              )}

              <h4 className="font-semibold text-gray-800">{user.name}</h4>
              <p className="text-sm text-gray-500 mb-2">{user.email}</p>

              <div className="text-xs text-gray-600 flex justify-center gap-4">
                <span className="flex items-center gap-1">
                  <FaShoppingCart className="text-gray-500" />
                  {user.cart?.length || 0}
                </span>
                <span className="flex items-center gap-1">
                  <FaHeart className="text-gray-500" />
                  {user.wishlist?.length || 0}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* User Details Modal */}
      <AnimatePresence>
        {selectedUser && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => setSelectedUser(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative bg-white shadow-xl w-11/12 md:w-5/6 lg:w-4/5 max-h-[90vh] overflow-y-auto p-6 border border-gray-200"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedUser(null)}
                className="absolute top-3 right-3 text-gray-600 hover:text-gray-800 text-xl"
              >
                <IoClose />
              </button>

              <div className="flex flex-col md:flex-row items-start mb-6 gap-4">
                <img
                  src={selectedUser.profilePicture || "https://placehold.co/100x100"}
                  alt={selectedUser.name}
                  className="rounded-full w-20 h-20 object-cover"
                  onError={(e) => (e.target.style.display = "none")}
                />
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{selectedUser.name}</h2>
                  <p className="text-gray-600">{selectedUser.email}</p>
                  <div className="flex items-center mt-2 gap-4">
                    <span className={`px-2 py-1 text-xs font-semibold ${selectedUser.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"} rounded-full`}>
                      {selectedUser.isActive ? "Active" : "Inactive"}
                    </span>
                    <p className="text-sm text-gray-500">
                      Last login: {new Date(selectedUser.lastLogin || Date.now()).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex items-center mb-3">
                    <FaShoppingCart className="mr-2 text-gray-700" />
                    <h3 className="text-lg font-semibold text-gray-800">Cart ({selectedUser.cart?.length || 0})</h3>
                  </div>
                  {renderProductList(selectedUser.cart)}
                </div>

                <div>
                  <div className="flex items-center mb-3">
                    <FaHeart className="mr-2 text-gray-700" />
                    <h3 className="text-lg font-semibold text-gray-800">Wishlist ({selectedUser.wishlist?.length || 0})</h3>
                  </div>
                  {renderProductList(selectedUser.wishlist)}
                </div>
              </div>

              <div className="mt-6 text-right">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="bg-black hover:bg-gray-900 text-white px-4 py-2 transition border border-gray-200 rounded"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserManagement;
