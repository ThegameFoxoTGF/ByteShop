import express from "express";
import { createOrder, approveOrder, updateOrdertoPaid } from "../controllers/order.controller.js";
import { protect, staff, admin } from "../middleware/auth.middleware.js";

const router = express.Router();

router.route("/").post(protect, createOrder);
router.route("/:id/approve").put(protect, staff, approveOrder);
router.route("/:id/pay").put(protect, updateOrdertoPaid);

export default router;