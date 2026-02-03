import express from "express";
import {
    createOrder,
    getAllOrders,
    getByOrderId,
    updateOrderToPaid,
    updateOrderAddress,
    cancelOrder,
    updateOrderStatus,
    confirmOrderReceived
} from "../controllers/order.controller.js";
import { protect, admin } from "../middleware/auth.middleware.js";

const router = express.Router();

router.route("/").post(protect, createOrder);
router.route("/").get(protect, getAllOrders);
router.route("/:id").get(protect, getByOrderId);
router.route("/:id/pay").put(protect, updateOrderToPaid);
router.route("/:id/address").put(protect, updateOrderAddress);
router.route("/:id/cancel").put(protect, cancelOrder);
router.route("/:id/status").put(protect, admin, updateOrderStatus);
router.route("/:id/received").put(protect, confirmOrderReceived);

export default router;