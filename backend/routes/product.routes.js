import express from "express";
import {
  getProducts,
  getCategoryFilters,
  getCategoryBrands,
  getProductById,
  getProductBySlug,
  getProductBySku,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller.js";
import { protect, admin } from "../middleware/auth.middleware.js";

const router = express.Router();

router.route("/").get(getProducts).post(protect, admin, createProduct);

router.get("/all", protect, admin, getProducts);

router.get("/filters/:categoryId", getCategoryFilters);
router.get("/brands/:categoryId", getCategoryBrands);

router
  .route("/:id")
  .get(getProductById)
  .put(protect, admin, updateProduct)
  .delete(protect, admin, deleteProduct);

router.route("/slug/:slug").get(getProductBySlug);

router.route("/:sku").get(getProductBySku);

export default router;
