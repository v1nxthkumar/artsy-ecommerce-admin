import React, { useEffect, useState, useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaUser,
  FaShoppingCart,
  FaTimesCircle,
  FaUndoAlt,
  FaCreditCard,
  FaBoxOpen,
  FaHeart,
  FaSignOutAlt,
  FaTrash,
  FaPlus,
  FaEdit,
  FaCheck,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import Title from "../components/Title";

const MyProfile = () => {
  const { token, setToken, backendUrl } = useContext(ShopContext);
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [profile, setProfile] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    userInfo: true,
    editInfo: false,
    password: false,
    addresses: true,
    stats: true,
    cart: false,
    wishlist: false,
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    newAddress: {
      firstName: "",
      lastName: "",
      email: "",
      street: "",
      city: "",
      state: "",
      zipcode: "",
      country: "",
      phone: "",
    },
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const fetchData = async () => {
    try {
      const [statsRes, profileRes, addressesRes] = await Promise.all([
        axios.get(`${backendUrl}/api/user/stats`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${backendUrl}/api/user/me`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${backendUrl}/api/user/address`, { headers: { Authorization: `Bearer ${token}` } }).catch(err => ({
          data: { success: false, addresses: [] }
        })),
      ]);

      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (profileRes.data.success) {
        setProfile(profileRes.data.profile);
        setFormData(prev => ({
          ...prev,
          name: profileRes.data.profile.name,
          email: profileRes.data.profile.email,
        }));
      }
      if (addressesRes.data.success) setAddresses(addressesRes.data.addresses);
    } catch (error) {
      toast.error("Error fetching user data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setToken("");
    localStorage.removeItem("token");
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const handleUpdate = async (field) => {
    try {
      let res;
      const { name, email, currentPassword, newPassword, confirmPassword } = formData;

      if (field === "name") {
        res = await axios.put(`${backendUrl}/api/user/update-name`, { name }, { headers: { Authorization: `Bearer ${token}` } });
      } else if (field === "email") {
        res = await axios.put(`${backendUrl}/api/user/update-email`, { email }, { headers: { Authorization: `Bearer ${token}` } });
      } else if (field === "password") {
        if (newPassword !== confirmPassword) return toast.error("Passwords do not match");
        res = await axios.put(`${backendUrl}/api/user/update-password`, { currentPassword, newPassword }, { headers: { Authorization: `Bearer ${token}` } });
      }

      if (res.data.success) {
        toast.success(`${field.charAt(0).toUpperCase() + field.slice(1)} updated`);
        fetchData();
      } else toast.error(res.data.message);
    } catch {
      toast.error(`Error updating ${field}`);
    }
  };

  const handleAddAddress = async () => {
    try {
      const res = await axios.post(`${backendUrl}/api/user/address`, formData.newAddress, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) {
        toast.success("Address added");
        setFormData(prev => ({ ...prev, newAddress: Object.fromEntries(Object.keys(prev.newAddress).map(k => [k, ""])) }));
        fetchData();
      } else toast.error(res.data.message);
    } catch {
      toast.error("Error adding address");
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      const res = await axios.delete(`${backendUrl}/api/user/address/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) fetchData();
      else toast.error(res.data.message);
    } catch {
      toast.error("Error deleting address");
    }
  };

  const setDefaultAddress = async (id) => {
    try {
      const res = await axios.put(`${backendUrl}/api/user/address/default/${id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) fetchData();
      else toast.error(res.data.message);
    } catch {
      toast.error("Error setting default address");
    }
  };

  useEffect(() => {
    if (!token) navigate("/login");
    else fetchData();
  }, [token]);

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
    </div>
  );

  if (!stats || !profile) return (
    <div className="text-center mt-10 p-4 rounded-lg bg-gray-50 shadow-md">
      <p className="text-lg text-gray-700">User data not available. Please try again.</p>
      <button
        onClick={fetchData}
        className="mt-2 px-4 py-2 border border-gray-900 rounded hover:bg-gray-100"
      >
        Reload
      </button>
    </div>
  );

  const { totalOrders, paidOrders, cancelledOrders, refundedOrders } = stats;
  const { name, email, cart, wishlist } = profile;
  const firstInitial = name ? name.charAt(0).toUpperCase() : '';

  return (
    <div className="px-4 sm:px-6 lg:px-8 min-h-screen bg-gray-50">

      {/* Profile Header */}
      <div className="border-b border-gray-200 pb-6 mb-8 px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

          <div className="flex flex-row items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-4xl font-bold text-gray-800 shadow-md">
              {firstInitial}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
              <p className="text-gray-600 text-sm break-all">{email}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/orders">
              <button className="px-4 py-2 border border-gray-900 hover:bg-gray-100 rounded shadow-sm text-sm sm:text-base">Orders</button>
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 border border-gray-900 hover:bg-gray-100 rounded flex items-center justify-center shadow-sm text-sm sm:text-base"
            >
              <FaSignOutAlt className="mr-2" /> Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column */}
        <div className="space-y-6 lg:col-span-2">

          {/* Personal Info Card */}
          <Card title="Personal Information" icon={<FaUser />} isOpen={expandedSections.userInfo} toggle={() => toggleSection('userInfo')}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <InfoRow label="Name" value={name} onEdit={() => toggleSection('editInfo')} />
              <InfoRow label="Email" value={email} onEdit={() => toggleSection('editInfo')} />
            </div>
          </Card>

          {/* Edit Info */}
          {expandedSections.editInfo && (
            <Card title="Edit Information" isOpen={expandedSections.editInfo} toggle={() => toggleSection('editInfo')}>
              <div className="space-y-4">
                {['name', 'email'].map(field => (
                  <div key={field}>
                    <label className="block text-sm font-medium mb-1 capitalize">{field}</label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type={field === 'email' ? 'email' : 'text'}
                        className="border border-gray-300 p-2 flex-1 rounded"
                        value={formData[field]}
                        onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                      />
                      <button onClick={() => handleUpdate(field)} className="p-2 border border-gray-300 hover:bg-gray-100 rounded">
                        <FaCheck />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Change Password */}
          <Card title="Change Password" isOpen={expandedSections.password} toggle={() => toggleSection('password')}>
            <div className="space-y-4">
              {['currentPassword', 'newPassword', 'confirmPassword'].map(field => (
                <div key={field}>
                  <label className="block text-sm font-medium mb-1 capitalize">{field.replace(/([A-Z])/g, ' $1')}</label>
                  <input
                    type="password"
                    className="w-full border border-gray-300 p-2 rounded"
                    value={formData[field]}
                    onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                  />
                </div>
              ))}
              <button onClick={() => handleUpdate("password")} className="px-4 py-2 border border-gray-900 hover:bg-gray-100 rounded">Update Password</button>
            </div>
          </Card>

          {/* Addresses */}
          <Card title="My Addresses" icon={<FaCreditCard />} isOpen={expandedSections.addresses} toggle={() => toggleSection('addresses')}>
            <div className="space-y-6">
              {/* Saved Addresses */}
              <div>
                <h3 className="text-base font-semibold mb-3">Saved Addresses</h3>
                {addresses.length === 0 ? <p className="text-gray-500">No addresses saved yet.</p> :
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {addresses.map(addr => (
                      <div key={addr._id} className="border border-gray-200 p-4 rounded shadow-sm relative">
                        {addr.isDefault && <span className="absolute top-2 right-2 bg-gray-100 text-xs font-medium px-2 py-0.5 rounded">Default</span>}
                        <h4 className="font-semibold">{addr.firstName} {addr.lastName}</h4>
                        <p className="text-gray-600">{addr.street}</p>
                        <p className="text-gray-600">{addr.city}, {addr.state} {addr.zipcode}</p>
                        <p className="text-gray-600">{addr.country}</p>
                        <p className="text-gray-600">Phone: {addr.phone}</p>
                        <div className="flex mt-2 space-x-2">
                          <button onClick={() => handleDeleteAddress(addr._id)} className="text-gray-700 hover:text-gray-900"><FaTrash /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                }
              </div>

              {/* Add New Address */}
              <div>
                <h3 className="text-base font-semibold mb-3 flex items-center"><FaPlus className="mr-2" /> Add New Address</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.entries(formData.newAddress).map(([key, value]) => (
                    <div key={key}>
                      <label className="block text-sm font-medium mb-1 capitalize">{key}</label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 p-2 rounded"
                        placeholder={`Enter ${key}`}
                        value={value}
                        onChange={(e) => setFormData({ ...formData, newAddress: { ...formData.newAddress, [key]: e.target.value } })}
                      />
                    </div>
                  ))}
                </div>
                <button onClick={handleAddAddress} className="mt-4 px-4 py-2 border border-gray-900 hover:bg-gray-100 rounded">Save Address</button>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <Card title="Order Stats" icon={<FaShoppingCart />} isOpen={expandedSections.stats} toggle={() => toggleSection('stats')}>
            <div className="space-y-2">
              <StatRow label="Total Orders" value={totalOrders} />
              <StatRow label="Paid Orders" value={paidOrders} />
              <StatRow label="Cancelled" value={cancelledOrders} icon={<FaTimesCircle />} />
              <StatRow label="Refunded" value={refundedOrders} icon={<FaUndoAlt />} />
            </div>
          </Card>

          {/* Cart Preview */}
          <Card title={`Your Cart (${cart.length})`} icon={<FaBoxOpen />} isOpen={expandedSections.cart} toggle={() => toggleSection('cart')}>
            {cart.length === 0 ? <p className="text-gray-500">Your cart is empty</p> :
              <div className="space-y-4">
                {cart.slice(0, 3).map(item => (
                  <div key={item._id} className="flex items-center space-x-3">
                    <div className="w-16 h-16 bg-gray-200 overflow-hidden rounded">
                      <img src={Array.isArray(item.image) && item.image.length > 0 ? item.image[0] : item.image || "/default-product.png"} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-gray-600 text-sm">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
                {cart.length > 3 && <p className="text-sm text-gray-500">+ {cart.length - 3} more items</p>}
                <Link to="/cart" className="block mt-4 px-4 py-2 border border-gray-900 text-center hover:bg-gray-100 rounded">View Full Cart</Link>
              </div>
            }
          </Card>

          {/* Wishlist Preview */}
          <Card title={`Wishlist (${wishlist.length})`} icon={<FaHeart />} isOpen={expandedSections.wishlist} toggle={() => toggleSection('wishlist')}>
            {wishlist.length === 0 ? <p className="text-gray-500">Your wishlist is empty</p> :
              <div className="space-y-4">
                {wishlist.slice(0, 3).map(item => (
                  <div key={item._id} className="flex items-center space-x-3">
                    <div className="w-16 h-16 bg-gray-200 overflow-hidden rounded">
                      <img src={Array.isArray(item.image) && item.image.length > 0 ? item.image[0] : item.image || "/default-product.png"} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                    </div>
                  </div>
                ))}
                {wishlist.length > 3 && <p className="text-sm text-gray-500">+ {wishlist.length - 3} more items</p>}
                <Link to="/wishlist" className="block mt-4 px-4 py-2 border border-gray-900 text-center hover:bg-gray-100 rounded">View Full Wishlist</Link>
              </div>
            }
          </Card>
        </div>
      </div>
    </div>
  );
};

// Reusable Card Component
const Card = ({ title, icon, isOpen, toggle, children }) => (
  <div className="border border-gray-200 rounded shadow-sm overflow-hidden">
    <div onClick={toggle} className="flex items-center justify-between p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition">
      <h2 className="text-lg font-semibold flex items-center">
        {icon && <span className="mr-2">{icon}</span>} {title}
      </h2>
      {isOpen ? <FaChevronUp /> : <FaChevronDown />}
    </div>
    {isOpen && <div className="p-6">{children}</div>}
  </div>
);

// Reusable InfoRow
const InfoRow = ({ label, value, onEdit }) => (
  <div>
    <label className="block text-sm font-medium mb-1">{label}</label>
    <div className="flex items-center border-b border-gray-200 pb-2">
      <p className="flex-1 text-gray-800">{value}</p>
      <button onClick={onEdit} className="p-2 hover:bg-gray-100 rounded"><FaEdit /></button>
    </div>
  </div>
);

// Reusable StatRow
const StatRow = ({ label, value, icon }) => (
  <div className="flex justify-between items-center">
    <span className="flex items-center text-gray-700">{icon && <span className="mr-1">{icon}</span>} {label}</span>
    <span className="font-bold text-gray-900">{value}</span>
  </div>
);

export default MyProfile;
