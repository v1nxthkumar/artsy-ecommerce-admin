import userModel from "../models/userModel.js";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import productModel from "../models/productModel.js";
import orderModel from "../models/orderModel.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Unified token creation for all users (admin included)
const createToken = (id, email) => {
    return jwt.sign({ id, email }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// USER LOGIN
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" });
        }

        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: "User doesn't exist" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.json({ success: false, message: "Invalid credentials" });
        }

        const token = createToken(user._id, user.email);
        return res.json({ success: true, token });
    } catch (error) {
        console.error("Login Error:", error);
        return res.json({ success: false, message: error.message });
    }
};

// USER REGISTRATION
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const exists = await userModel.findOne({ email });
        if (exists) {
            return res.json({ success: false, message: "User already exists" });
        }

        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" });
        }

        if (password.length < 8) {
            return res.json({ success: false, message: "Please enter a strong password" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new userModel({
            name,
            email,
            password: hashedPassword,
        });

        const user = await newUser.save();

        const token = createToken(user._id, user.email);
        return res.json({ success: true, token });
    } catch (error) {
        console.error("Register Error:", error);
        return res.json({ success: false, message: error.message });
    }
};

// ADMIN LOGIN
const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = createToken(null, email);
            return res.json({ success: true, token });
        } else {
            return res.json({ success: false, message: "Invalid credentials" });
        }
    } catch (error) {
        console.error("Admin Login Error:", error);
        return res.json({ success: false, message: error.message });
    }
};

// GOOGLE LOGIN
const googleLoginUser = async (req, res) => {
    try {
        const { credential } = req.body;
        if (!credential) {
            return res.status(400).json({ success: false, message: "No credential" });
        }

        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { email, name } = payload;

        if (!email) {
            return res.status(400).json({ success: false, message: "No email in Google account" });
        }

        let user = await userModel.findOne({ email });
        if (!user) {
            user = new userModel({ name, email, password: null });
            await user.save();
        }

        const token = createToken(user._id, user.email);
        return res.json({ success: true, token });

    } catch (error) {
        console.error("Google login error:", error.message);
        return res.status(500).json({ success: false, message: "Google login failed" });
    }
};

// FETCH ALL USERS (ADMIN ONLY)
const getAllUsers = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.email !== process.env.ADMIN_EMAIL) {
            return res.status(403).json({ success: false, message: "Forbidden: Not admin" });
        }

        const usersRaw = await userModel.find().select("-password");

        const usersWithDetails = await Promise.all(usersRaw.map(async (user) => {
            const userId = user._id.toString();

            // 🛒 Cart products
            const cartEntries = Object.entries(user.cartData || {});
            const cartIds = cartEntries.map(([id]) => id);
            const cartProductsRaw = await productModel.find({ _id: { $in: cartIds } });
            const cart = cartProductsRaw.map(product => ({
                ...product.toObject(),
                quantity: user.cartData[product._id],
            }));

            // ❤️ Wishlist products
            const wishlist = await productModel.find({ _id: { $in: user.wishlistData || [] } });

            // 📦 Order stats
            const orders = await orderModel.find({ userId });

            let totalOrders = 0, paidOrders = 0, cancelledOrders = 0, refundedOrders = 0;
            let lastOrderDate = null;

            orders.forEach(order => {
                totalOrders++;
                if (order.payment === true) paidOrders++;

                const statusLower = (order.status || '').toLowerCase();
                const cancellationStatus = (order.cancellationStatus || '').toLowerCase();

                if (
                    statusLower.includes('cancelled') ||
                    ['cancel requested', 'processing'].includes(cancellationStatus)
                ) {
                    cancelledOrders++;
                }

                if (order.refunded || cancellationStatus === 'refund issued') {
                    refundedOrders++;
                }

                if (!lastOrderDate || new Date(order.createdAt) > new Date(lastOrderDate)) {
                    lastOrderDate = order.createdAt;
                }
            });

            return {
                id: userId,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt,
                lastUpdated: user.updatedAt,
                cart,
                wishlist,
                addressCount: user.address?.length || 0,
                orderStats: {
                    totalOrders,
                    paidOrders,
                    cancelledOrders,
                    refundedOrders,
                    lastOrderDate
                }
            };
        }));

        return res.json({ success: true, users: usersWithDetails });
    } catch (error) {
        console.error("Fetch Users Error:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch users" });
    }
};

