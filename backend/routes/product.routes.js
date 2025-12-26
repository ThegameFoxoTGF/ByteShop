import express from "express";
import { createProduct, deleteProduct, getAllProducts, getProductById, updateProduct } from "../controllers/product.controller.js";
import { protect, admin, employee } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", getAllProducts);
router.get("/:id", getProductById);

router.post("/", protect, employee, createProduct);
router.put("/:id", protect, employee, updateProduct);
router.delete("/:id", protect, admin, deleteProduct);

export default router;
