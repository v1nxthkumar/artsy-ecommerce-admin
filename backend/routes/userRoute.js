import express from 'express';
import {
  loginUser,
  registerUser,
  adminLogin,
  googleLoginUser,
  getAllUsers,
  getUserProfile,
  getUserStats,
  updatePassword,
  updateName,
  updateEmail,
  updateAddress,
  getSavedAddress,
  deleteAddress
} from '../controllers/userController.js';
import authUser from '../middleware/auth.js';

const userRouter = express.Router();

userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.post('/admin/login', adminLogin);
userRouter.post('/google-login', googleLoginUser);

userRouter.get('/admin/users', getAllUsers);
userRouter.get('/stats', authUser, getUserStats);
userRouter.get('/me', authUser, getUserProfile);

userRouter.post("/address", authUser, updateAddress);
userRouter.get("/address", authUser, getSavedAddress);
userRouter.delete('/address/:addressId', authUser, deleteAddress);


userRouter.put('/update-password', authUser, updatePassword);
userRouter.put('/update-name', authUser, updateName);
userRouter.put('/update-email', authUser, updateEmail);

export default userRouter;
