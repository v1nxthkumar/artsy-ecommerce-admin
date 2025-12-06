import orderModel from "../models/orderModel.js"
import userModel from "../models/userModel.js"
import Stripe from 'stripe'
import razorpay from 'razorpay'

// global variables
const currency = 'inr'
const deliveryCharge = 50

// gateway initalize
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const razorpayInstance = new razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})

// Placing orders using COD method
const placeOrder = async (req, res) => {
  try {
    const userId = req.user;
    const { items, amount, address } = req.body;

    const newOrder = new orderModel({
      userId,
      items,
      address,
      amount,
      paymentMethod: "COD",
      payment: false,
      date: Date.now()
    });

    await newOrder.save();
    await userModel.findByIdAndUpdate(userId, { cartData: {} });

    res.json({ success: true, message: "Order Placed" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Placing orders using Stripe method
const placeOrderStripe = async (req, res) => {
  try {
    const userId = req.user;
    const { items, amount, address } = req.body;
    const { origin } = req.headers;

    const newOrder = new orderModel({
      userId,
      items,
      address,
      amount,
      paymentMethod: "Stripe",
      payment: false,
      date: Date.now()
    });

    await newOrder.save();

    const line_items = items.map(item => ({
      price_data: {
        currency,
        product_data: { name: item.name },
        unit_amount: item.price * 100
      },
      quantity: item.quantity
    }));

    line_items.push({
      price_data: {
        currency,
        product_data: { name: "Delivery Charges" },
        unit_amount: deliveryCharge * 100
      },
      quantity: 1
    });

    const session = await stripe.checkout.sessions.create({
      success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,
      cancel_url: `${origin}/verify?success=false&orderId=${newOrder._id}`,
      line_items,
      mode: "payment"
    });

    res.json({ success: true, session_url: session.url });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Verify Stripe
const verifyStripe = async (req, res) => {
  try {
    const userId = req.user;
    const { orderId, success } = req.body;

    if (success === "true") {
      await orderModel.findByIdAndUpdate(orderId, { payment: true });
      await userModel.findByIdAndUpdate(userId, { cartData: {} });
      res.json({ success: true });
    } else {
      await orderModel.findByIdAndDelete(orderId);
      res.json({ success: false });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Placing orders using Razorpay method
const placeOrderRazorpay = async (req, res) => {
  try {
    const userId = req.user;
    const { items, amount, address } = req.body;

    const newOrder = new orderModel({
      userId,
      items,
      address,
      amount,
      paymentMethod: "Razorpay",
      payment: false,
      date: Date.now()
    });

    await newOrder.save();

    const options = {
      amount: amount * 100,
      currency: currency.toUpperCase(),
      receipt: newOrder._id.toString()
    };

    razorpayInstance.orders.create(options, (error, order) => {
      if (error) return res.json({ success: false, message: error });
      res.json({ success: true, order });
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Verify Razorpay
const verifyRazorpay = async (req, res) => {
  try {
    const userId = req.user;
    const { razorpay_order_id } = req.body;

    const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);

    if (orderInfo.status === "paid") {
      await orderModel.findByIdAndUpdate(orderInfo.receipt, { payment: true });
      await userModel.findByIdAndUpdate(userId, { cartData: {} });
      res.json({ success: true, message: "Payment Successful" });
    } else {
      res.json({ success: false, message: "Payment Failed" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// All orders data for admin panel
const allOrders = async (req, res) => {
  try {

    const orders = await orderModel.find({})
    res.json({ success: true, orders })

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message })
  }
}

// User Order Data For Frontend
const userOrders = async (req, res) => {
  try {
    const userId = req.user;
    const orders = await orderModel.find({ userId });
    res.json({ success: true, orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Update order status from admin panel
const updateStatus = async (req, res) => {
  try {

    const { orderId, status } = req.body
    await orderModel.findByIdAndUpdate(orderId, { status })
    res.json({ success: true, message: 'Status Updated' })

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message })
  }
}

// Admin Dashboard & Analytics Stats
const getDashboardStats = async (req, res) => {
  try {
    const orders = await orderModel.find({});

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    let stats = {
      totalOrders: 0,
      paidOrders: 0,
      totalRevenue: 0,
      todayRevenue: 0,
      pendingPayments: 0,
      processingOrders: 0,
      completedOrders: 0,
      paymentMethodStats: {
        COD: 0,
        Stripe: 0,
        Razorpay: 0,
      },
      orderStages: {
        placed: 0,
        packing: 0,
        shipping: 0,
        outForDelivery: 0,
        delivered: 0,
        cancelled: 0,
      },
    };

    orders.forEach(order => {
      stats.totalOrders++;

      // Payment status
      if (order.payment) {
        stats.paidOrders++;
        stats.totalRevenue += order.amount;

        if (new Date(order.date).getTime() >= startOfToday) {
          stats.todayRevenue += order.amount;
        }
      } else {
        stats.pendingPayments++;
      }

      // Status-based stats
      if (order.status) {
        const status = order.status.toLowerCase();

        if (status.includes("processing")) stats.processingOrders++;
        if (status.includes("completed") || status.includes("delivered")) stats.completedOrders++;

        if (status.includes("placed")) stats.orderStages.placed++;
        if (status.includes("packing")) stats.orderStages.packing++;
        if (status.includes("shipping")) stats.orderStages.shipping++;
        if (status.includes("out for delivery")) stats.orderStages.outForDelivery++;
        if (status.includes("delivered")) stats.orderStages.delivered++;
      }

      // Payment methods
      if (order.paymentMethod) {
        const method = order.paymentMethod;
        if (stats.paymentMethodStats[method] !== undefined) {
          stats.paymentMethodStats[method]++;
        }
      }
    });

    res.json({ success: true, stats });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch dashboard stats" });
  }
};

const getFullAnalyticsStats = async (req, res) => {
  try {
    const orders = await orderModel.find({}).lean();
    const users = await userModel.find({}).lean();

    const IST_OFFSET = 5.5 * 60 * 60 * 1000;
    const now = new Date();
    const istNow = new Date(now.getTime() + IST_OFFSET);

    const startOfTodayIST = new Date(istNow.getFullYear(), istNow.getMonth(), istNow.getDate()).getTime() - IST_OFFSET;
    const endOfTodayIST = startOfTodayIST + 86400000;
    const startOfYesterdayIST = startOfTodayIST - 86400000;
    const endOfYesterdayIST = startOfTodayIST;

    const monthlyRevenueMap = {};
    const productSales = {};
    const userOrderCount = {};
    const dateCountMap = {};
    let totalItems = 0;

    const stats = {
      totalOrders: 0,
      paidOrders: 0,
      unpaidOrders: 0,
      totalRevenue: 0,
      todayRevenue: 0,
      yesterdayRevenue: 0,
      avgOrderValue: 0,
      avgItemsPerOrder: 0,
      processingOrders: 0,
      completedOrders: 0,
      failedOrders: 0,
      cancelledOrders: 0,
      orderStages: {
        placed: 0,
        packing: 0,
        shipping: 0,
        outForDelivery: 0,
        delivered: 0,
        cancelled: 0,
        failed: 0
      },
      paymentMethodStats: {
        COD: 0,
        Stripe: 0,
        Razorpay: 0
      },
      mostUsedPaymentMethod: "N/A",
      uniqueBuyers: 0,
      repeatBuyers: 0,
      topProducts: [],
      monthlyRevenue: [],
      dailyOrders: [],
      abandonedCarts: 0,
      conversionRate: 0
    };

    const updateOrderStageStats = (status = "") => {
      const s = status.toLowerCase();
      if (s.includes("placed")) stats.orderStages.placed++;
      if (s.includes("packing")) stats.orderStages.packing++;
      if (s.includes("shipping")) stats.orderStages.shipping++;
      if (s.includes("out for delivery")) stats.orderStages.outForDelivery++;
      if (s.includes("delivered")) stats.orderStages.delivered++;
    };

    for (const order of orders) {
      stats.totalOrders++;

      const orderDate = order.date ? new Date(order.date) : new Date();
      const orderTimestamp = orderDate.getTime();
      const monthKey = `${orderDate.getUTCFullYear()}-${String(orderDate.getUTCMonth() + 1).padStart(2, '0')}`;
      const localDate = new Date(orderTimestamp + IST_OFFSET).toISOString().slice(0, 10);
      dateCountMap[localDate] = (dateCountMap[localDate] || 0) + 1;

      const amount = typeof order.amount === 'number' ? order.amount : parseFloat(order.amount || 0);

      if (order.userId) {
        const userId = order.userId.toString();
        userOrderCount[userId] = (userOrderCount[userId] || 0) + 1;
      }

      if (order.payment) {
        stats.paidOrders++;
        stats.totalRevenue += amount;

        if (orderTimestamp >= startOfTodayIST && orderTimestamp < endOfTodayIST) {
          stats.todayRevenue += amount;
        }

        if (orderTimestamp >= startOfYesterdayIST && orderTimestamp < endOfYesterdayIST) {
          stats.yesterdayRevenue += amount;
        }

        monthlyRevenueMap[monthKey] = (monthlyRevenueMap[monthKey] || 0) + amount;
      } else {
        stats.unpaidOrders++;
      }

      const status = order.status || "";
      if (status.toLowerCase().includes("processing")) stats.processingOrders++;
      if (status.toLowerCase().includes("completed") || status.toLowerCase().includes("delivered")) {
        stats.completedOrders++;
      }
      if (status.toLowerCase().includes("failed")) stats.failedOrders++;
      if (status.toLowerCase().includes("cancelled")) stats.cancelledOrders++;

      updateOrderStageStats(status);

      const method = order.paymentMethod;
      if (method && stats.paymentMethodStats[method] !== undefined) {
        stats.paymentMethodStats[method]++;
      }

      for (const item of order.items || []) {
        if (!item.name || !item.quantity) continue;
        productSales[item.name] = (productSales[item.name] || 0) + item.quantity;
        totalItems += item.quantity;
      }
    }

    // Unique and repeat buyers
    const orderCounts = Object.values(userOrderCount);
    stats.uniqueBuyers = orderCounts.length;
    stats.repeatBuyers = orderCounts.filter(count => count > 1).length;

    // Top products
    stats.topProducts = Object.entries(productSales)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, quantity]) => ({ name, quantity }));

    // Monthly revenue
    stats.monthlyRevenue = Object.entries(monthlyRevenueMap)
      .sort(([a], [b]) => new Date(a) - new Date(b))
      .map(([month, total]) => ({ month, total }));

    // Average order value
    stats.avgOrderValue = stats.paidOrders
      ? parseFloat((stats.totalRevenue / stats.paidOrders).toFixed(2))
      : 0;

    // Average items per order
    stats.avgItemsPerOrder = stats.totalOrders
      ? (totalItems / stats.totalOrders).toFixed(2)
      : 0;

    // Most used payment method
    stats.mostUsedPaymentMethod = Object.entries(stats.paymentMethodStats)
      .reduce((a, b) => (b[1] > a[1] ? b : a), ["N/A", 0])[0];

    // Abandoned carts
    stats.abandonedCarts = users.filter(
      (u) => u.cartData && Object.keys(u.cartData).length > 0
    ).length;

    // Conversion rate
    const totalVisitors = stats.abandonedCarts + stats.totalOrders;
    stats.conversionRate = totalVisitors
      ? ((stats.totalOrders / totalVisitors) * 100).toFixed(2)
      : 0;

    // Last 7 days daily order trend
    const last7DaysOrders = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(Date.now() + IST_OFFSET - i * 86400000)
        .toISOString()
        .slice(0, 10);
      return { date, count: dateCountMap[date] || 0 };
    }).reverse();

    stats.dailyOrders = last7DaysOrders;

    res.json({ success: true, stats });
  } catch (error) {
    console.error("Analytics Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch analytics data" });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const userId = req.user;
    const { orderId, reason } = req.body;

    const order = await orderModel.findOne({ _id: orderId, userId });
    if (!order) return res.json({ success: false, message: "Order not found" });

    if (
      order.status.toLowerCase().includes('cancelled') ||
      order.cancellationStatus === 'Refund Issued'
    ) {
      return res.json({ success: false, message: "Order already cancelled" });
    }

    // Step 1: Request cancel
    order.cancellationStatus = 'Cancel Requested';
    order.cancellationReason = reason;
    await order.save();

    // Step 2: Simulate processing delay (no refund yet)
    setTimeout(async () => {
      const o = await orderModel.findById(orderId);
      if (!o || o.cancellationStatus !== 'Cancel Requested') return;

      o.cancellationStatus = 'Processing';
      await o.save();
    }, 3000);

    return res.json({ success: true, message: "Cancellation initiated" });
  } catch (error) {
    console.error("Cancel Order Error:", error);
    return res.json({ success: false, message: error.message });
  }
};

const approveRefund = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await orderModel.findById(orderId);

    if (!order || order.cancellationStatus !== 'Processing') {
      return res.status(400).json({ success: false, message: 'Order not ready for refund' });
    }

    // COD: No actual refund needed
    if (order.paymentMethod === 'COD') {
      order.status = 'Cancelled';
      order.cancellationStatus = 'Refund Issued';
      await order.save();
      return res.json({ success: true, message: 'COD order marked as cancelled' });
    }

    const fiveMin = 5 * 60 * 1000;
    const dateFrom = order.date - fiveMin;
    const dateTo = order.date + fiveMin;

    // Stripe Refund
    if (order.paymentMethod === 'Stripe' && order.payment) {
      const paymentIntents = await stripe.paymentIntents.list({
        limit: 5,
        created: {
          gte: Math.floor(dateFrom / 1000),
          lte: Math.floor(dateTo / 1000)
        }
      });

      const matchingIntent = paymentIntents.data.find(pi =>
        pi.amount_received === order.amount * 100
      );

      if (matchingIntent) {
        await stripe.refunds.create({ payment_intent: matchingIntent.id });
        order.status = 'Cancelled';
        order.refunded = true;
        order.cancellationStatus = 'Refund Issued';
        await order.save();
        return res.json({ success: true, message: 'Stripe refund issued' });
      } else {
        console.warn("No matching Stripe payment intent found.");
      }
    }

    // Razorpay Refund
    if (order.paymentMethod === 'Razorpay' && order.payment) {
      const razorpayOrders = await razorpayInstance.orders.all({
        from: Math.floor(dateFrom / 1000),
        to: Math.floor(dateTo / 1000),
        count: 20
      });

      const matchingOrder = razorpayOrders.items.find(o => o.receipt === order._id.toString());

      if (matchingOrder && matchingOrder.status === "paid") {
        const payments = await razorpayInstance.payments.all({
          from: Math.floor(dateFrom / 1000),
          to: Math.floor(dateTo / 1000),
          count: 20
        });

        const matchingPayment = payments.items.find(p => p.order_id === matchingOrder.id);

        if (matchingPayment) {
          await razorpayInstance.payments.refund(matchingPayment.id);
          order.status = 'Cancelled';
          order.refunded = true;
          order.cancellationStatus = 'Refund Issued';
          await order.save();
          return res.json({ success: true, message: 'Razorpay refund issued' });
        } else {
          console.warn("Matching Razorpay payment not found.");
        }
      } else {
        console.warn("Matching Razorpay order not found or not paid.");
      }
    }

    return res.status(500).json({ success: false, message: 'Refund failed or payment not found' });

  } catch (err) {
    console.error("Approve refund error:", err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};


export {
  verifyRazorpay,
  placeOrder,
  placeOrderStripe,
  placeOrderRazorpay,
  allOrders,
  userOrders,
  updateStatus,
  verifyStripe,
  cancelOrder,
  approveRefund,
  getDashboardStats,
  getFullAnalyticsStats
}