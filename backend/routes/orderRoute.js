import express from 'express'
import { verifyRazorpay, placeOrder, placeOrderStripe, approveRefund, cancelOrder, placeOrderRazorpay, allOrders, userOrders, updateStatus, verifyStripe, getDashboardStats, getFullAnalyticsStats } from '../controllers/orderController.js'
import adminAuth from '../middleware/adminAuth.js'
import authUser from '../middleware/auth.js'

const orderRouter = express.Router()

// Admin Features
orderRouter.post('/list', adminAuth, allOrders)
orderRouter.post('/status', adminAuth, updateStatus)

//Payment Features
orderRouter.post('/place', authUser, placeOrder)
orderRouter.post('/stripe', authUser, placeOrderStripe)
orderRouter.post('/razorpay', authUser, placeOrderRazorpay)

// User Feature
orderRouter.post('/userorders', authUser, userOrders)
orderRouter.post('/cancel', authUser, cancelOrder);
orderRouter.post('/approve-refund', adminAuth, approveRefund);


orderRouter.get("/dashboard-stats", adminAuth, getDashboardStats);
orderRouter.get("/analytics", adminAuth, getFullAnalyticsStats);

// Verify Payment
orderRouter.post('/verifyStripe', authUser, verifyStripe)
orderRouter.post('/verifyRazorpay', authUser, verifyRazorpay)

export default orderRouter