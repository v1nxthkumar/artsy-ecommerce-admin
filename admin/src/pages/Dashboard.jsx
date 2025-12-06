import React, { useEffect, useState } from "react";
import { backendUrl } from "../App.jsx";
import axios from "axios";
import {
  FiCreditCard,
  FiTruck,
  FiCheckCircle,
  FiClock,
  FiTrendingUp,
  FiShoppingBag,
  FiPieChart,
  FiSend,
  FiBox,
} from "react-icons/fi";
import { FaMoneyBillWave, FaBox } from "react-icons/fa";
import { SiStripe, SiRazorpay } from "react-icons/si";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    paidOrders: 0,
    totalRevenue: 0,
    todayRevenue: 0,
    pendingPayments: 0,
    completedOrders: 0,
    paymentMethodStats: { COD: 0, Stripe: 0, Razorpay: 0 },
    orderStages: {
      placed: 0,
      packing: 0,
      shipping: 0,
      outForDelivery: 0,
      delivered: 0,
    },
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/order/dashboard-stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.data.success) {
          setStats(res.data.stats);
        }
      } catch (error) {
        console.error("Error fetching stats", error);
      }
    };

    fetchStats();
  }, []);

  const processingCount =
    (stats.orderStages?.placed || 0) +
    (stats.orderStages?.packing || 0) +
    (stats.orderStages?.shipping || 0) +
    (stats.orderStages?.outForDelivery || 0);

  return (
    <div className="bg-gray-50 min-h-screen p-6 md:p-10">
      <div>
        <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">Overall Dashboard</h2>
        <p className="text-gray-500 mt-1 mb-8">Manage and track your customer orders efficiently</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={<FiShoppingBag className="w-5 h-5 text-orange-600" />}
          bg="bg-orange-100"
          note="All orders placed"
        />
        <StatCard
          title="Pending Payments"
          value={stats.pendingPayments}
          icon={<FiCreditCard className="w-5 h-5 text-red-600" />}
          bg="bg-red-100"
          note="Require payment processing"
        />
        <StatCard
          title="Processing"
          value={processingCount}
          icon={<FiTruck className="w-5 h-5 text-blue-600" />}
          bg="bg-blue-100"
          note="Orders in progress"
        />
        <StatCard
          title="Completed"
          value={stats.orderStages?.delivered || 0}
          icon={<FiCheckCircle className="w-5 h-5 text-green-600" />}
          bg="bg-green-100"
          note="Delivered orders"
        />
      </div>

      {/* Revenue Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <StatCard
          title="Today's Revenue"
          value={`₹${stats.todayRevenue}`}
          icon={<FiClock className="w-5 h-5 text-purple-600" />}
          bg="bg-purple-100"
          note="Paid orders today"
        />
        <StatCard
          title="Total Revenue"
          value={`₹${stats.totalRevenue}`}
          icon={<FiTrendingUp className="w-5 h-5 text-yellow-600" />}
          bg="bg-yellow-100"
          note="All-time revenue"
        />
        <StatCard
          title="Paid Orders"
          value={stats.paidOrders}
          icon={<FiPieChart className="w-5 h-5 text-teal-600" />}
          bg="bg-teal-100"
          note="Successful transactions"
        />
      </div>

      {/* Order Stage Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
        <StatCard
          title="Placed"
          value={stats.orderStages?.placed || 0}
          icon={<FiShoppingBag className="w-5 h-5 text-indigo-600" />}
          bg="bg-indigo-100"
          note="Newly placed orders"
        />
        <StatCard
          title="Packing"
          value={stats.orderStages?.packing || 0}
          icon={<FiBox className="w-5 h-5 text-yellow-600" />}
          bg="bg-yellow-100"
          note="Orders being packed"
        />
        <StatCard
          title="Shipping"
          value={stats.orderStages?.shipping || 0}
          icon={<FiTruck className="w-5 h-5 text-blue-600" />}
          bg="bg-blue-100"
          note="Orders in transit"
        />
        <StatCard
          title="Out for Delivery"
          value={stats.orderStages?.outForDelivery || 0}
          icon={<FiSend className="w-5 h-5 text-orange-600" />}
          bg="bg-orange-100"
          note="On the way to customer"
        />
        <StatCard
          title="Delivered"
          value={stats.orderStages?.delivered || 0}
          icon={<FiCheckCircle className="w-5 h-5 text-green-600" />}
          bg="bg-green-100"
          note="Successfully delivered"
        />
      </div>

      {/* Payment Method Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <StatCard
          title="Cash on Delivery"
          value={stats.paymentMethodStats.COD}
          icon={<FaBox className="w-5 h-5 text-green-600" />}
          bg="bg-green-100"
          note="COD payments"
        />
        <StatCard
          title="Stripe"
          value={stats.paymentMethodStats.Stripe}
          icon={<SiStripe className="w-5 h-5 text-purple-600" />}
          bg="bg-purple-100"
          note="Stripe transactions"
        />
        <StatCard
          title="Razorpay"
          value={stats.paymentMethodStats.Razorpay}
          icon={<SiRazorpay className="w-5 h-5 text-blue-600" />}
          bg="bg-blue-100"
          note="Razorpay payments"
        />
      </div>
    </div>
  );
};

// Reusable StatCard component
const StatCard = ({ title, value, icon, bg, note }) => (
  <div className={`bg-white shadow-sm p-6 border border-gray-200`}>
    <div className="flex items-center justify-between">
      <h3 className="text-sm font-medium text-gray-600">{title}</h3>
      <div className={`p-2 ${bg}`}>{icon}</div>
    </div>
    <p className="mt-2 text-3xl font-bold text-gray-800">{value}</p>
    <p className="text-xs text-gray-500 mt-1">{note}</p>
  </div>
);

export default Dashboard;
