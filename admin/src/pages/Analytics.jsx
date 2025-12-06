import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend,
  LineChart, Line,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  AreaChart, Area,
  ScatterChart, Scatter
} from "recharts";
import { useNavigate } from "react-router-dom";

const COLORS = ["#10b981", "#6366f1", "#f59e0b", "#ef4444", "#3b82f6", "#8b5cf6"];

const Analytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/order/analytics`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.data.success) {
          setStats(res.data.stats);
        } else {
          setError("Failed to load analytics data.");
        }
      } catch (err) {
        if (err.response?.status === 403 || err.response?.status === 401) {
          setError("Access denied or unauthorized.");
          setTimeout(() => navigate("/login"), 2000);
        } else {
          setError("Something went wrong while loading analytics.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div className="p-10 text-gray-600">Loading analytics...</div>;
  if (error) return <div className="p-10 text-red-600 font-semibold">{error}</div>;

  const avgOrderValue = stats.avgOrderValue.toFixed(2);
  const successRate = ((stats.paidOrders / stats.totalOrders) * 100).toFixed(1);
  const fulfillmentRate = ((stats.completedOrders / stats.totalOrders) * 100).toFixed(1);

  const stageLabels = ["Placed", "Packing", "Shipping", "Out for Delivery", "Delivered"];
  const stageKeys = ["placed", "packing", "shipping", "outForDelivery", "delivered"];
  const stageColors = ["#991b1b", "#ef4444", "#f97316", "#facc15", "#84cc16"];

  const paymentMethodData = Object.entries(stats.paymentMethodStats || {}).map(([method, count]) => ({
    name: method,
    value: count,
  }));

  const revenueLineData = [
    { date: "Yesterday", revenue: Number(stats.yesterdayRevenue || 0) },
    { date: "Today", revenue: Number(stats.todayRevenue || 0) },
  ];

  const monthlyRevenueData = stats.monthlyRevenue.map(({ month, total }) => {
    const [year, monthNum] = month.split("-");
    const monthLabel = new Date(year, monthNum - 1).toLocaleString("default", {
      month: "short",
      year: "numeric",
    });
    return { month: monthLabel, revenue: total };
  });

  const renderPaymentLegend = ({ payload }) => {
    const total = payload.reduce((sum, entry) => sum + entry.payload.value, 0);
    return (
      <div className="flex flex-wrap font-medium justify-center gap-4 mt-4 text-sm">
        {payload.map((entry, index) => {
          const percent = ((entry.payload.value / total) * 100);
          return (
            <div key={`legend-${index}`} className="flex items-center gap-2">
              <span
                className="inline-block w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span style={{ color: entry.color }}>
                {entry.payload.name} {percent}%
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6 md:p-10">
      <div>
        <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">Overall Analytics</h2>
        <p className="text-gray-500 mt-1 mb-8">Track orders, revenue, and customer activity.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">

        {/* Order Progress */}
        <ChartBlock title="Order Progress">
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 w-full">
            <PieChart width={300} height={300}>
              <Pie
                data={stageLabels.map((name, i) => ({
                  name,
                  value: stats.orderStages?.[stageKeys[i]] || 0,
                }))}
                cx="50%" cy="50%"
                innerRadius={60} outerRadius={130}
                startAngle={360} endAngle={0}
                dataKey="value"
              >
                {stageLabels.map((_, i) => (
                  <Cell
                    key={i}
                    fill={
                      (stats.orderStages?.[stageKeys[i]] || 0) > 0
                        ? stageColors[i]
                        : "#e5e7eb"
                    }
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} orders`, ""]} />
            </PieChart>

            <div className="flex flex-col gap-3 w-full max-w-xs">
              {stageLabels.map((stage, i) => {
                const key = stageKeys[i];
                const count = stats.orderStages?.[key] || 0;
                const percent = stats.totalOrders > 0
                  ? ((count / stats.totalOrders) * 100).toFixed(1)
                  : "0.0";
                const isActive = count > 0;
                return (
                  <div
                    key={i}
                    className={`flex items-center justify-between text-sm mr-10 p-2 rounded font-medium ${isActive
                      ? ""
                      : "text-gray-400 bg-gray-100"
                      }`}
                    style={{
                      color: isActive ? stageColors[i] : undefined,
                      backgroundColor: isActive ? `${stageColors[i]}20` : undefined,
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: count > 0 ? stageColors[i] : "#e5e7eb" }}
                      />
                      <span>{stage}</span>
                    </div>
                    <span>{percent}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </ChartBlock>

        {/* KPIs */}
        <ChartBlock title="Order KPIs Overview">
          <RadarChart outerRadius={100} width={500} height={300} data={[
            { metric: "Fulfillment", value: Number(fulfillmentRate) },
            { metric: "Payment Success", value: Number(successRate) },
            { metric: "Abandoned Carts", value: stats.abandonedCarts },
            { metric: "Repeat Buyers", value: stats.repeatBuyers },
            { metric: "Unique Buyers", value: stats.uniqueBuyers },
          ]}>
            <PolarGrid />
            <PolarAngleAxis dataKey="metric" />
            <PolarRadiusAxis />
            <Radar name="Performance" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.6} />
            <Tooltip />
          </RadarChart>
        </ChartBlock>

        {/* Today vs Yesterday */}
        <ChartBlock title="Today vs Yesterday Revenue">
          <AreaChart width={500} height={300} data={revenueLineData}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4ade80" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" />
            <YAxis width={80} />
            <CartesianGrid strokeDasharray="3 3" />
            <Tooltip />
            <Area type="monotone" dataKey="revenue" stroke="#4ade80" fillOpacity={1} fill="url(#colorRevenue)" />
          </AreaChart>
        </ChartBlock>

        {/* Daily Orders */}
        <ChartBlock title="Daily Order Trend">
          <LineChart width={500} height={300} data={stats.dailyOrders}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#f97316" />
          </LineChart>
        </ChartBlock>

        {/* Monthly Revenue */}
        <ChartBlock title="Monthly Revenue Trend">
          <BarChart width={500} height={300} data={monthlyRevenueData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="revenue" fill="#3b82f6" />
          </BarChart>
        </ChartBlock>

        {/* Payment Methods */}
        <ChartBlock title="Payment Method Distribution">
          <PieChart width={500} height={300}>
            <Pie
              data={paymentMethodData}
              cx="50%" cy="50%"
              innerRadius={40}
              outerRadius={120}
              paddingAngle={5}
              dataKey="value"
              isAnimationActive={true}
              label={false} // Hide chart labels
            >
              {paymentMethodData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend content={renderPaymentLegend} />
          </PieChart>
        </ChartBlock>

        {/* Buyer Breakdown */}
        <ChartBlock title="Buyer Type Breakdown">
          <PieChart width={500} height={300}>
            <Pie
              data={[
                { name: "Repeat Buyers", value: stats.repeatBuyers },
                { name: "Unique Buyers", value: stats.uniqueBuyers },
              ]}
              cx="50%" cy="50%" outerRadius={100} label dataKey="value"
            >
              <Cell fill="#34d399" />
              <Cell fill="#f59e0b" />
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ChartBlock>

        {/* Buyer Engagement */}
        <ChartBlock title="Buyer Engagement Overview">
          <ScatterChart width={500} height={300}>
            <CartesianGrid />
            <XAxis type="number" dataKey="repeatBuyers" name="Repeat Buyers" />
            <YAxis type="number" dataKey="uniqueBuyers" name="Unique Buyers" />
            <Tooltip />
            <Scatter
              name="Buyers"
              data={[{ repeatBuyers: stats.repeatBuyers, uniqueBuyers: stats.uniqueBuyers }]}
              fill="#f97316"
            />
          </ScatterChart>
        </ChartBlock>
      </div>
    </div>
  );
};

const ChartBlock = ({ title, children }) => (
  <div className="bg-white shadow-sm p-4">
    <h3 className="text-lg font-semibold text-gray-700 mb-4">{title}</h3>
    <div className="flex justify-center w-full">{children}</div>
  </div>
);

export default Analytics;
