import express from "express";
import {
    checkCoupon,
    createCoupon,
    getCoupons,
    getCouponById,
    updateCoupon,
    deleteCoupon
} from "../controllers/coupon.controller.js";
import { protect, admin } from "../middleware/auth.middleware.js";

const router = express.Router();

router.route("/check").post(protect, checkCoupon);

router.route("/")
    .get(protect, admin, getCoupons)
    .post(protect, admin, createCoupon);

router.route("/:id")
    .get(protect, admin, getCouponById)
    .put(protect, admin, updateCoupon)
    .delete(protect, admin, deleteCoupon);

export default router;
