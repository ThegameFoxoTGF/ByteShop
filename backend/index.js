import "dotenv/config";

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { connectDB } from "./config/db.js"
import startCron from "./utils/cron.js";


//{ Routes Import }---------------------------------------------------
import userRoutes from "./routes/user.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import brandRoutes from "./routes/brand.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import productRoutes from "./routes/product.routes.js"
import orderRoutes from "./routes/order.routes.js";
import couponRoutes from "./routes/coupon.routes.js"
import adminRoutes from "./routes/admin.routes.js"

//{ Middleware }------------------------------------------------------
import { notFound, errorHandler } from "./middleware/error.middleware.js";

const PORT = process.env.PORT || 5000;

connectDB();
startCron();

const app = express();

app.use(cors({ origin: process.env.BASE_URL, credentials: true }));
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
app.use("/api/admin", adminRoutes);

//{ Middleware }------------------------------------------------------
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, "::", () =>
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ::${PORT}`)
);

export default app;
