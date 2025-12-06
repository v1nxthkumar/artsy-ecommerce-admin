import React, { useContext, useState, useEffect } from 'react';
import Title from '../components/Title.jsx';
import CartTotal from '../components/CartTotal';
import { ShopContext } from '../context/ShopContext.jsx';
import { toast } from 'react-toastify';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaBox, FaUser, FaEnvelope, FaMapMarkerAlt, FaPhone, FaLock, FaCity, FaMap, FaHashtag, FaGlobeAmericas } from 'react-icons/fa';
import { SiStripe, SiRazorpay } from "react-icons/si";
import Spinner from '../components/Spinner.jsx';

const PlaceOrder = () => {
  const {
    navigate,
    backendUrl,
    token,
    cartItems,
    setCartItems,
    getCartAmount,
    delivery_fee,
    products,
  } = useContext(ShopContext);
  const [loading, setLoading] = useState(true);
  const [method, setMethod] = useState('cod');
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', street: '', city: '',
    state: '', zipcode: '', country: '', phone: ''
  });
  const [saveAddressChecked, setSaveAddressChecked] = useState(false);

  // Fetch saved addresses from the backend
  const fetchSavedAddresses = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found in localStorage");
      return;
    }

    try {
      const { data } = await axios.get(`${backendUrl}/api/user/address`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) setSavedAddresses(data.addresses);
    } catch (err) {
      console.error("Address fetch error:", err.response?.data || err.message);
    }
  };

  useEffect(() => {
    fetchSavedAddresses();
  }, []);

  const onChangeHandler = (e) => {
    const { name, value } = e.target;
    setFormData(data => ({ ...data, [name]: value }));
  };

  const onSaveAddress = async () => {
    try {
      const { data } = await axios.post(`${backendUrl}/api/user/address`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) {
        toast.success("Address saved!");
        await fetchSavedAddresses();
      }
    } catch (err) {
      toast.error("Failed to save address.");
    }
  };

  const onLoadAddress = (address) => {
    const { _id, updatedAt, ...rest } = address;
    setFormData(rest);
    toast.info("Address loaded!");
  };

  const onDeleteAddress = async (id) => {
    try {
      const { data } = await axios.delete(`${backendUrl}/api/user/address/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) {
        toast.success("Address deleted!");
        await fetchSavedAddresses();
      }
    } catch (err) {
      toast.error("Failed to delete address.");
    }
  };

  const initPay = (order) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: 'Order Payment',
      description: 'Order Payment',
      order_id: order.id,
      receipt: order.receipt,
      handler: async (response) => {
        try {
          const { data } = await axios.post(`${backendUrl}/api/order/verifyRazorpay`, response, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (data.success) {
            setCartItems({});
            navigate('/orders');
          }
        } catch (err) {
          toast.error(err.message);
        }
      },
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      // Check if address already exists
      const isDuplicate = savedAddresses.some(addr =>
        addr.firstName === formData.firstName &&
        addr.lastName === formData.lastName &&
        addr.email === formData.email &&
        addr.street === formData.street &&
        addr.city === formData.city &&
        addr.state === formData.state &&
        addr.zipcode === formData.zipcode &&
        addr.country === formData.country &&
        addr.phone === formData.phone
      );

      // If it's not a duplicate, save it
      if (!isDuplicate) {
        await onSaveAddress(); // silently save without user interaction
      }

      // Proceed with placing the order...
      let orderItems = [];
      for (const items in cartItems) {
        for (const item in cartItems[items]) {
          if (cartItems[items][item] > 0) {
            const itemInfo = structuredClone(products.find((product) => product._id === items));
            if (itemInfo) {
              itemInfo.size = item;
              itemInfo.quantity = cartItems[items][item];
              orderItems.push(itemInfo);
            }
          }
        }
      }

      const orderData = {
        address: formData,
        items: orderItems,
        amount: getCartAmount() + delivery_fee,
      };

      let response;
      switch (method) {
        case 'cod':
          response = await axios.post(`${backendUrl}/api/order/place`, orderData, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (response.data.success) {
            setCartItems({});
            navigate('/success');
          } else toast.error(response.data.message);
          break;

        case 'stripe':
          response = await axios.post(`${backendUrl}/api/order/stripe`, orderData, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (response.data.success) {
            window.location.replace(response.data.session_url);
          } else toast.error(response.data.message);
          break;

        case 'razorpay':
          response = await axios.post(`${backendUrl}/api/order/razorpay`, orderData, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (response.data.success) {
            initPay(response.data.order);
          }
          break;

        default:
          toast.error('Invalid payment method selected');
      }

    } catch (error) {
      toast.error(error.message);
    }
  };

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
    <div className="min-h-screen px-4 sm:px-6 md:px-10 text-gray-800">
      <div className="relative w-full mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full"
        >
          <div className="flex flex-col md:flex-row gap-10">
            {/* LEFT: Delivery Info Form */}
            <form onSubmit={onSubmitHandler} className="w-full md:w-2/3 space-y-6">
              <Title lead="From Our Store to Your Door" headline="Delivery Info" subline="Fast. Reliable. Tracked." size='sm' />
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-6">
                  <InputField label="First Name" name="firstName" value={formData.firstName} onChange={onChangeHandler} icon={<FaUser />} required />
                  <InputField label="Last Name" name="lastName" value={formData.lastName} onChange={onChangeHandler} icon={<FaUser />} required />
                </div>
                <InputField label="Email" name="email" value={formData.email} onChange={onChangeHandler} type="email" icon={<FaEnvelope />} required />
                <InputField label="Street Address" name="street" value={formData.street} onChange={onChangeHandler} icon={<FaMapMarkerAlt />} required />
                <div className="grid grid-cols-2 gap-6">
                  <InputField label="City" name="city" value={formData.city} onChange={onChangeHandler} icon={<FaCity />} required />
                  <InputField label="State" name="state" value={formData.state} onChange={onChangeHandler} icon={<FaMap />} required />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <InputField label="Zip Code" name="zipcode" value={formData.zipcode} onChange={onChangeHandler} type="number" icon={<FaHashtag />} required />
                  <InputField label="Country" name="country" value={formData.country} onChange={onChangeHandler} icon={<FaGlobeAmericas />} required />
                </div>
                <InputField label="Phone Number" name="phone" value={formData.phone} onChange={onChangeHandler} type="number" icon={<FaPhone />} required />
                <div className="flex items-center gap-2 mt-4">
                  <input
                    type="checkbox"
                    id="saveAddress"
                    checked={saveAddressChecked}
                    onChange={() => setSaveAddressChecked(!saveAddressChecked)}
                    className="h-4 w-4 text-black border-gray-300 focus:ring-black"
                  />
                  <label htmlFor="saveAddress" className="text-sm text-gray-700">
                    Save this address for future use
                  </label>
                </div>
                {savedAddresses.length > 0 && (
                  <SavedAddresses addresses={savedAddresses} onLoadAddress={onLoadAddress} onDeleteAddress={onDeleteAddress} />
                )}
              </div>
            </form>

            {/* RIGHT: Cart + Payment */}
            <div className="w-full md:w-1/3 flex flex-col">
              {/* Cart Total */}
              <div>
                <CartTotal />
              </div>

              {/* Payment Gateway */}
              <div className="flex-1">
                <Title headline="Payment Method" subline="Secure & Flexible" />
                <div className="space-y-4">
                  <PaymentMethod method={method} setMethod={setMethod} />
                </div>

                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  onClick={onSubmitHandler}
                  className="mt-6 w-full bg-black text-white py-3 px-8 font-medium uppercase tracking-wider flex items-center justify-center gap-2 transition duration-300 hover:bg-gray-800"
                >
                  <FaLock className="text-white" />
                  COMPLETE PURCHASE
                </motion.button>

                <p className="text-center mt-3 text-xs text-gray-500">256-BIT ENCRYPTION • SECURE TRANSACTION</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );

};

const InputField = ({ label, name, value, onChange, type = 'text', icon, required }) => (
  <div className="relative">
    <label className="block text-gray-700 text-xs uppercase tracking-widest">{label}{required && '*'}</label>
    <div className="relative">
      {icon && <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">{icon}</div>}
      <input
        name={name}
        value={value}
        onChange={onChange}
        type={type}
        className="w-full bg-white border-b border-gray-400 py-3 px-1 pl-10 focus:outline-none focus:border-black transition duration-200"
        required={required}
      />
    </div>
  </div>
);

const SavedAddresses = ({ addresses, onLoadAddress, onDeleteAddress }) => {
  const [selectedAddress, setSelectedAddress] = useState(addresses[0]?._id || null);

  const handleSelectAddress = (addr) => {
    setSelectedAddress(addr._id);
    onLoadAddress(addr);
  };

  return (
    <div className="mt-8">
      <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">
        Select Delivery Address
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {addresses.map((addr) => (
          <div
            key={addr._id}
            onClick={() => handleSelectAddress(addr)}
            className={`relative p-5 sm:p-4 border cursor-pointer transition-all duration-200 shadow-sm ${selectedAddress === addr._id
                ? 'border-black bg-gray-50'
                : 'border-gray-200 hover:border-gray-300 hover:shadow'
              }`}
          >
            <div className="space-y-1">
              <div className="flex items-center justify-between flex-wrap">
                <h4 className="font-medium text-gray-900 capitalize text-sm sm:text-base">
                  {addr.firstName} {addr.lastName}
                </h4>
              </div>
              
              <p className="text-sm text-gray-700 leading-snug">
                {addr.street}, {addr.city}, {addr.state} - {addr.zipcode}
              </p>
              <p className="text-sm text-gray-700">{addr.country}</p>

              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-sm text-gray-700 pt-1">
                <p className="flex items-center gap-1">
                  <FaPhone className="text-xs" /> {addr.phone}
                </p>
                <p className="flex items-center gap-1">
                  <FaEnvelope className="text-xs" /> {addr.email}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

};

const PaymentMethod = ({ method, setMethod }) => (
  <>
    <motion.div whileHover={{ y: -2 }} onClick={() => setMethod('stripe')} className={`relative p-4 border cursor-pointer ${method === 'stripe' ? 'border-black bg-gray-100' : 'border-gray-300 hover:bg-gray-50'}`}>
      <div className="flex items-center">
        <SiStripe className="text-black text-xl" />
        <span className="ml-4 text-black text-sm sm:text-base">Stripe</span>
      </div>
    </motion.div>
    <motion.div whileHover={{ y: -2 }} onClick={() => setMethod('razorpay')} className={`relative p-4 border cursor-pointer ${method === 'razorpay' ? 'border-black bg-gray-100' : 'border-gray-300 hover:bg-gray-50'}`}>
      <div className="flex items-center">
        <SiRazorpay className="text-black text-xl" />
        <span className="ml-4 text-black text-sm sm:text-base">Razorpay</span>
      </div>
    </motion.div>
    <motion.div whileHover={{ y: -2 }} onClick={() => setMethod('cod')} className={`relative p-4 border cursor-pointer ${method === 'cod' ? 'border-black bg-gray-100' : 'border-gray-300 hover:bg-gray-50'}`}>
      <div className="flex items-center">
        <FaBox className="text-black text-xl" />
        <span className="ml-4 text-black text-sm sm:text-base">Cash on Delivery</span>
      </div>
    </motion.div>
  </>
);

export default PlaceOrder;
