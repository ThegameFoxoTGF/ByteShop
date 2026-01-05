import express from "express";
import { createProduct, 
    deleteProduct, 
    getProducts, 
    getProductById, 
    updateProduct 
} from "../controllers/product.controller.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();