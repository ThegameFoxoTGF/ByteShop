import express from "express";
import { protect, admin } from "../middleware/auth.middleware.js";
import { getDashboardStats, getSalesChart } from "../controllers/admin.controller.js";

const router = express.Router();

router.get("/dashboard", protect, admin, getDashboardStats);
router.get("/sales-chart", protect, admin, getSalesChart);

export default router;
