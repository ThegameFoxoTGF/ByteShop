import express from "express";
import { createUser, deleteUser, getAllUsers, getUserById, updateUser, updateUserProfile } from "../controllers/user.controller.js";
import { protect, admin, employee } from "../middleware/auth.middleware.js";

const router = express.Router();

// Self Profile
router.put("/profile", protect, updateUserProfile);

// Admin Routes
router.get("/", protect, admin, getAllUsers);
router.post("/", protect, admin, createUser); // Create employee/admin
router.get("/:id", protect, admin, getUserById);
router.put("/:id", protect, admin, updateUser);
router.delete("/:id", protect, admin, deleteUser);

export default router;
