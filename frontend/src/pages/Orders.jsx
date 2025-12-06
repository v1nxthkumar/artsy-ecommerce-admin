import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext.jsx';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import Title from '../components/Title.jsx';
import {
  XCircle, Truck, Package, Clock, CheckCircle, RotateCcw,
  ChevronDown, ChevronUp, Info, CreditCard, MapPin, Box,
  RefreshCw, Shield 
} from 'lucide-react';
import Spinner from '../components/Spinner.jsx';

const Orders = () => {
  const { backendUrl, token, currency } = useContext(ShopContext);
  const [orders, setOrders] = useState([]);
  const [pageLoaded, setPageLoaded] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [filter, setFilter] = useState('all');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [cancelingOrderId, setCancelingOrderId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const STATUS_LABELS = {
    'Order Placed': { label: 'Order Confirmed', color: 'blue', icon: <Clock size={16} /> },
    'Packing': { label: 'Processing', color: 'yellow', icon: <Package size={16} /> },
    'Shipping': { label: 'Shipped', color: 'orange', icon: <Truck size={16} /> },
    'Out for delivery': { label: 'Out for Delivery', color: 'purple', icon: <Truck size={16} /> },
    'Delivered': { label: 'Delivered', color: 'green', icon: <CheckCircle size={16} /> },
    'Cancel Requested': { label: 'Cancellation Requested', color: 'red', icon: <RotateCcw size={16} /> },
    'Processing': { label: 'Refund Processing', color: 'yellow', icon: <RefreshCw size={16} /> },
    'Refund Issued': { label: 'Refund Completed', color: 'green', icon: <CheckCircle size={16} /> }
  };

  const CANCEL_REASONS = [
    { id: 'mistake', label: "Ordered by mistake", icon: <Info size={16} /> },
    { id: 'price', label: "Found a better price elsewhere", icon: <CreditCard size={16} /> },
    { id: 'shipping', label: "Shipping too slow", icon: <Truck size={16} /> },
    { id: 'address', label: "Need to change address", icon: <MapPin size={16} /> },
    { id: 'mind', label: "Changed my mind", icon: <RefreshCw size={16} /> },
    { id: 'other', label: "Other reason", icon: <Box size={16} /> }
  ];

  const ORDER_STEPS = ['Order Placed', 'Packing', 'Shipping', 'Out for delivery', 'Delivered'];
  const CANCEL_STEPS = ['Cancel Requested', 'Processing', 'Refund Issued'];

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    if (filter === 'active') return !order.cancellationStatus;
    if (filter === 'cancelled') return order.cancellationStatus;
    return order.status === filter;
  });

  const fetchOrders = async () => {
    if (!token) return;
    try {
      const res = await axios.post(
        `${backendUrl}/api/order/userorders`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setOrders(res.data.orders.reverse());
      }
    } catch (err) {
      toast.error('Failed to load orders. Please try again.', {
        position: 'bottom-center',
        style: { background: '#f87171', color: '#fff' }
      });
    } finally {
      setDataLoaded(true);
    }
  };

  useEffect(() => {
    const handleLoad = () => setPageLoaded(true);

    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, []);

  useEffect(() => {
    setDataLoaded(false);
    const timer = setTimeout(() => fetchOrders(), 300);
    return () => clearTimeout(timer);
  }, [token]);

  useEffect(() => {
    const interval = setInterval(() => {
      const hasPending = orders.some(order =>
        ['Cancel Requested', 'Processing'].includes(order.cancellationStatus)
      );
      if (hasPending) fetchOrders();
    }, 10000);
    return () => clearInterval(interval);
  }, [orders]);

  const getStepPercentage = (status, steps) => {
    const index = steps.indexOf(status);
    return ((index + 1) / steps.length) * 100;
  };

  const toggleOrderExpand = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const handleCancelRequest = (orderId) => {
    setSelectedOrderId(orderId);
    setShowReasonModal(true);
  };

  const submitCancel = async () => {
    if (!cancelReason) {
      toast.error("Please select a cancellation reason.", { position: 'bottom-center' });
      return;
    }

    setCancelingOrderId(selectedOrderId);
    toast.loading("Processing your cancellation request...", {
      position: 'bottom-center',
      id: 'cancel-loading'
    });

    try {
      const res = await axios.post(
        `${backendUrl}/api/order/cancel`,
        { orderId: selectedOrderId, reason: cancelReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        toast.success('Cancellation request submitted successfully!', {
          position: 'bottom-center',
          duration: 3000,
          style: { background: '#4ade80', color: '#fff' }
        });
        fetchOrders();
      } else {
        toast.error(res.data.message || 'Cancellation failed. Please try again.', {
          position: 'bottom-center'
        });
      }
    } catch (err) {
      toast.error("Failed to process cancellation request. Please try again later.", {
        position: 'bottom-center'
      });
    } finally {
      toast.dismiss('cancel-loading');
      setCancelingOrderId(null);
      setCancelReason('');
      setSelectedOrderId(null);
      setShowReasonModal(false);
    }
  };

  const getStatusColor = (status, type = 'bg') => {
    const colorMap = {
      blue: type === 'bg' ? 'bg-blue-100' : 'text-blue-600',
      yellow: type === 'bg' ? 'bg-yellow-100' : 'text-yellow-600',
      orange: type === 'bg' ? 'bg-orange-100' : 'text-orange-600',
      purple: type === 'bg' ? 'bg-purple-100' : 'text-purple-600',
      green: type === 'bg' ? 'bg-green-100' : 'text-green-600',
      red: type === 'bg' ? 'bg-red-100' : 'text-red-600'
    };
    return colorMap[STATUS_LABELS[status]?.color || 'gray'];
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // 🔄 Show spinner until both page and data are loaded
  if (!pageLoaded || !dataLoaded) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <Spinner/>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 from-gray-50 min-h-screen">
      <div className="mx-auto">
        <Title
          lead="Order Recap"
          headline="Purchase History"
          subline="Because Great Taste Leaves a Trail"
        />
        {/* Header with search and filters */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
          <div className="w-full md:w-auto">
            <p className="text-gray-600 mt-1">
              {orders.length} order{orders.length !== 1 ? 's' : ''} placed
            </p>
          </div>

          <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
            <div className="inline-flex rounded-lg shadow-sm">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 text-sm font-medium rounded-l-lg transition-colors ${filter === 'all' ? 'bg-black text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('active')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${filter === 'active' ? 'bg-black text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              >
                Active
              </button>
              <button
                onClick={() => setFilter('cancelled')}
                className={`px-4 py-2 text-sm font-medium rounded-r-lg transition-colors ${filter === 'cancelled' ? 'bg-black text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              >
                Cancelled
              </button>
            </div>
          </div>
        </div>

        {/* Empty state */}
        {filteredOrders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-xl shadow-sm p-8 text-center"
          >
            <div className="mx-auto h-24 w-24 text-gray-300">
              <Package size={24} strokeWidth={1.5} className="mx-auto" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              {filter === 'all' ? 'No orders yet' : `No ${filter} orders`}
            </h3>
            <p className="mt-1 text-gray-500 max-w-md mx-auto">
              {filter === 'all'
                ? "You haven't placed any orders yet. Start shopping to see your order history here."
                : filter === 'active'
                  ? "You don't have any active orders right now. Check back later or view all orders."
                  : "No cancelled orders to display. Great shopping!"}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-5">
            {filteredOrders.map((order) => {
              const isCancelled = order.cancellationStatus;
              const progressSteps = isCancelled ? CANCEL_STEPS : ORDER_STEPS;
              const progressStatus = isCancelled ? order.cancellationStatus : order.status;
              const percent = getStepPercentage(progressStatus, progressSteps);
              const statusInfo = STATUS_LABELS[progressStatus] ||
                { label: progressStatus, color: 'gray', icon: <Info size={16} /> };

              return (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div
                    className="p-6 cursor-pointer"
                    onClick={() => toggleOrderExpand(order._id)}
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <div className={`${getStatusColor(progressStatus)} p-2 rounded-lg`}>
                            {statusInfo.icon}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800">
                              Order #{order._id.slice(-8).toUpperCase()}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Order Date: {formatDate(order.date)} <br />
                              Estimated Delivery: {new Date(new Date(order.date).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:items-end gap-1">
                        <div className="text-lg font-bold text-gray-800">
                          {currency}{order.amount}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(progressStatus)} ${getStatusColor(progressStatus, 'text')}`}>
                            {statusInfo.label}
                          </span>
                          {expandedOrder === order._id ? (
                            <ChevronUp size={18} className="text-gray-500" />
                          ) : (
                            <ChevronDown size={18} className="text-gray-500" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <AnimatePresence>
                    {expandedOrder === order._id && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-gray-200 px-6 py-5">
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Order Summary */}
                            <div className="space-y-6">
                              <div>
                                <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                  <Truck size={18} /> Shipping Information
                                </h4>
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                  <p className="font-medium text-gray-800">
                                    {order.address?.firstName} {order.address?.lastName}
                                  </p>
                                  <p className="text-sm text-gray-600 mt-1">{order.address?.street}</p>
                                  <p className="text-sm text-gray-600">
                                    {order.address?.city}, {order.address?.state} {order.address?.zipcode}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {order.address?.country}
                                  </p>
                                  <div className="mt-3 pt-3 border-t border-gray-200">
                                    <p className="text-sm text-gray-600">
                                      <span className="font-medium">Contact:</span> {order.address?.phone}
                                    </p>
                                    {order.address?.email && (
                                      <p className="text-sm text-gray-600">
                                        <span className="font-medium">Email:</span> {order.address.email}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div>
                                <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                  <CreditCard size={18} /> Payment Information
                                </h4>
                                <div className="space-y-3">
                                  <div className="flex justify-between items-center bg-gray-50 px-4 py-3 rounded-lg">
                                    <span className="text-sm text-gray-600">Status</span>
                                    <span className={`text-sm font-medium ${order.payment ? 'text-green-600' : 'text-yellow-600'
                                      }`}>
                                      {order.payment ? 'Completed' : 'Pending'}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center bg-gray-50 px-4 py-3 rounded-lg">
                                    <span className="text-sm text-gray-600">Method</span>
                                    <span className="text-sm font-medium text-gray-700 capitalize">
                                      {order.paymentMethod}
                                    </span>
                                  </div>
                                  {order.payment && (
                                    <div className="flex justify-between items-center bg-gray-50 px-4 py-3 rounded-lg">
                                      <span className="text-sm text-gray-600">Transaction ID</span>
                                      <span className="text-sm font-medium text-gray-700">
                                        {order._id || 'N/A'}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Products */}
                            <div className="lg:col-span-2 space-y-6">
                              <div>
                                <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                  <Package size={18} /> Order Items ({order.items.length})
                                </h4>
                                <div className="space-y-4">
                                  {order.items.map((item, idx) => (
                                    <motion.div
                                      key={idx}
                                      initial={{ opacity: 0 }}
                                      animate={{ opacity: 1 }}
                                      transition={{ delay: idx * 0.05 }}
                                      className="flex gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                      <div className="flex-shrink-0">
                                        <img
                                          src={item.image[0]}
                                          alt={item.name}
                                          className="w-20 h-20 object-cover object-top rounded-md border border-gray-200"
                                        />
                                      </div>
                                      <div className="flex-1">
                                        <h5 className="font-medium text-gray-800">{item.name}</h5>
                                        <p className="text-sm text-gray-600 mt-1">
                                          {item.size} • Qty: {item.quantity}
                                        </p>
                                        <div className="flex justify-between items-center mt-2">
                                          <p className="text-sm text-gray-800">
                                            {currency}{item.price} each
                                          </p>
                                          <p className="font-medium text-gray-800">
                                            {currency}{(item.price * item.quantity).toFixed(2)}
                                          </p>
                                        </div>
                                      </div>
                                    </motion.div>
                                  ))}
                                </div>
                              </div>

                              {/* Order Timeline */}
                              <div>
                                <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                  <Clock size={18} /> {isCancelled ? 'Cancellation Progress' : 'Order Status'}
                                </h4>
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                  <div className="relative pt-1">
                                    <div className="flex mb-2 items-start justify-between flex-col sm:flex-row sm:items-center">
                                      <div>
                                        <span className={`text-xs font-semibold inline-block ${getStatusColor(progressStatus, 'text')}`}>
                                          {progressStatus}
                                        </span>

                                        {/* Always show both Order Date and Estimated Delivery */}
                                        <p className="text-xs text-gray-500 mt-1">
                                          Order Date: {new Date(order.date).toLocaleDateString(undefined, {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                          })}
                                        </p>
                                      </div>

                                      <div className="text-right mt-2 sm:mt-0">
                                        <span className="text-xs font-semibold inline-block text-gray-600">
                                          Step {progressSteps.indexOf(progressStatus) + 1} of {progressSteps.length}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="overflow-hidden h-2 mb-2 text-xs flex rounded-full bg-gray-200">
                                      <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${percent}%` }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                        className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${isCancelled
                                          ? 'bg-gradient-to-r from-red-500 to-green-500'
                                          : 'bg-gradient-to-r from-blue-500 to-green-500'
                                          }`}
                                      />
                                    </div>
                                    <div className="flex justify-between">
                                      {progressSteps.map((step, idx) => (
                                        <motion.div
                                          key={idx}
                                          initial={{ opacity: 0, y: 10 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          transition={{ delay: idx * 0.1 }}
                                          className="text-center"
                                        >
                                          {/* ✅ Show estimated delivery date above the "Delivered" step */}
                                          {step === 'Delivered' && (
                                            <p className="text-[10px] text-gray-500 mb-1">
                                              Estimated: {new Date(new Date(order.date).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(undefined, {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                              })}
                                            </p>
                                          )}

                                          <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center mb-1 ${idx <= progressSteps.indexOf(progressStatus)
                                            ? isCancelled
                                              ? 'bg-red-100 text-red-600'
                                              : 'bg-blue-100 text-blue-600'
                                            : 'bg-gray-100 text-gray-400'
                                            }`}>
                                            {STATUS_LABELS[step]?.icon || <Info size={16} />}
                                          </div>

                                          <span className={`text-xs ${idx <= progressSteps.indexOf(progressStatus)
                                            ? isCancelled
                                              ? 'text-red-600 font-medium'
                                              : 'text-blue-600 font-medium'
                                            : 'text-gray-500'
                                            }`}>
                                            {step}
                                          </span>
                                        </motion.div>
                                      ))}
                                    </div>
                                  </div>

                                  {isCancelled && order.cancellationReason && (
                                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                      <p className="text-sm text-yellow-800">
                                        <span className="font-medium">Cancellation reason:</span> {order.cancellationReason}
                                      </p>
                                      {order.cancellationStatus === 'Cancel Requested' && (
                                        <p className="text-xs text-yellow-600 mt-1 flex items-center gap-1">
                                          <Clock size={12} /> Awaiting approval for refund
                                        </p>
                                      )}
                                    </div>
                                  )}
                                </div>

                                {!isCancelled && !['Delivered', 'Out for delivery', 'Shipping'].includes(order.status) && (
                                  <div className="mt-6 flex justify-end">
                                    <button
                                      onClick={() => handleCancelRequest(order._id)}
                                      disabled={cancelingOrderId === order._id}
                                      className="px-5 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                      {cancelingOrderId === order._id ? (
                                        <Loader className="w-4 h-4 animate-spin" />
                                      ) : (
                                        <XCircle size={16} />
                                      )}
                                      Request Cancellation
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cancel Order Modal */}
      <AnimatePresence>
        {showReasonModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">
                    Cancel Order #{selectedOrderId?.slice(-8).toUpperCase()}
                  </h3>
                  <button
                    onClick={() => setShowReasonModal(false)}
                    className="text-gray-400 hover:text-gray-500 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-700">
                      Please select the reason for cancellation
                    </h4>
                    <div className="space-y-2">
                      {CANCEL_REASONS.map((reason) => (
                        <motion.div
                          key={reason.id}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div
                            onClick={() => setCancelReason(reason.label)}
                            className={`p-3 border rounded-lg cursor-pointer transition-all ${cancelReason === reason.label
                              ? 'border-black bg-black/10 ring-1 ring-black/20'
                              : 'border-gray-200 hover:border-gray-300'
                              }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-md ${cancelReason === reason.label
                                ? 'bg-black text-white'
                                : 'bg-gray-100 text-gray-500'
                                }`}>
                                {reason.icon}
                              </div>
                              <span>{reason.label}</span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <div className="flex items-start gap-3">
                      <Shield size={18} className="text-blue-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-medium text-blue-800 mb-1">
                          Cancellation Policy
                        </h4>
                        <p className="text-xs text-blue-700">
                          Orders can be cancelled within 24 hours of placement. Refunds are processed within 5-7 business days after approval.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      onClick={() => setShowReasonModal(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                    >
                      Go Back
                    </button>
                    <button
                      onClick={submitCancel}
                      disabled={!cancelReason}
                      className={`px-5 py-2 text-sm font-medium text-white rounded-lg transition-colors ${cancelReason
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-red-400 cursor-not-allowed'
                        }`}
                    >
                      Submit Cancellation
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Orders;