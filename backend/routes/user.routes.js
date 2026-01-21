import express from "express";
import {
  authUser,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  deleteUser,
  getUserById,
  updateUser,
  sendOtp,
  forgotPassword,
  verifyOtp,
  resetPassword,
  updateUserPassword
} from "../controllers/user.controller.js";

import {
  addAddress,
  getAddress,
  updateAddress,
  deleteAddress,
} from "../controllers/address.controller.js";

import {
  getUserWishlist,
  addToWishlist,
  removeFromWishlist,
} from "../controllers/wishlist.controller.js";

import { protect, admin } from "../middleware/auth.middleware.js";

const router = express.Router();

router.route("/").get(protect, admin, getUsers);

router.route("/register").post(registerUser);
router.route("/login").post(authUser);
router.route("/logout").post(protect, logoutUser);

router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

router.route("/profile/password").put(protect, updateUserPassword);

router.route("/verify").post(verifyOtp);

router.route("/otp").post(sendOtp);

router.post("/forget", forgotPassword);
router.put("/forget-reset", resetPassword);


router
  .route("/address/shipping")
  .get(protect, getAddress)
  .post(protect, addAddress);

router
  .route("/address/shipping/:id")
  .put(protect, updateAddress)
  .delete(protect, deleteAddress);

router.route("/wishlist").get(protect, getUserWishlist);

router
  .route("/wishlist/:productId")
  .post(protect, addToWishlist)
  .delete(protect, removeFromWishlist);

router
  .route("/:id")
  .delete(protect, admin, deleteUser)
  .get(protect, admin, getUserById)
  .put(protect, admin, updateUser);

export default router;
