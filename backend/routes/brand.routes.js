import express from "express";
import { createBrand, deleteBrand, getBrands, updateBrand } from "../controllers/brand.controller.js";
import { protect, admin } from "../middleware/auth.middleware.js";

const router = express.Router();

router
    .route("/")
    .get(getBrands)
    .post(protect, admin, createBrand);
router
    .route("/:id")
    .put(protect, admin, updateBrand)
    .delete(protect, admin, deleteBrand);

export default router;