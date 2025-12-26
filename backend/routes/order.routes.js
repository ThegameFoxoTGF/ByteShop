import express from "express";
import { createOrder, getOrders, updateOrder } from "../controllers/order.controller.js";
import { protect, admin, employee } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protect, createOrder);
router.get("/", protect, getOrders);
router.put("/:id", protect, employee, updateOrder); // Employee can update status

export default router;
