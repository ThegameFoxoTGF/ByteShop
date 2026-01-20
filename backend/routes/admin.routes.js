import express from "express";
import { protect, admin } from "../middleware/auth.middleware.js";
import { getDashboardStats } from "../controllers/admin.controller.js";

const router = express.Router();

router.get("/dashboard", protect, admin, getDashboardStats);

export default router;
