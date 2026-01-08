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

//{ Middleware }------------------------------------------------------
import { notFound, errorHandler } from "./middleware/error.middleware.js";

const PORT = process.env.PORT || 5000;

connectDB();

const app = express();

app.use(cors({origin: "http://localhost:5173"}));
app.use(express.json());
app.use(cookieParser());

//{ Routes Path }-----------------------------------------------------
app.use("/api/user", userRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/brand", brandRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/cart", cartRoutes);

//{ Middleware }------------------------------------------------------
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () =>
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);

export default app;
