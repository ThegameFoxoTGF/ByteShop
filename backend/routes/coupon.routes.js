import express from "express";
import { createCoupon, getAllCoupons, verifyCoupon } from "../controllers/coupon.controller.js";
import { protect, admin, employee } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protect, employee, getAllCoupons);
router.post("/", protect, admin, createCoupon);
router.post("/verify", protect, verifyCoupon);

export default router;
