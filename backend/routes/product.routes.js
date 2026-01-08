import express from "express";
import {
    getProducts,
    getProductById,
    getProductBySlug,
    getProductBySku,
    createProduct,
    updateProduct,
    deleteProduct
} from "../controllers/product.controller.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/")
    .get(getProducts)
    .post(protect, admin, createProduct);

router.route("/:id")
    .get(getProductById)
    .put(protect, admin, updateProduct)
    .delete(protect, admin, deleteProduct);

router.route("/:slug")
    .get(getProductBySlug);

router.route("/:sku")
    .get(getProductBySku);

export default router;
