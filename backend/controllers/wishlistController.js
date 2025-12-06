import mongoose from "mongoose";
import userModel from "../models/userModel.js";
import productModel from "../models/productModel.js";

// ✅ Add product to wishlist
const addToWishlist = async (req, res) => {
  try {
    const userId = req.user; // ✅ From middleware
    const { itemId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ success: false, message: "Invalid userId or itemId" });
    }

    const userData = await userModel.findById(userId);
    if (!userData) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    let wishlistData = userData.wishlistData || [];
    const isAlreadyInWishlist = wishlistData.some(id => id.toString() === itemId);

    if (!isAlreadyInWishlist) {
      wishlistData.push(new mongoose.Types.ObjectId(itemId));
      await userModel.findByIdAndUpdate(userId, { wishlistData });
    }

    res.json({ success: true, message: "Added to Wishlist", wishlistData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Remove product from wishlist
const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user; // ✅ From middleware
    const { itemId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ success: false, message: "Invalid userId or itemId" });
    }

    const userData = await userModel.findById(userId);
    if (!userData) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    let wishlistData = userData.wishlistData || [];
    wishlistData = wishlistData.filter(id => id.toString() !== itemId);

    await userModel.findByIdAndUpdate(userId, { wishlistData });

    res.json({ success: true, message: "Removed from Wishlist", wishlistData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get user wishlist with full product info
const getUserWishlist = async (req, res) => {
  try {
    const userId = req.user; // ✅ From middleware

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid userId" });
    }

    const userData = await userModel.findById(userId);
    if (!userData) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const wishlistIds = userData.wishlistData || [];
    const wishlistData = await productModel.find({ _id: { $in: wishlistIds } });

    res.json({ success: true, wishlistData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export { addToWishlist, removeFromWishlist, getUserWishlist };
