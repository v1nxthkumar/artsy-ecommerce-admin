import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { backendUrl, currency } from '../App.jsx';
import { toast } from 'react-toastify';
import { assets } from '../assets/assets.js';
import Modal from 'react-modal';
import { ClipLoader } from 'react-spinners';
import { format } from 'date-fns';
import { FiTrash2, FiRefreshCw, FiSearch, FiFilter, FiCreditCard, FiTruck, FiClock } from 'react-icons/fi';

Modal.setAppElement('#root');

const Orders = ({ token }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [stats, setStats] = useState({
    pending: 0,
    processing: 0,
    completed: 0,
    revenueToday: 0
  });

  const statusColors = {
    'Order Placed': 'text-blue-700',
    'Packing': 'text-yellow-700',
    'Shipping': 'text-purple-700',
    'Out for delivery': 'text-orange-700',
    'Delivered': 'text-green-700',
    'Cancelled': 'text-red-700',
  };

  const fetchAllOrders = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await axios.post(
        `${backendUrl}/api/order/list`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        const orders = response.data.orders.reverse();
        setOrders(orders);

        // Calculate stats
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const newStats = {
          pending: orders.filter(o => !o.payment).length,
          processing: orders.filter(o => o.status !== 'Delivered').length,
          completed: orders.filter(o => o.status === 'Delivered').length,
          revenueToday: orders
            .filter(o => new Date(o.date) >= today && o.payment)
            .reduce((sum, o) => sum + o.amount, 0)
        };
        setStats(newStats);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefund = async (orderId) => {
    const confirm = window.confirm("Approve this refund and update the order status?");
    if (!confirm) return;

    try {
      const res = await axios.post(
        `${backendUrl}/api/order/approve-refund`,
        { orderId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.success) {
        toast.success(res.data.message || "Refund approved successfully.");

        // Optionally update just this order in UI without full reload:
        setSelectedOrder((prev) => ({
          ...prev,
          status: 'Cancelled',
          cancellationStatus: 'Refund Issued',
        }));

        // Refresh all orders
        fetchAllOrders();
      } else {
        toast.error(res.data.message || "Failed to approve refund.");
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
        err.message ||
        "Error processing refund."
      );
    }
  };

  const validStatuses = [
    "Order Placed",
    "Packing",
    "Shipping",
    "Out for delivery",
    "Delivered"
  ];

  const statusHandler = async (event, orderId) => {
    const newStatus = event.target.value;
    const order = orders.find(order => order._id === orderId); // Make sure `orders` is available
    const currentStatus = order?.status;

    if (!validStatuses.includes(newStatus)) {
      toast.error("Invalid status selected.");
      return;
    }

    if (!order) {
      toast.error("Order not found.");
      return;
    }

    if (currentStatus === "Cancelled" || currentStatus === "Delivered") {
      toast.warning("This order can no longer be updated.");
      return;
    }

    if (newStatus === currentStatus) {
      toast.info("Status is already set to this value.");
      return;
    }

    const confirmUpdate = window.confirm(`Change order status from "${currentStatus}" to "${newStatus}"?`);
    if (!confirmUpdate) return;

    try {
      const response = await axios.post(
        `${backendUrl}/api/order/status`,
        { orderId, status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        toast.success("Order status updated.");
        fetchAllOrders();
      } else {
        toast.error("Failed to update status.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Error updating status.");
    }
  };

  const debounceSearch = (() => {
    let timeout;
    return (callback, delay) => {
      clearTimeout(timeout);
      timeout = setTimeout(callback, delay);
    };
  })();

  useEffect(() => {
    fetchAllOrders();
  }, [token]);

  useEffect(() => {
    debounceSearch(() => {
      const filtered = orders.filter((order) => {
        const searchMatch =
          order.items.some((item) =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase())
          ) ||
          order.address.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.address.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order._id.toLowerCase().includes(searchTerm.toLowerCase());

        const statusMatch = statusFilter ? order.status === statusFilter : true;
        const paymentMatch =
          paymentFilter !== ''
            ? order.payment === (paymentFilter === 'paid')
            : true;

        return searchMatch && statusMatch && paymentMatch;
      });
      setFilteredOrders(filtered);
    }, 300);
  }, [searchTerm, statusFilter, paymentFilter, orders]);

  return (
    <div className="min-h-screen p-6 md:p-10 bg-gray-50">
      <div className="mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">Orders Dashboard</h2>
            <p className="text-gray-500 mt-1">Manage and track your customer orders</p>
          </div>
          <button
            onClick={fetchAllOrders}
            className="flex items-center mt-4 md:mt-0 space-x-2 bg-white border border-gray-200 px-4 py-2  text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <FiRefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">Pending Payments</h3>
              <div className="p-2  bg-red-50">
                <FiCreditCard className="w-5 h-5 text-red-600" />
              </div>
            </div>
            <p className="mt-2 text-2xl font-bold text-gray-800">{stats.pending}</p>
            <p className="text-xs text-gray-400 mt-1">Require payment processing</p>
          </div>

          <div className="bg-white shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">Processing</h3>
              <div className="p-2  bg-blue-50">
                <FiTruck className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <p className="mt-2 text-2xl font-bold text-gray-800">{stats.processing}</p>
            <p className="text-xs text-gray-400 mt-1">Orders in progress</p>
          </div>

          <div className="bg-white shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">Completed</h3>
              <div className="p-2  bg-green-50">
                <FiCreditCard className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <p className="mt-2 text-2xl font-bold text-gray-800">{stats.completed}</p>
            <p className="text-xs text-gray-400 mt-1">Delivered orders</p>
          </div>

          <div className="bg-white shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">Today's Revenue</h3>
              <div className="p-2  bg-purple-50">
                <FiClock className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <p className="mt-2 text-2xl font-bold text-gray-800">{currency}{stats.revenueToday}</p>
            <p className="text-xs text-gray-400 mt-1">Paid orders today</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white shadow-sm p-6 border border-gray-100 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Filter Orders</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 leading-tight focus:outline-none"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiFilter className="h-5 w-5 text-gray-400" />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block appearance-none w-full pl-10 pr-3 py-3 border border-gray-200  leading-tight focus:outline-none"
              >
                <option value="">All Status</option>
                <option value="Order Placed">Order Placed</option>
                <option value="Packing">Packing</option>
                <option value="Shipping">Shipping</option>
                <option value="Out for delivery">Out for delivery</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiCreditCard className="h-5 w-5 text-gray-400" />
              </div>
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="block appearance-none w-full pl-10 pr-3 py-3 border border-gray-200  leading-tight focus:outline-none"
              >
                <option value="">All Payments</option>
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
              </select>
            </div>

            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('');
                  setPaymentFilter('');
                }}
                className="px-4 py-2 bg-black text-white border border-gray-200 text-sm font-medium  hover:bg-neutral-800 transition"
              >
                Clear filters
              </button>
            </div>
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <ClipLoader color="#4A90E2" loading={loading} size={50} />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center">
            <h3 className="text-xl font-medium text-gray-800 mb-2">No orders found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your search or filters to find what you're looking for</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
                setPaymentFilter('');
              }}
              className="px-6 py-2 bg-teal-600 text-white font-medium  hover:bg-teal-700 transition"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="overflow-hidden border border-gray-200 shadow-sm">
            <div className="bg-white">
              {/* Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Items
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Method
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredOrders.map((order) => {
                      const isLate = new Date() - new Date(order.date) > 3 * 24 * 60 * 60 * 1000;
                      return (
                        <tr
                          key={order._id}
                          className={`hover:bg-gray-50 cursor-pointer ${isLate ? 'bg-yellow-50' : ''}`}
                          onClick={() => setSelectedOrder(order)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="font-medium text-gray-900">{order.address.firstName} {order.address.lastName}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex -space-x-1 overflow-hidden">
                              <span className="inline-flex items-center justify-center h-8 w-8 text-xs font-medium text-gray-600">
                                {order.items.length}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {format(new Date(order.date), 'MMM d, yyyy')}
                            <div className="text-xs text-gray-400">
                              {format(new Date(order.date), 'h:mm a')}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className={`inline-flex items-center text-sm ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {order.paymentMethod}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className={`inline-flex items-center px-4 py-1 text-xs font-medium ${order.payment ? 'border border-green-800 text-green-800' : 'border border-red-800 text-red-800'}`}>
                              {order.payment ? 'Paid' : 'Unpaid'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {currency}{order.amount}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination would go here */}
            </div>
          </div>
        )}

        {/* Order Detail Modal */}
        {selectedOrder && (
          <Modal
            isOpen={!!selectedOrder}
            onRequestClose={() => setSelectedOrder(null)}
            className="bg-white shadow-xl mx-auto my-12 relative outline-none"
            overlayClassName="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex justify-center items-start overflow-auto p-4"
            shouldCloseOnOverlayClick={true}
          >
            <div className="relative">
              {/* Close Button */}
              <button
                onClick={() => setSelectedOrder(null)}
                className="absolute top-4 right-4 p-1 hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="px-8 py-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Order #{selectedOrder._id}
                    </h2>
                    <p className="text-gray-500 mt-1">
                      Placed on {format(new Date(selectedOrder.date), 'MMMM d, yyyy h:mm a')}
                    </p>
                  </div>
                </div>

                {/* Info Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                  {/* Customer Info */}
                  <div className="bg-gray-50 p-6 border border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Customer Information</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-gray-500 block">Name</span>{selectedOrder.address.firstName} {selectedOrder.address.lastName}</p>
                      <p><span className="text-gray-500 block">Email</span>{selectedOrder.address.email || 'N/A'}</p>
                      <p><span className="text-gray-500 block">Phone</span>{selectedOrder.address.phone}</p>
                    </div>
                  </div>

                  {/* Shipping */}
                  <div className="bg-gray-50 p-6 border border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Shipping Address</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-gray-500 block">Address</span>{selectedOrder.address.street}</p>
                      <p><span className="text-gray-500 block">City/State</span>{selectedOrder.address.city}, {selectedOrder.address.state}</p>
                      <p><span className="text-gray-500 block">ZIP/Country</span>{selectedOrder.address.zipcode}, {selectedOrder.address.country}</p>
                    </div>
                  </div>

                  {/* Payment */}
                  <div className="bg-gray-50 p-6 border border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Payment Details</h3>
                    <div className="space-y-3 text-sm">
                      <p><span className="text-gray-500 block">Method</span>{selectedOrder.paymentMethod}</p>
                      <p><span className="text-gray-500 block">Status</span>
                        <span className={`font-medium ${selectedOrder.payment ? 'text-green-900' : 'text-red-800'}`}>
                          {selectedOrder.payment ? 'Paid' : 'Payment Pending'}
                        </span>
                      </p>
                      <p><span className="text-gray-500 block">Transaction ID</span>{selectedOrder._id || 'N/A'}</p>
                      <div className="pt-2 border-t border-gray-200">
                        <p className="text-lg font-semibold">Total: <span className="font-bold">{currency}{selectedOrder.amount}</span></p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cancellation */}
                {selectedOrder.cancellationStatus && (
                  <div className="bg-yellow-50 border border-yellow-200 p-6 mb-8">
                    <h3 className="text-lg font-medium text-yellow-900 mb-2">Cancellation Status</h3>
                    <p className="text-sm text-yellow-800"><strong>Status:</strong> {selectedOrder.cancellationStatus}</p>
                    {selectedOrder.cancellationReason && (
                      <p className="text-sm text-yellow-800 mt-1"><strong>Reason:</strong> {selectedOrder.cancellationReason}</p>
                    )}
                  </div>
                )}

                {selectedOrder.cancellationStatus === 'Processing' && (
                  <div className="text-center mt-4">
                    <button
                      onClick={() => handleRefund(selectedOrder._id)}
                      className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 transition"
                    >
                      Approve Refund
                    </button>
                  </div>
                )}

                {/* Order Items */}
                <div className="bg-white border border-gray-200 overflow-hidden mb-8">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedOrder.items.map((item, i) => (
                        <tr key={i}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {item.name} <span className="text-sm text-gray-500"> - {item.size}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">{currency}{item.price}</td>
                          <td className="px-6 py-4 text-sm text-center text-gray-500">{item.quantity}</td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{currency}{item.price * item.quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/*  Live Progress Tracker */}
                <div className="bg-gray-50 p-6 border border-gray-200 shadow mb-8">
                  <h3 className="text-lg font-semibold text-center text-gray-800 mb-6">Order Progress</h3>

                  <div className="relative flex justify-between items-center px-2 sm:px-6">
                    <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 rounded-full z-0" />

                    {["Order Placed", "Packing", "Shipping", "Out for delivery", "Delivered"].map((step, idx, arr) => {
                      const isCompleted = arr.indexOf(step) <= arr.indexOf(selectedOrder.status);
                      const isActive = selectedOrder.status === step;
                      const stepIndex = arr.indexOf(step);
                      const currentIndex = arr.indexOf(selectedOrder.status);

                      return (
                        <div key={step} className="relative z-10 flex flex-col items-center w-1/5 group">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 ease-in-out
                    ${isCompleted ? 'bg-green-600 text-white scale-100' : 'bg-gray-300 text-gray-700 scale-95'}
                    ${isActive ? 'ring-4 ring-blue-400 scale-110 shadow-md' : ''}
                  `}
                          >
                            {idx + 1}
                          </div>
                          <span className={`mt-2 text-xs text-center font-medium ${isActive ? 'text-blue-700' : 'text-gray-500'}`}>
                            {step}
                          </span>

                          {idx < arr.length - 1 && (
                            <div className="absolute top-5 left-full w-full h-1">
                              <div className={`h-full transition-all duration-500 ease-in-out rounded-full
                      ${stepIndex < currentIndex ? 'bg-green-500 w-full' : 'bg-gray-300 w-0'}`}>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Controls */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
                    <select
                      value={selectedOrder.status}
                      onChange={(e) => {
                        statusHandler(e, selectedOrder._id);
                        setSelectedOrder((prev) => ({ ...prev, status: e.target.value }));
                      }}
                      className="w-full sm:w-64 px-3 py-2 border border-gray-300 text-sm shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      disabled={selectedOrder.status === 'Cancelled'}
                    >
                      {["Order Placed", "Packing", "Shipping", "Out for delivery", "Delivered"].map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>

                    <button
                      onClick={() => {
                        statusHandler({ target: { value: "Delivered" } }, selectedOrder._id);
                        setSelectedOrder((prev) => ({ ...prev, status: "Delivered" }));
                      }}
                      className="bg-black text-white px-4 py-2 text-sm hover:bg-neutral-900 transition disabled:opacity-50"
                      disabled={selectedOrder.status === 'Delivered' || selectedOrder.status === 'Cancelled'}
                    >
                      Mark as Delivered
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
};

export default Orders;


