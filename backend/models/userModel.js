import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  street: String,
  city: String,
  state: String,
  zipcode: String,
  country: String,
  phone: String,
  updatedAt: { type: Date, default: Date.now },
}, { _id: true });

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: false, // allow null/undefined for Google accounts
  },
  isGoogleUser: {
    type: Boolean,
    default: false,
  },
  cartData: {
    type: Object,
    default: {},
  },
  wishlistData: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "product",
    default: [],
  },
  address: [addressSchema],
}, {
  minimize: false,
});

const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;
