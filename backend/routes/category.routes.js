import express from "express";
import { createCategory, deleteCategory, getAllCategories, getCategoryById, updateCategory } from "../controllers/category.controller.js";
// Assuming auth.middleware exists and exports protect, admin, employee
// If not, I'll need to check or create it. Based on prev context it existed.
import { protect, admin, employee } from "../middleware/auth.middleware.js"; 

const router = express.Router();

router.get("/", getAllCategories);
router.get("/:id", getCategoryById);

router.post("/", protect, employee, createCategory);
router.put("/:id", protect, employee, updateCategory);
router.delete("/:id", protect, admin, deleteCategory);

export default router;
