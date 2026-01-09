import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { connectDB } from "./config/db.js"

//{ Routes Import }---------------------------------------------------
import userRoutes from "./routes/user.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import brandRoutes from "./routes/brand.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import productRoutes from "./routes/product.routes.js"
import orderRoutes from "./routes/order.routes.js";
import couponRoutes from "./routes/coupon.routes.js"

//{ Middleware }------------------------------------------------------
import { notFound, errorHandler } from "./middleware/error.middleware.js";

const PORT = process.env.PORT || 5000;

connectDB();

const app = express();

app.use(cors({origin: "http://localhost:5173", credentials: true}));
app.use(express.json());
app.use(cookieParser());

//{ Routes Path }-----------------------------------------------------
app.use("/api/user", userRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/brand", brandRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/product", productRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/coupon", couponRoutes);

//{ Middleware }------------------------------------------------------
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () =>
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);

export default app;
