import express from "express";
import { addToCart, getCart, removeFromCart } from "../controllers/cart.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protect, getCart);
router.post("/add", protect, addToCart);
router.post("/remove", protect, removeFromCart); // Using POST to send product_id in body easily

export default router;
