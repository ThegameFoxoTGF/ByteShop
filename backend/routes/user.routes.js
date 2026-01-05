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
} from "../controllers/user.controller.js";

import {
    addAddress,
    getAddress,
    updateAddress,
    deleteAddress,
    getTax,
    addTax,
    updateTax,
    deleteTax,
} from "../controllers/address.controller.js";

import {
    getUserWishlist,
    addToWishlist,
    removeFromWishlist,
} from "../controllers/wishlist.controller.js";

import { protect, admin } from "../middleware/auth.middleware.js";

const router = express.Router();

router.route("/").get(protect, admin, getUsers);

router.route("/register").post(registerUser)
router.route("/login").post(authUser)
router.route("/logout").post(logoutUser)

router
    .route("/profile")
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);

router
    .route("/verify")
    .post(verifyOtp)

router
    .route("/otp")
    .post(sendOtp)

router.post("/forget", forgotPassword)
router.put("/reset-password", resetPassword)

router
    .route("/:id")
    .delete(protect, admin, deleteUser)
    .get(protect, admin, getUserById)
    .put(protect, admin, updateUser);

router
    .route("/address/shipping")
    .get(protect, getAddress)
    .post(protect, addAddress)
    
router
    .route("/address/shipping/:id")
    .put(protect, updateAddress)
    .delete(protect, deleteAddress);

router
    .route("/address/tax")
    .get(protect, getTax)
    .post(protect, addTax)

router
    .route("/address/tax/:id")
    .put(protect, updateTax)
    .delete(protect, deleteTax);

router
    .route("/wishlist")
    .get(protect, getUserWishlist)

router
    .route("/wishlist/:productId")
    .post(protect, addToWishlist)
    .delete(protect, removeFromWishlist);

export default router;
