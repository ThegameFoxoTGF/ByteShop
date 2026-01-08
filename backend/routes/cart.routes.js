import express from "express";
import {
    getUserCart,
    addToCart,
    updateCart,
    removeItemFromCart,
} from "../controllers/cart.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router
    .route("/")
    .get(protect, getUserCart)
    .post(protect, addToCart);

router
    .route("/:productId")
    .put(protect, updateCart)
    .delete(protect, removeItemFromCart);

export default router;
