import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

import { connectDB } from "./config/db.js"

//--------------------------------------------------------------------
//Routes Import
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import productRoutes from "./routes/product.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import orderRoutes from "./routes/order.routes.js";
import couponRoutes from "./routes/coupon.routes.js";


//--------------------------------------------------------------------

const PORT = process.env.PORT || 5000;
const app = express();

app.use(cors({origin: "http://localhost:5173"}));
app.use(express.json());

//--------------------------------------------------------------------
//Routes Path

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/product", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/coupon", couponRoutes);

//--------------------------------------------------------------------

connectDB();

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

export default app;