const getUserStats = async (req, res) => {
    try {
        const userId = req.user;

        const orders = await orderModel.find({ userId });

        let totalOrders = 0;
        let paidOrders = 0;
        let cancelledOrders = 0;
        let refundedOrders = 0;

        const paymentMethodStats = {
            COD: 0,
            Stripe: 0,
            Razorpay: 0,
            Other: 0
        };

        orders.forEach(order => {
            totalOrders++;

            // Count paid orders properly (payment true)
            if (order.payment === true) {
                paidOrders++;
            }

            // Cancelled orders:
            // Check if status contains 'cancelled' OR cancellationStatus is 'Cancel Requested' or 'Processing' (pending cancel)
            const statusLower = (order.status || '').toLowerCase();
            const cancellationStatus = (order.cancellationStatus || '').toLowerCase();

            if (
                statusLower.includes('cancelled') ||
                cancellationStatus === 'cancel requested' ||
                cancellationStatus === 'processing'
            ) {
                cancelledOrders++;
            }

            // Refunded orders:
            // Check if cancellationStatus === 'refund issued' OR refunded === true
            if (
                cancellationStatus === 'refund issued' ||
                order.refunded === true
            ) {
                refundedOrders++;
            }

            // Payment method count
            const method = order.paymentMethod;
            if (method && paymentMethodStats.hasOwnProperty(method)) {
                paymentMethodStats[method]++;
            } else {
                paymentMethodStats.Other++;
            }
        });

        res.json({
            success: true,
            stats: {
                totalOrders,
                paidOrders,
                cancelledOrders,
                refundedOrders,
                paymentMethodStats
            }
        });
    } catch (error) {
        console.error("Get User Stats Error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch user stats" });
    }
};

const getUserProfile = async (req, res) => {
    try {
        const userId = req.user;

        const user = await userModel.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Build cart
        const cartEntries = Object.entries(user.cartData || {});
        const cartIds = cartEntries.map(([id]) => id);
        const cartProductsRaw = await productModel.find({ _id: { $in: cartIds } });

        const cart = cartProductsRaw.map((product) => ({
            ...product.toObject(),
            quantity: user.cartData[product._id],
        }));

        // Build wishlist
        const wishlist = await productModel.find({ _id: { $in: user.wishlistData || [] } });

        return res.json({
            success: true,
            profile: {
                name: user.name,
                email: user.email,
                createdAt: user.createdAt,
                cart,
                wishlist,
            },
        });

    } catch (error) {
        console.error('Get Profile Error:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch profile' });
    }
};

const updatePassword = async (req, res) => {
    try {
        const userId = req.user;
        const { oldPassword, newPassword } = req.body;

        if (!newPassword || newPassword.length < 8) {
            return res.json({ success: false, message: "Password must be at least 8 characters long" });
        }

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.json({ success: false, message: "Old password is incorrect" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        user.password = hashedPassword;

        await user.save();

        res.json({ success: true, message: "Password updated successfully" });
    } catch (error) {
        console.error("Update Password Error:", error);
        res.status(500).json({ success: false, message: "Failed to update password" });
    }
};

const updateName = async (req, res) => {
    try {
        const userId = req.user;
        const { name } = req.body;

        if (!name || name.trim().length < 2) {
            return res.json({ success: false, message: "Name must be at least 2 characters long" });
        }

        const user = await userModel.findByIdAndUpdate(
            userId,
            { name },
            { new: true }
        ).select("name email");

        res.json({ success: true, message: "Name updated successfully", user });
    } catch (error) {
        console.error("Update Name Error:", error);
        res.status(500).json({ success: false, message: "Failed to update name" });
    }
};

const updateEmail = async (req, res) => {
    try {
        const userId = req.user;
        const { email } = req.body;

        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Invalid email format" });
        }

        const emailExists = await userModel.findOne({ email });
        if (emailExists && emailExists._id.toString() !== userId) {
            return res.json({ success: false, message: "Email already in use" });
        }

        const user = await userModel.findByIdAndUpdate(
            userId,
            { email },
            { new: true }
        ).select("name email");

        res.json({ success: true, message: "Email updated successfully", user });
    } catch (error) {
        console.error("Update Email Error:", error);
        res.status(500).json({ success: false, message: "Failed to update email" });
    }
};

const updateAddress = async (req, res) => {
  try {
    const userId = req.user;
    const {
      firstName,
      lastName,
      email,
      street,
      city,
      state,
      zipcode,
      country,
      phone,
    } = req.body;

    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const newAddress = {
      firstName,
      lastName,
      email,
      street,
      city,
      state,
      zipcode,
      country,
      phone,
      updatedAt: new Date(),
    };

    user.address.push(newAddress);
    await user.save();

    res.json({ success: true, message: "Address added", address: user.address });
  } catch (error) {
    console.error("Update Address Error:", error);
    res.status(500).json({ success: false, message: "Failed to update address" });
  }
};

const getSavedAddress = async (req, res) => {
  try {
    const user = await userModel.findById(req.user).select("address");
    if (!user || !user.address || user.address.length === 0) {
      return res.status(404).json({ success: false, message: "No saved addresses found" });
    }
    res.json({ success: true, addresses: user.address });
  } catch (error) {
    console.error("Get Address Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch addresses" });
  }
};

const deleteAddress = async (req, res) => {
  try {
    const userId = req.user;
    const { addressId } = req.params;

    const user = await userModel.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    user.address = user.address.filter(addr => addr._id.toString() !== addressId);
    await user.save();

    res.json({ success: true, message: "Address deleted", address: user.address });
  } catch (error) {
    console.error("Delete Address Error:", error);
    res.status(500).json({ success: false, message: "Failed to delete address" });
  }
};


export {
    loginUser,
    registerUser,
    adminLogin,
    googleLoginUser,
    getAllUsers,
    getUserStats,
    getUserProfile,
    updateEmail,
    updateName,
    updatePassword,
    updateAddress,
    getSavedAddress,
    deleteAddress
};
